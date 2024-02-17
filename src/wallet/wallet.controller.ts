import { Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

@ApiTags('wallet-endpoints')
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create wallet and virtual account' })
  registerAccount(@Req() req) {
    return this.walletService.createWallet(req.user.email);
  }
}
