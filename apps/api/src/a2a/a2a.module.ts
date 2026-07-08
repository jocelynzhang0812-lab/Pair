import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { MatchesModule } from '../matches/matches.module';
import { PrismaModule } from '../prisma/prisma.module';
import { A2AController } from './a2a.controller';
import { DIALOGUE_QUEUE } from './a2a.queue';
import { A2AService } from './a2a.service';
import { DialogueProcessor } from './dialogue.processor';
import { DialogueRunnerService } from './dialogue-runner.service';

@Module({
  imports: [
    PrismaModule,
    MatchesModule,
    AiModule,
    BullModule.registerQueue({ name: DIALOGUE_QUEUE }),
  ],
  controllers: [A2AController],
  providers: [A2AService, DialogueRunnerService, DialogueProcessor],
})
export class A2AModule {}
