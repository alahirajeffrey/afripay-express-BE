import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import {
  CompleteAccountRegistrationDto,
  CreateTransactionalPin,
  LoginDto,
  RegisterAccountDto,
  VerifyAccountDto,
  updateAccountPinDto,
} from './dto/auth.dto';
import { JwtGuard } from './guards/authentication.guard';

@ApiTags('auth-endpoints')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Start account registration' })
  registerAccount(@Body() dto: RegisterAccountDto) {
    return this.authService.registerAccount(dto);
  }

  @Public()
  @Post('resend-verification-otp/:accountId')
  @ApiOperation({ summary: 'Resend verification otp' })
  resendVerificationOtp(@Param('accountId') accountId: string) {
    return this.authService.resendVerificationOtp(accountId);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Get(':tag')
  @ApiOperation({ summary: 'Check if afripay tag exists' })
  checkAfripayTagExists(@Param('tag') tag: string) {
    return this.authService.checkAfripayTagExists(tag);
  }

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @Get('account')
  @ApiOperation({ summary: 'Get account details' })
  getAccountDetails(@Req() req) {
    return this.authService.getAccountDetails(req.user.accountId);
  }

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @Patch('create-login-pin')
  @ApiOperation({ summary: 'create login pin' })
  updateLoginPin(@Body() dto: updateAccountPinDto, @Req() req) {
    return this.authService.updateLoginPin(req.user.accountId, dto);
  }

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @Patch('create-transaction-pin')
  @ApiOperation({ summary: 'create transaction pin' })
  createTransactionPin(@Body() dto: CreateTransactionalPin, @Req() req) {
    return this.authService.createTransactionPin(req.user.accountId, dto);
  }

  @Public()
  @Patch('verify-account')
  @ApiOperation({ summary: 'Verify account' })
  verifyAccount(@Body() dto: VerifyAccountDto) {
    return this.authService.verifyAccount(dto);
  }

  @Public()
  @Patch('complete-account-registration/:accountId')
  @ApiOperation({ summary: 'Complete account registration' })
  completeAccountRegistration(
    @Body() dto: CompleteAccountRegistrationDto,
    @Param('accountId') accountId: string,
  ) {
    return this.authService.completeAccountRegistration(accountId, dto);
  }
}
