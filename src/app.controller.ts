import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse } from './common/types/response.types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  root(): ApiResponse {
    return this.appService.root();
  }
}
