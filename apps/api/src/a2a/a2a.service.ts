import { InjectQueue } from '@nestjs/bullmq';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';

import type { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { DIALOGUE_QUEUE, type DialogueJobData } from './a2a.queue';

const sessionInclude = {
  match: {
    include: {
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
    },
  },
  messages: {
    include: { speaker: { include: { profile: true } } },
    orderBy: [{ round: 'asc' }, { id: 'asc' }],
  },
  summary: true,
} satisfies Prisma.A2ASessionInclude;

type A2ASessionWithRelations = Prisma.A2ASessionGetPayload<{
  include: typeof sessionInclude;
}>;

@Injectable()
export class A2AService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(DIALOGUE_QUEUE) private readonly dialogueQueue: Queue<DialogueJobData>,
  ) {}

  async get(userId: string, sessionId: string) {
    const session = await this.findAuthorized(userId, sessionId);
    return this.toView(userId, session);
  }

  async abort(userId: string, sessionId: string) {
    await this.findAuthorized(userId, sessionId);
    const session = await this.prisma.a2ASession.update({
      where: { id: sessionId },
      data: {
        state: 'aborted',
        completedAt: new Date(),
        match: { update: { state: 'rejected' } },
      },
      include: sessionInclude,
    });

    return this.toView(userId, session);
  }

  async retry(userId: string, sessionId: string) {
    await this.findAuthorized(userId, sessionId);
    const session = await this.prisma.a2ASession.update({
      where: { id: sessionId },
      data: {
        state: 'running',
        startedAt: new Date(),
        completedAt: null,
        match: { update: { state: 'dialogue_running' } },
      },
      include: sessionInclude,
    });

    await this.dialogueQueue.add(
      'run',
      { sessionId },
      { jobId: `${sessionId}:retry:${Date.now()}`, removeOnComplete: true, removeOnFail: 100 },
    );

    return this.toView(userId, session);
  }

  private async findAuthorized(userId: string, sessionId: string) {
    const session = await this.prisma.a2ASession.findUnique({
      where: { id: sessionId },
      include: sessionInclude,
    });

    if (!session) {
      throw new NotFoundException('A2A session not found');
    }

    if (session.match.userAId !== userId && session.match.userBId !== userId) {
      throw new ForbiddenException('You do not have access to this A2A session');
    }

    return session;
  }

  private toView(userId: string, session: A2ASessionWithRelations) {
    const candidate = session.match.userAId === userId ? session.match.userB : session.match.userA;
    const completedRounds = Math.max(...session.messages.map((message) => message.round), 0);

    return {
      id: session.id,
      matchId: session.matchId,
      state: session.state,
      totalRounds: session.totalRounds,
      completedRounds,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      candidate: {
        id: candidate.id,
        pairProfileUrl: candidate.pairProfileUrl,
        profile: candidate.profile,
      },
      messages: session.messages.map((message) => ({
        id: message.id,
        round: message.round,
        source: 'agent_auto',
        speakerUserId: message.speakerAgentUserId,
        speaker: message.speaker.profile,
        content: message.content,
        redactedSpans: message.redactedSpans,
      })),
      summaryId: session.summary?.id ?? null,
    };
  }
}
