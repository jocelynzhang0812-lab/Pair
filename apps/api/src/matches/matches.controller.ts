import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/current-user.decorator';
import { RewriteIntroDto } from './dto';
import { MatchesService } from './matches.service';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    return { data: await this.matches.list(user.id) };
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return { data: await this.matches.get(user.id, id) };
  }

  @Post(':id/pass')
  async pass(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return { data: await this.matches.pass(user.id, id) };
  }

  @Post(':id/rewrite-intro')
  async rewriteIntro(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: RewriteIntroDto,
  ) {
    return { data: await this.matches.rewriteIntro(user.id, id, body.variant) };
  }

  @Post(':id/send')
  async send(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return { data: await this.matches.send(user.id, id) };
  }
}
