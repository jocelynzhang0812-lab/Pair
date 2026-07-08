import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string, jobId: string) {
    const job = await this.prisma.aiJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.userId && job.userId !== userId) {
      throw new ForbiddenException('You do not have access to this job');
    }

    return {
      id: job.id,
      userId: job.userId,
      kind: job.kind,
      state: job.state,
      input: job.input,
      output: job.output,
      errorCode: job.errorCode,
      errorMessage: job.errorMessage,
      retryCount: job.retryCount,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
    };
  }
}
