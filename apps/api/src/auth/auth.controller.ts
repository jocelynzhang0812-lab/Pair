import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { MockLoginDto, WeChatLoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('mock-login')
  async mockLogin(
    @Body() body: MockLoginDto,
  ): Promise<{ data: Awaited<ReturnType<AuthService['mockLogin']>> }> {
    return { data: await this.auth.mockLogin(body) };
  }

  @Post('wechat-login')
  async wechatLogin(
    @Body() body: WeChatLoginDto,
  ): Promise<{ data: Awaited<ReturnType<AuthService['wechatLogin']>> }> {
    return { data: await this.auth.wechatLogin(body) };
  }
}
