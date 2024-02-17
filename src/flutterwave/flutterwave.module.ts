import { Module } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [FlutterwaveService, ConfigService],
})
export class FlutterwaveModule {}
