import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MessageService } from 'src/utils/message.utils';
import { UtilService } from 'src/utils/utils.utils';
import { JwtService } from '@nestjs/jwt';
import {
  CompleteAccountRegistrationDto,
  CreateTransactionalPin,
  LoginDto,
  RegisterAccountDto,
  VerifyAccountDto,
  updateAccountPinDto,
} from './dto/auth.dto';
import { ApiResponse } from 'src/common/types/response.types';
import { hash, verify } from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private messageService: MessageService,
    private utilService: UtilService,
  ) {}

  async registerAccount(dto: RegisterAccountDto): Promise<ApiResponse> {
    try {
      const accountExists = await this.prismaService.account.findFirst({
        where: { mobileNumber: dto.mobileNumber },
      });

      if (accountExists) {
        throw new HttpException(
          'User with mobile number already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      // generate otp and send to user
      const otp = this.utilService.generateOtp();

      const parsesedMobileNumber = this.utilService.parseMobileNumber(
        dto.mobileNumber,
      );
      await this.messageService.sendTextMessage(
        `${dto.countryCode}${parsesedMobileNumber}`,
        `Your mobile verification otp is ${otp}`,
      );

      // sign otp for 10 minutes
      const token = await this.jwtService.signAsync(
        { otp },
        { expiresIn: '10m' },
      );

      const account = await this.prismaService.account
        .create({
          data: { mobileNumber: dto.mobileNumber },
        })
        .then(async (account) => {
          await this.prismaService.token.create({
            data: {
              token: token,
              account: { connect: { id: account.id } },
            },
          });
          return account;
        });

      return {
        message: 'Verification token sent',
        data: account,
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resendVerificationOtp(accountId: string): Promise<ApiResponse> {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { id: accountId },
      });

      const otp = this.utilService.generateOtp();

      const parsesedMobileNumber = this.utilService.parseMobileNumber(
        account.mobileNumber,
      );
      await this.messageService.sendTextMessage(
        `${account.countryCode}${parsesedMobileNumber}`,
        `Your mobile verification otp is ${otp}`,
      );

      const token = await this.jwtService.signAsync(
        { otp },
        { expiresIn: '10m' },
      );

      await this.prismaService.token.update({
        where: { accountId: account.id },
        data: { token: token },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Verification token resent',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkAfripayTagExists(afrpayTag: string): Promise<ApiResponse> {
    try {
      const afrpayTagExists = await this.prismaService.account.findFirst({
        where: { afripayTag: afrpayTag },
      });
      if (afrpayTagExists) {
        throw new HttpException(
          'Afripay tag already in use',
          HttpStatus.BAD_REQUEST,
        );
      }

      return { statusCode: HttpStatus.OK, message: 'Afripay tag available' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyAccount(dto: VerifyAccountDto): Promise<ApiResponse> {
    try {
      const token = await this.prismaService.token.findFirst({
        where: { account: { id: dto.accountId } },
        include: { account: { select: { id: true, isMobileVerified: true } } },
      });

      if (!token) {
        throw new HttpException(
          'Mobile verification otp not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (token.account.isMobileVerified === true) {
        throw new HttpException(
          'Account already verified',
          HttpStatus.BAD_REQUEST,
        );
      }

      const decodedToken = await this.jwtService.decode(token.token);
      if (!decodedToken || decodedToken.otp != dto.otp) {
        throw new HttpException('Invalid otp', HttpStatus.UNAUTHORIZED);
      }

      await this.prismaService.account.update({
        where: { id: dto.accountId },
        data: { isMobileVerified: true },
      });

      await this.prismaService.token.delete({ where: { id: token.id } });

      return {
        statusCode: HttpStatus.OK,
        message: 'Mobile verification complete',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async updateLoginPin(
    accountId: string,
    dto: updateAccountPinDto,
  ): Promise<ApiResponse> {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { id: accountId },
      });

      const passwordMatches = await verify(account.loginPin, dto.oldPin);
      if (!passwordMatches) {
        throw new HttpException('Incorrect password', HttpStatus.NOT_FOUND);
      }

      await this.prismaService.account.update({
        where: { id: accountId },
        data: { loginPin: await hash(dto.newPin) },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Account pin changed successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createTransactionPin(
    accountId: string,
    dto: CreateTransactionalPin,
  ): Promise<ApiResponse> {
    try {
      await this.prismaService.account.update({
        where: { id: accountId },
        data: { loginPin: await hash(dto.transactionalPin) },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Transaction pin created',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAccountDetails(accountId: string): Promise<ApiResponse> {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { id: accountId },
        select: {
          id: true,
          email: true,
          isAdmin: true,
          role: true,
          firstName: true,
          lastName: true,
          mobileNumber: true,
          isMobileVerified: true,
          afripayTag: true,
          countryCode: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        data: account,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async completeAccountRegistration(
    accountId: string,
    dto: CompleteAccountRegistrationDto,
  ): Promise<ApiResponse> {
    try {
      if (dto.pin != dto.confirmPin) {
        throw new HttpException('Pins do not match', HttpStatus.BAD_REQUEST);
      }

      const updatedAccount = await this.prismaService.account.update({
        where: { id: accountId },
        data: {
          loginPin: await hash(dto.pin),
          email: dto.email,
          afripayTag: dto.mxeTag,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          afripayTag: true,
          mobileNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        data: updatedAccount,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createAdmin(accountEmail: string): Promise<ApiResponse> {
    try {
      await this.prismaService.account.update({
        where: { email: accountEmail },
        data: { role: 'ADMIN' },
      });

      return { statusCode: HttpStatus.OK, message: 'Account updated to admin' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Account does not exist', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(dto: LoginDto): Promise<ApiResponse> {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { mobileNumber: dto.mobileNumber },
      });

      if (!account) {
        throw new HttpException('Account does not exist', HttpStatus.NOT_FOUND);
      }

      const pinMatches = await verify(account.loginPin, dto.loginPin);
      if (!pinMatches) {
        throw new HttpException('Incorrect pin', HttpStatus.UNAUTHORIZED);
      }

      const payload = {
        accountId: account.id,
        email: account.email,
        // mobileNumber: account.mobileNumber,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      return { statusCode: HttpStatus.OK, message: accessToken };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
