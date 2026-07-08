import { Module } from '@nestjs/common';

import { AiService } from './ai.service';
import { LlmService } from './llm.service';

@Module({
  providers: [AiService, LlmService],
  exports: [AiService, LlmService],
})
export class AiModule {}
