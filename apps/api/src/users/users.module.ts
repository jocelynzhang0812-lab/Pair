import { Module } from '@nestjs/common';

import { ObjectivesModule } from '../objectives/objectives.module';
import { UsersController } from './users.controller';

@Module({
  imports: [ObjectivesModule],
  controllers: [UsersController],
})
export class UsersModule {}
