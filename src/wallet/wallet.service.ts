import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/types/response.types';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { UtilService } from 'src/utils/utils.utils';
import { randomUUID } from 'crypto';

@Injectable()
export class WalletService {
  private paystackApiKey: string;

  constructor(
    private prismaService: PrismaService,
    private utilService: UtilService,
    private readonly config: ConfigService,
  ) {
    this.paystackApiKey = this.config.get<string>('PAYSTACK_API_KEY');
  }

  async createWallet(email: string): Promise<ApiResponse> {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { email },
      });

      // create wallet
      const wallet = await this.prismaService.wallet.create({
        data: {
          mxeTag: account.afripayTag,
          account: { connect: { email: account.email } },
        },
      });

      // create virtual account
      const virtualAccountResponse = await axios.post(
        'https://api.paystack.co/dedicated_account/assign',
        {
          email: account.email,
          first_name: account.firstName,
          last_name: account.lastName,
          phone: account.mobileNumber,
          country: 'NG',
          preferred_bank: 'wema-bank',
          account_number: this.utilService.createAccountNumber(
            account.mobileNumber,
          ),
        },
      );

      if (virtualAccountResponse.status !== 200) {
        throw new HttpException(
          'An error occured while creating virtual accounts',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const virtualAccount = await this.prismaService.virtualAccount.create({
        data: {
          wallet: { connect: { email: account.email } },
          accountNumber: this.utilService.createAccountNumber(
            account.mobileNumber,
          ),
          bankName: 'wema-bank',
          transactionRef: randomUUID(),
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        data: { wallet, virtualAccount },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
