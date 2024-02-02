import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MessageService } from 'src/utils/message.utils';
import { UtilService } from 'src/utils/utils.utils';
import { JwtService } from '@nestjs/jwt';
import { RegisterAccountDto, VerifyAccountDto } from './dto/auth.dto';
import { ApiResponse } from 'src/common/types/response.types';

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

  async resendVerificationOtp(mobileNumber: string): Promise<ApiResponse> {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { mobileNumber: mobileNumber },
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
  async updateLoginPin() {}

  async updateTransactionPin() {}

  async getAccountDetails() {}

  async completeAccountRegistration() {}
}
