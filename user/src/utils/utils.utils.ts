import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
  constructor() {}

  /**
   * generates a one time password for user
   * @returns : string containing one time password
   */
  generateOtp(): string {
    return Math.floor(Math.random() * 899999 + 10000).toString();
  }

  /**
   * This functions takes the user's mobile number and adds the country
   * code as it is required by the twilio api
   * @param mobileNumber : mobile number of user
   * @returns parsed mobile number
   */
  parseMobileNumber(mobileNumber: string) {
    // return the mobile number if it has up to 14 characters e.g. +2347181354770
    if (mobileNumber.length === 14) return mobileNumber;

    // strip the first number and add +234 if it has 11 characters e.g. 07181354770
    if (mobileNumber.length === 11) {
      const newMobileNumber = mobileNumber.slice(1);
      return newMobileNumber;
    }
    throw new HttpException(
      'Mobile number could not be parsed',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
