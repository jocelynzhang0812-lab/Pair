import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/current-user.decorator';
import { MatchesService } from '../matches/matches.service';
import { StartA2ADto } from './dto';
import { A2AService } from './a2a.service';

@Controller('a2a')
@UseGuards(JwtAuthGuard)
export class A2AController {
  constructor(
    private readonly a2a: A2AService,
    private readonly matches: MatchesService,
  ) {}

  @Post()
  async start(@CurrentUser() user: AuthenticatedUser, @Body() body: StartA2ADto) {
    return { data: await this.matches.send(user.id, body.matchId) };
  }

  @Get(':sessionId')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('sessionId') sessionId: string) {
    return { data: await this.a2a.get(user.id, sessionId) };
  }

  @Post(':sessionId/abort')
  async abort(@CurrentUser() user: AuthenticatedUser, @Param('sessionId') sessionId: string) {
    return { data: await this.a2a.abort(user.id, sessionId) };
  }

  @Post(':sessionId/retry')
  async retry(@CurrentUser() user: AuthenticatedUser, @Param('sessionId') sessionId: string) {
    return { data: await this.a2a.retry(user.id, sessionId) };
  }
}
