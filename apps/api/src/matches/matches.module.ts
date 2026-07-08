import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { DIALOGUE_QUEUE } from '../a2a/a2a.queue';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [PrismaModule, BullModule.registerQueue({ name: DIALOGUE_QUEUE })],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
