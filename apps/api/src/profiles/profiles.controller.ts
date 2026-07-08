import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/current-user.decorator';
import { ConfirmProfileDraftDto, GenerateProfileDto, UpsertProfileDto } from './dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  async getMine(@CurrentUser() user: AuthenticatedUser): Promise<{ data: Awaited<ReturnType<ProfilesService['getMine']>> }> {
    return { data: await this.profiles.getMine(user.id) };
  }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: UpsertProfileDto) {
    return { data: await this.profiles.upsert(user.id, body) };
  }

  @Post('generate')
  async generate(@CurrentUser() user: AuthenticatedUser, @Body() body: GenerateProfileDto) {
    return { data: await this.profiles.generate(user.id, body) };
  }

  @Get('generate/:jobId')
  async getGeneratedDraft(@CurrentUser() user: AuthenticatedUser, @Param('jobId') jobId: string) {
    return { data: await this.profiles.getGeneratedDraft(user.id, jobId) };
  }

  @Post('confirm-draft')
  async confirmDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ConfirmProfileDraftDto,
  ) {
    return { data: await this.profiles.confirmDraft(user.id, body.draftId) };
  }

  @Post('me')
  async createMine(@CurrentUser() user: AuthenticatedUser, @Body() body: UpsertProfileDto) {
    return { data: await this.profiles.upsert(user.id, body) };
  }

  @Patch('me')
  async updateMine(@CurrentUser() user: AuthenticatedUser, @Body() body: UpsertProfileDto) {
    return { data: await this.profiles.upsert(user.id, body) };
  }
}
