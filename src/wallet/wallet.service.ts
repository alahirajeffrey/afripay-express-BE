import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/types/response.types';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { UtilService } from 'src/utils/utils.utils';
import { randomUUID } from 'crypto';
import { FlutterwaveService } from 'src/flutterwave/flutterwave.service';

@Injectable()
export class WalletService {
  private paystackApiKey: string;

  constructor(
    private prismaService: PrismaService,
    private utilService: UtilService,
    private readonly config: ConfigService,
    private flutterwaveService: FlutterwaveService,
  ) {
    this.paystackApiKey = this.config.get<string>('PAYSTACK_API_KEY');
  }

  async createWallet(email: string): Promise<ApiResponse> {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { email },
      });

      // create virtual account with flutterwave
      const virtualAccountDetails =
        await this.flutterwaveService.createVirtualAccount(
          account.email,
          account.bvn,
          true,
          account.id,
        );

      // create wallet and save virtual account details
      const wallet = await this.prismaService.wallet
        .create({
          data: {
            mxeTag: account.afripayTag,
            account: { connect: { email: account.email } },
          },
        })
        .then(async (wallet) => {
          await this.prismaService.virtualAccount.create({
            data: {
              accountNumber: virtualAccountDetails.virtualAccountNumber,
              bankName: virtualAccountDetails.bankName,
              transactionRef: virtualAccountDetails.txRef,
              flwRef: virtualAccountDetails.flw_ref,
              wallet: { connect: { email: wallet.email } },
            },
          });
          return wallet;
        });

      return {
        statusCode: HttpStatus.CREATED,
        data: { wallet, virtualAccountDetails },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
