import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class RequestMobileVerification {
  @ApiProperty()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ default: '+234' })
  @IsOptional()
  countryCode: string;
}

export class RegisterAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ default: '+234' })
  @IsOptional()
  countryCode: string;
}

export class CompleteAccountRegistrationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  pin: string;

  @ApiProperty()
  @IsNotEmpty()
  confirmPin: string;

  @ApiProperty()
  @IsNotEmpty()
  mxeTag: string;

  @ApiProperty()
  @IsNotEmpty()
  bvn: string;
}

export class VerifyAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty()
  @IsNotEmpty()
  otp: string;
}

export class CreateAccountDtoOld {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  pin: string;

  @ApiProperty()
  @IsNotEmpty()
  mxeTag: string;

  @ApiProperty()
  @IsNotEmpty()
  userId: string;
}

export class UpdateAccountDetails {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  mxeTag: string;
}

export class updateAccountPinDto {
  @ApiProperty()
  @IsNotEmpty()
  oldPin: string;

  @ApiProperty()
  @IsNotEmpty()
  newPin: string;
}

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  loginPin: string;
}

export class CreateTransactionalPin {
  @ApiProperty()
  @IsNotEmpty()
  transactionalPin: string;
}
