import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/current-user.decorator';
import { ReplaceObjectivesDto } from './dto';
import { ObjectivesService } from './objectives.service';

@Controller('objectives')
@UseGuards(JwtAuthGuard)
export class ObjectivesController {
  constructor(private readonly objectives: ObjectivesService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    return { data: await this.objectives.list(user.id) };
  }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: ReplaceObjectivesDto) {
    return { data: await this.objectives.replace(user.id, body.objectives) };
  }

  @Put()
  async replace(@CurrentUser() user: AuthenticatedUser, @Body() body: ReplaceObjectivesDto) {
    return { data: await this.objectives.replace(user.id, body.objectives) };
  }
}
