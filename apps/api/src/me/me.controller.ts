import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/current-user.decorator';
import { MeService } from './me.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get()
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<{ data: Awaited<ReturnType<MeService['getMe']>> }> {
    return { data: await this.me.getMe(user.id) };
  }
}
