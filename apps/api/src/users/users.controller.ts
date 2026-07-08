import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/current-user.decorator';
import { ReplaceObjectivesDto } from '../objectives/dto';
import { ObjectivesService } from '../objectives/objectives.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly objectives: ObjectivesService) {}

  @Post('me/objectives')
  async replaceObjectives(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ReplaceObjectivesDto,
  ) {
    return { data: await this.objectives.replace(user.id, body.objectives) };
  }
}
