import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaService } from 'src/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from 'src/auth/guards/authentication.guard';
import { ConfigService } from '@nestjs/config';
import { UtilService } from 'src/utils/utils.utils';

@Module({
  providers: [
    WalletService,
    PrismaService,
    ConfigService,
    UtilService,
    { provide: APP_GUARD, useClass: JwtGuard },
  ],
  controllers: [WalletController],
})
export class WalletModule {}
