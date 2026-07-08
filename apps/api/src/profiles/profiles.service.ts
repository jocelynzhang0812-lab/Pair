import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import type { Prisma } from '../../generated/prisma';
import { AiService, type ProfileDraftOutput } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import type { GenerateProfileDto, UpsertProfileDto } from './dto';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly ai: AiService,
    private readonly prisma: PrismaService,
  ) {}

  async getMine(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        socialLinks: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      profile: user.profile,
      socialLinks: user.socialLinks,
    };
  }

  async upsert(userId: string, input: UpsertProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          name: input.name,
          headline: input.headline,
          avatarUrl: input.avatarUrl,
          bio: input.bio,
          tags: input.tags,
        },
        update: {
          name: input.name,
          headline: input.headline,
          avatarUrl: input.avatarUrl,
          bio: input.bio,
          tags: input.tags,
        },
      });

      if (input.socialLinks) {
        await tx.socialLink.deleteMany({ where: { userId } });
        await tx.socialLink.createMany({
          data: input.socialLinks.map((link) => ({
            userId,
            platform: link.platform,
            url: link.url,
          })),
        });
      }

      const socialLinks = await tx.socialLink.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      return { profile, socialLinks };
    });
  }

  async generate(userId: string, input: GenerateProfileDto) {
    if (!input.sourceUrl && !input.pastedText?.trim()) {
      throw new BadRequestException({
        code: 'PROFILE_SOURCE_REQUIRED',
        message: 'sourceUrl or pastedText is required',
      });
    }

    await this.ensureUser(userId);
    const startedAt = new Date();
    const draft = await this.ai.generateProfileDraft(input);
    const jobInput = this.toJson(input);
    const draftJson = this.toJson(draft);

    const result = await this.prisma.$transaction(async (tx) => {
      const job = await tx.aiJob.create({
        data: {
          userId,
          kind: 'profile_generate',
          state: 'succeeded',
          input: jobInput,
          output: draftJson,
          startedAt,
          finishedAt: new Date(),
        },
      });
      const profileDraft = await tx.profileDraft.create({
        data: {
          userId,
          sourceUrl: input.sourceUrl,
          pastedText: input.pastedText,
          draft: draftJson,
          confidence: draft.confidence,
        },
      });

      return { job, profileDraft };
    });

    return {
      jobId: result.job.id,
      state: result.job.state,
      draftId: result.profileDraft.id,
    };
  }

  async getGeneratedDraft(userId: string, jobId: string) {
    const job = await this.prisma.aiJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Profile generation job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenException('You do not have access to this job');
    }

    const draft = await this.prisma.profileDraft.findFirst({
      where: {
        userId,
        draft: { equals: job.output ?? undefined },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      jobId: job.id,
      state: job.state,
      draftId: draft?.id ?? null,
      draft: job.output,
      errorCode: job.errorCode,
      errorMessage: job.errorMessage,
    };
  }

  async confirmDraft(userId: string, draftId: string) {
    const draft = await this.prisma.profileDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      throw new NotFoundException('Profile draft not found');
    }

    if (draft.userId !== userId) {
      throw new ForbiddenException('You do not have access to this draft');
    }

    if (draft.state !== 'draft') {
      throw new BadRequestException({
        code: 'PROFILE_DRAFT_NOT_EDITABLE',
        message: 'Profile draft is not editable',
      });
    }

    const profileDraft = draft.draft as unknown as ProfileDraftOutput;
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          name: profileDraft.displayName,
          headline: profileDraft.title,
          bio: profileDraft.bio,
          tags: profileDraft.supertags,
        },
        update: {
          name: profileDraft.displayName,
          headline: profileDraft.title,
          bio: profileDraft.bio,
          tags: profileDraft.supertags,
        },
      });

      await tx.socialLink.deleteMany({ where: { userId } });
      if (profileDraft.socialLinks.length) {
        await tx.socialLink.createMany({
          data: profileDraft.socialLinks.map((link) => ({
            userId,
            platform: link.type,
            url: link.url,
          })),
        });
      }

      const confirmedDraft = await tx.profileDraft.update({
        where: { id: draftId },
        data: {
          state: 'confirmed',
          confirmedAt: new Date(),
        },
      });

      const socialLinks = await tx.socialLink.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      return { profile, socialLinks, draft: confirmedDraft };
    });
  }

  private async ensureUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private toJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
