import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SummariesService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string, summaryId: string) {
    const summary = await this.findAuthorized(userId, summaryId);
    const match = summary.session.match;
    const candidate = match.userAId === userId ? match.userB : match.userA;

    return {
      id: summary.id,
      sessionId: summary.sessionId,
      matchId: match.id,
      candidate: {
        id: candidate.id,
        pairProfileUrl: candidate.pairProfileUrl,
        profile: candidate.profile,
      },
      yourViewOfThem: summary.yourViewOfThem,
      theirViewOfYou: summary.theirViewOfYou,
      topics: summary.topics,
      alignmentScore: Math.max(0, Math.min(10, summary.alignmentScore)),
      scoreReason: summary.scoreReason,
      riskNote: summary.riskNote,
      generatedAt: summary.generatedAt,
    };
  }

  async notInterested(userId: string, summaryId: string) {
    const summary = await this.findAuthorized(userId, summaryId);
    const match = await this.prisma.match.update({
      where: { id: summary.session.matchId },
      data: { state: 'rejected' },
      select: { id: true, state: true },
    });

    return match;
  }

  private async findAuthorized(userId: string, summaryId: string) {
    const summary = await this.prisma.a2ASummary.findUnique({
      where: { id: summaryId },
      include: {
        session: {
          include: {
            match: {
              include: {
                userA: { include: { profile: true } },
                userB: { include: { profile: true } },
              },
            },
          },
        },
      },
    });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    if (summary.session.match.userAId !== userId && summary.session.match.userBId !== userId) {
      throw new ForbiddenException('You do not have access to this summary');
    }

    return summary;
  }
}
