import { Injectable } from '@nestjs/common';
import { ApiResponse } from './common/types/response.types';

@Injectable()
export class AppService {
  root(): ApiResponse {
    return {statusCode: 200, message: "User service running" }
  }
}
