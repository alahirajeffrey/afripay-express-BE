import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Flutterwave = require('flutterwave-node-v3');

@Injectable()
export class FlutterwaveService {
  constructor(private readonly configService: ConfigService) {}

  flw = new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY,
  );

  async createVirtualAccount(
    email: string,
    bvn: string,
    isPermanent: boolean,
    accountId: string,
  ) {
    try {
      const txRef = `virtual-account-${Date.now()}-${accountId}`;

      const payload = {
        tx_ref: txRef,
        email: email,
        is_permanent: isPermanent,
        bvn: bvn,
      };

      const response = await this.flw.VirtualAcct.create(payload);

      return {
        txRef: txRef,
        virtualAccountNumber: response.data.account_number,
        bankName: response.data.bank_name,
        flw_ref: response.data.flw_ref,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
