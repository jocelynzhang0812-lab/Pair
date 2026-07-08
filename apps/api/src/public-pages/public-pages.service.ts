import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { UpdatePublicPageDto } from './dto';

interface PublicPageUserView {
  pairProfileUrl: string;
  profile: unknown;
  objectives: unknown[];
  socialLinks: unknown[];
  publicPage: unknown;
}

@Injectable()
export class PublicPagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(slug: string) {
    const user = await this.prisma.user.findUnique({
      where: { pairProfileUrl: slug },
      include: {
        objectives: { orderBy: { createdAt: 'asc' } },
        profile: true,
        publicPage: true,
        socialLinks: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!user?.publicPage?.isPublished) {
      throw new NotFoundException('Public page not found');
    }

    return this.toPublicView(user);
  }

  async getMine(userId: string): Promise<ReturnType<PublicPagesService['toPublicView']>> {
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

    if (!user.publicPage) {
      const page = await this.prisma.publicPage.create({
        data: { userId, isPublished: false },
      });

      return this.toPublicView({ ...user, publicPage: page });
    }

    return this.toPublicView(user);
  }

  async updateMine(userId: string, input: UpdatePublicPageDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        objectives: { orderBy: { createdAt: 'asc' } },
        profile: true,
        socialLinks: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const page = await this.prisma.publicPage.upsert({
      where: { userId },
      create: {
        userId,
        ogImageUrl: input.ogImageUrl,
        isPublished: input.isPublished ?? false,
      },
      update: {
        ogImageUrl: input.ogImageUrl,
        isPublished: input.isPublished,
      },
    });

    return this.toPublicView({ ...user, publicPage: page });
  }

  private toPublicView(user: PublicPageUserView) {
    return {
      slug: user.pairProfileUrl,
      profile: user.profile,
      objectives: user.objectives,
      socialLinks: user.socialLinks,
      publicPage: user.publicPage,
    };
  }
}
