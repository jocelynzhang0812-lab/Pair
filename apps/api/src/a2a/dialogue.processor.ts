import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { DIALOGUE_QUEUE, type DialogueJobData } from './a2a.queue';
import { DialogueRunnerService } from './dialogue-runner.service';

/**
 * Worker that consumes the A2A dialogue queue and runs each session to
 * completion via DialogueRunnerService. Runs in-process with the API.
 */
@Processor(DIALOGUE_QUEUE)
export class DialogueProcessor extends WorkerHost {
  private readonly logger = new Logger(DialogueProcessor.name);

  constructor(private readonly runner: DialogueRunnerService) {
    super();
  }

  async process(job: Job<DialogueJobData>): Promise<void> {
    const { sessionId } = job.data;
    this.logger.log(`Running dialogue job ${job.id ?? '?'} for session ${sessionId}.`);
    await this.runner.run(sessionId);
  }
}
