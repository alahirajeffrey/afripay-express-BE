import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MessageService } from 'src/utils/message.utils';
import { UtilService } from 'src/utils/utils.utils';
import { JwtService } from '@nestjs/jwt';
import { RegisterAccountDto } from './dto/auth.dto';
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

  async resendVerificationOtp() {}

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

  async updateLoginPin() {}

  async updateTransactionPin() {}

  async getAccountDetails() {}

  async completeAccountRegistration() {}
}
