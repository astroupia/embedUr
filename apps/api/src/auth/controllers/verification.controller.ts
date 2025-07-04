import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { VerifyEmailDto } from '../dtos/verify-email.dto';

@Controller('auth')
export class VerificationController {
  constructor(private authService: AuthService) {}

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query() query: VerifyEmailDto) {
    return this.authService.verifyEmail(query);
  }
}
