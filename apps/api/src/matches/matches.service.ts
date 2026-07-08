import { InjectQueue } from '@nestjs/bullmq';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';

import { DIALOGUE_QUEUE, type DialogueJobData } from '../a2a/a2a.queue';
import { A2A_TOTAL_MESSAGES } from '../ai/ai.constants';
import { PrismaService } from '../prisma/prisma.service';

type IntroVariant = 'professional' | 'casual' | 'story';

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(DIALOGUE_QUEUE) private readonly dialogueQueue: Queue<DialogueJobData>,
  ) {}

  async list(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        state: { not: 'rejected' },
      },
      include: this.matchInclude(),
      orderBy: [{ state: 'asc' }, { score: 'desc' }, { createdAt: 'desc' }],
    });

    return matches.map((match) => this.toView(userId, match));
  }

  async get(userId: string, matchId: string) {
    const match = await this.findAuthorized(userId, matchId);
    return this.toView(userId, match);
  }

  async pass(userId: string, matchId: string) {
    await this.findAuthorized(userId, matchId);
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { state: 'rejected' },
      include: this.matchInclude(),
    });

    return this.toView(userId, match);
  }

  async rewriteIntro(userId: string, matchId: string, variant: IntroVariant = 'professional') {
    const match = await this.findAuthorized(userId, matchId);
    const candidate = match.userAId === userId ? match.userB.profile : match.userA.profile;
    const candidateName = candidate?.name ?? 'there';

    await this.prisma.invitation.updateMany({
      where: { matchId, isActive: true },
      data: { isActive: false },
    });

    const invitation = await this.prisma.invitation.create({
      data: {
        matchId,
        variant,
        isActive: true,
        text: this.introText(candidateName, variant),
      },
    });

    return invitation;
  }

  async send(userId: string, matchId: string) {
    const match = await this.findAuthorized(userId, matchId);

    if (match.session) {
      throw new ConflictException({
        code: 'A2A_ALREADY_STARTED',
        message: 'A2A session already exists for this match',
        details: { sessionId: match.session.id },
      });
    }

    // Create the session in `running` state and enqueue the dialogue job.
    // The worker (DialogueProcessor) generates messages + summary; the client
    // polls GET /a2a/:sessionId until it reaches `completed`.
    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.a2ASession.create({
        data: {
          matchId,
          state: 'running',
          totalRounds: A2A_TOTAL_MESSAGES,
          startedAt: new Date(),
        },
      });

      await tx.match.update({
        where: { id: matchId },
        data: { state: 'dialogue_running' },
      });

      return created;
    });

    await this.dialogueQueue.add(
      'run',
      { sessionId: session.id },
      { jobId: session.id, removeOnComplete: true, removeOnFail: 100 },
    );

    return {
      matchId,
      state: 'dialogue_running',
      sessionId: session.id,
      summaryId: null,
    };
  }

  private async findAuthorized(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: this.matchInclude(),
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.userAId !== userId && match.userBId !== userId) {
      throw new ForbiddenException('You do not have access to this match');
    }

    return match;
  }

  private matchInclude() {
    return {
      userA: { include: { profile: true, objectives: true, socialLinks: true } },
      userB: { include: { profile: true, objectives: true, socialLinks: true } },
      invitations: { orderBy: { generatedAt: 'desc' } },
      session: { include: { summary: true } },
    } as const;
  }

  private toView(userId: string, match: Awaited<ReturnType<MatchesService['findAuthorized']>>) {
    const candidateUser = match.userAId === userId ? match.userB : match.userA;
    const activeInvitation = match.invitations.find((invitation) => invitation.isActive) ?? null;

    return {
      id: match.id,
      createdAt: match.createdAt,
      objectiveKind: match.objectiveKind,
      score: match.score,
      reason: match.reason,
      state: match.state,
      candidate: {
        id: candidateUser.id,
        pairProfileUrl: candidateUser.pairProfileUrl,
        profile: candidateUser.profile,
        objectives: candidateUser.objectives,
        socialLinks: candidateUser.socialLinks,
      },
      invitation: activeInvitation,
      session: match.session
        ? {
            id: match.session.id,
            state: match.session.state,
            summaryId: match.session.summary?.id ?? null,
          }
        : null,
    };
  }

  private introText(candidateName: string, variant: IntroVariant): string {
    const texts: Record<IntroVariant, string> = {
      professional: `Hi ${candidateName}, your work looks relevant to my current AI product questions. I would like our Agents to compare fit before we schedule time.`,
      casual: `Hi ${candidateName}, I think there may be a useful overlap between what we are both exploring. Want to let our Agents do a quick fit check first?`,
      story: `Hi ${candidateName}, I noticed a pattern in your work that connects with the AI product path I am exploring. I would like our Agents to test whether there is a real conversation here.`,
    };

    return texts[variant];
  }
}
