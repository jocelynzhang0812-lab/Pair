import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        objectives: { orderBy: { createdAt: 'asc' } },
        profile: true,
        publicPage: true,
        socialLinks: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      pairProfileUrl: user.pairProfileUrl,
      meetingQuotaPerWeek: user.meetingQuotaPerWeek,
      profile: user.profile,
      objectives: user.objectives,
      socialLinks: user.socialLinks,
      publicPage: user.publicPage,
      onboarding: {
        hasProfile: Boolean(user.profile),
        hasObjectives: user.objectives.length > 0,
        isPublicPagePublished: Boolean(user.publicPage?.isPublished),
      },
    };
  }
}
