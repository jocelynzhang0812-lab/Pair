import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/current-user.decorator';
import { SummariesService } from './summaries.service';

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private readonly summaries: SummariesService) {}

  @Get(':summaryId')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('summaryId') summaryId: string) {
    return { data: await this.summaries.get(user.id, summaryId) };
  }

  @Post(':summaryId/not-interested')
  async notInterested(@CurrentUser() user: AuthenticatedUser, @Param('summaryId') summaryId: string) {
    return { data: await this.summaries.notInterested(user.id, summaryId) };
  }
}
