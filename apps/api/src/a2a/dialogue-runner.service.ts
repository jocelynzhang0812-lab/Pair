import { Injectable, Logger } from '@nestjs/common';

import { A2A_TOTAL_MESSAGES } from '../ai/ai.constants';
import { AiService, type ProfileSnapshotInput, type TranscriptLineInput } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

type SpeakerUser = {
  id: string;
  profile: {
    name: string;
    headline: string | null;
    bio: string | null;
    tags: string[];
  } | null;
};

/**
 * Runs a full A2A dialogue for one session: generates alternating Agent turns
 * (up to A2A_TOTAL_MESSAGES), then produces the decision-support summary.
 *
 * Idempotent/resumable: it resumes from the number of messages already stored,
 * and bails out early if the session is no longer in the `running` state (e.g.
 * the user aborted). All content comes from AiService, which itself falls back
 * to deterministic mocks when the LLM is disabled.
 */
@Injectable()
export class DialogueRunnerService {
  private readonly logger = new Logger(DialogueRunnerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async run(sessionId: string): Promise<void> {
    const session = await this.prisma.a2ASession.findUnique({
      where: { id: sessionId },
      include: {
        match: {
          include: {
            userA: { include: { profile: true } },
            userB: { include: { profile: true } },
          },
        },
        messages: { orderBy: [{ round: 'asc' }, { id: 'asc' }] },
      },
    });

    if (!session) {
      this.logger.warn(`A2A session ${sessionId} not found; skipping.`);
      return;
    }

    if (session.state !== 'running') {
      this.logger.log(`A2A session ${sessionId} is ${session.state}, not running; skipping.`);
      return;
    }

    const { match } = session;
    const speakers: SpeakerUser[] = [match.userA, match.userB];
    const totalMessages = session.totalRounds > 0 ? session.totalRounds : A2A_TOTAL_MESSAGES;

    const history: TranscriptLineInput[] = session.messages.map((message) => ({
      speaker: this.nameOf(speakers, message.speakerAgentUserId),
      content: message.content,
    }));

    for (let round = session.messages.length + 1; round <= totalMessages; round += 1) {
      if (await this.isNoLongerRunning(sessionId)) {
        this.logger.log(`A2A session ${sessionId} stopped mid-run (aborted).`);
        return;
      }

      const speaker = speakers[(round - 1) % 2];
      const counterpart = speakers[round % 2];

      const turn = await this.ai.generateDialogueTurn({
        objectiveKind: match.objectiveKind,
        speaker: this.snapshot(speaker),
        counterpart: this.snapshot(counterpart),
        round,
        totalRounds: totalMessages,
        history,
      });

      await this.prisma.a2AMessage.create({
        data: {
          sessionId,
          round,
          speakerAgentUserId: speaker.id,
          content: turn.content,
        },
      });

      history.push({ speaker: this.snapshot(speaker).name, content: turn.content });
    }

    if (await this.isNoLongerRunning(sessionId)) {
      return;
    }

    const viewer = speakers[0];
    const candidate = speakers[1];
    const summary = await this.ai.generateSummary({
      objectiveKind: match.objectiveKind,
      matchReason: match.reason,
      matchScore: match.score,
      viewer: this.snapshot(viewer),
      candidate: this.snapshot(candidate),
      transcript: history,
    });

    const summaryData = {
      yourViewOfThem: summary.yourViewOfThem,
      theirViewOfYou: summary.theirViewOfYou,
      topics: summary.topics,
      alignmentScore: summary.alignmentScore,
      scoreReason: summary.scoreReason,
      riskNote: summary.riskNote,
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.a2ASummary.upsert({
        where: { sessionId },
        create: { sessionId, ...summaryData },
        update: summaryData,
      });
      await tx.a2ASession.update({
        where: { id: sessionId },
        data: { state: 'completed', completedAt: new Date() },
      });
      await tx.match.update({
        where: { id: match.id },
        data: { state: 'dialogue_done' },
      });
    });

    this.logger.log(`A2A session ${sessionId} completed with ${totalMessages} messages.`);
  }

  private async isNoLongerRunning(sessionId: string): Promise<boolean> {
    const current = await this.prisma.a2ASession.findUnique({
      where: { id: sessionId },
      select: { state: true },
    });

    return !current || current.state !== 'running';
  }

  private snapshot(user: SpeakerUser): ProfileSnapshotInput {
    return {
      name: user.profile?.name ?? 'Pair user',
      headline: user.profile?.headline ?? null,
      bio: user.profile?.bio ?? null,
      tags: user.profile?.tags ?? [],
    };
  }

  private nameOf(speakers: SpeakerUser[], userId: string): string {
    const speaker = speakers.find((user) => user.id === userId);
    return speaker?.profile?.name ?? 'Agent';
  }
}
