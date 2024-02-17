import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { FlutterwaveModule } from './flutterwave/flutterwave.module';

@Module({
  imports: [AuthModule, WalletModule, FlutterwaveModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
