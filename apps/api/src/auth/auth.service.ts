import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import type { MockLoginDto, WeChatLoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async mockLogin(input: MockLoginDto): Promise<{
    accessToken: string;
    user: { id: string; pairProfileUrl: string; hasProfile: boolean };
  }> {
    const provider = input.provider ?? 'email';
    const user = await this.prisma.user.upsert({
      where: { pairProfileUrl: this.slugFromProviderId(input.providerId) },
      create: {
        authProvider: provider,
        authProviderId: input.providerId,
        pairProfileUrl: this.slugFromProviderId(input.providerId),
        profile: {
          create: {
            name: input.name ?? '章璟菲',
            headline: 'AI PM at Moonshot · HKU CS Year 2',
            bio: '在 Moonshot 做 AI 产品，关注 Agent 产品体验、系统化判断和高质量职业连接。',
            tags: ['ai-pm', 'moonshot', 'early-stage'],
          },
        },
        objectives: {
          createMany: {
            data: [
              { kind: 'mentor', side: 'a' },
              { kind: 'cross_industry', side: 'b' },
            ],
          },
        },
        socialLinks: {
          create: {
            platform: 'website',
            url: 'https://pair.app/u/jingfei',
          },
        },
        publicPage: {
          create: {
            isPublished: true,
          },
        },
      },
      update: {},
      include: { profile: true },
    });

    await this.ensureDemoNetwork(user.id);

    return {
      accessToken: await this.jwt.signAsync({ sub: user.id }),
      user: {
        id: user.id,
        pairProfileUrl: user.pairProfileUrl,
        hasProfile: Boolean(user.profile),
      },
    };
  }

  async wechatLogin(input: WeChatLoginDto): Promise<{
    accessToken: string;
    user: { id: string; pairProfileUrl: string; hasProfile: boolean };
  }> {
    const providerId = this.openIdFromCode(input.code);
    const user = await this.prisma.user.upsert({
      where: { pairProfileUrl: this.slugFromProviderId(providerId) },
      create: {
        authProvider: 'wechat',
        authProviderId: providerId,
        pairProfileUrl: this.slugFromProviderId(providerId),
        publicPage: {
          create: {
            isPublished: false,
          },
        },
      },
      update: {},
      include: { profile: true },
    });

    await this.ensureDemoNetwork(user.id);

    return {
      accessToken: await this.jwt.signAsync({ sub: user.id }),
      user: {
        id: user.id,
        pairProfileUrl: user.pairProfileUrl,
        hasProfile: Boolean(user.profile),
      },
    };
  }

  private async ensureDemoNetwork(viewerId: string): Promise<void> {
    const candidates: Array<{
      pairProfileUrl: string;
      name: string;
      shortName: string;
      headline: string;
      bio: string;
      tags: string[];
      score: number;
      reason: string;
    }> = [
      {
        pairProfileUrl: 'sarah-chen',
        name: 'Sarah Chen',
        shortName: 'Sarah',
        headline: 'Senior PM at Stripe',
        bio: '从 Stripe infra 转向 AI 产品，正在探索 early-stage AI startup 的产品机会。',
        tags: ['ai-pm', 'early-stage'],
        score: 86,
        reason: 'Both exploring early AI startups.',
      },
      {
        pairProfileUrl: 'daniel-liu',
        name: 'Daniel Liu',
        shortName: 'Daniel',
        headline: 'AI 研究员 @ Moonshot',
        bio: '关注多 Agent 协作、产品化验证和 AI infra。',
        tags: ['engineering', 'ai-pm'],
        score: 74,
        reason: 'Product and research perspectives are complementary.',
      },
      {
        pairProfileUrl: 'jessie-wu',
        name: 'Jessie Wu',
        shortName: 'Jessie',
        headline: 'Growth Lead @ TikTok',
        bio: '关注社区增长、AI 工具留存和高质量用户访谈。',
        tags: ['growth', 'community'],
        score: 81,
        reason: 'Growth playbooks meet AI product curiosity.',
      },
      {
        pairProfileUrl: 'kevin-zhao',
        name: 'Kevin Zhao',
        shortName: 'Kevin',
        headline: 'Founder @ stealth AI',
        bio: '连续创业者，正在做 Agent 工具方向的 0-1，想找产品搭子和早期合伙人。',
        tags: ['founder', 'agents'],
        score: 78,
        reason: 'Early founder looking for product-minded peers.',
      },
      {
        pairProfileUrl: 'nina-park',
        name: 'Nina Park',
        shortName: 'Nina',
        headline: 'Research Scientist @ Anthropic',
        bio: '研究对齐与评估，关注把研究结论转化为可用的产品。',
        tags: ['ai-research', 'safety'],
        score: 72,
        reason: 'Research-to-product translation overlaps.',
      },
      {
        pairProfileUrl: 'leo-chen',
        name: 'Leo Chen',
        shortName: 'Leo',
        headline: 'Founding Engineer @ Perplexity',
        bio: '做检索与 Agent 编排，喜欢和 PM 一起打磨真实用户价值。',
        tags: ['engineering', 'search'],
        score: 69,
        reason: 'Infra depth complements product framing.',
      },
      {
        pairProfileUrl: 'mia-tan',
        name: 'Mia Tan',
        shortName: 'Mia',
        headline: 'Product Designer @ Figma',
        bio: '关注 AI 交互范式和克制的产品表达。',
        tags: ['design', 'ai-ux'],
        score: 66,
        reason: 'Design craft for agentic interfaces.',
      },
    ];

    for (const candidate of candidates) {
      const demoUser = await this.ensureDemoUser({
        pairProfileUrl: candidate.pairProfileUrl,
        name: candidate.name,
        headline: candidate.headline,
        bio: candidate.bio,
        tags: candidate.tags,
      });
      await this.ensureMatch({
        userAId: viewerId,
        userBId: demoUser.id,
        candidateName: candidate.shortName,
        score: candidate.score,
        reason: candidate.reason,
      });
    }
  }

  private async ensureDemoUser(input: {
    pairProfileUrl: string;
    name: string;
    headline: string;
    bio: string;
    tags: string[];
  }): Promise<{ id: string }> {
    return this.prisma.user.upsert({
      where: { pairProfileUrl: input.pairProfileUrl },
      create: {
        authProvider: 'email',
        authProviderId: `${input.pairProfileUrl}@pair.local`,
        pairProfileUrl: input.pairProfileUrl,
        profile: {
          create: {
            name: input.name,
            headline: input.headline,
            bio: input.bio,
            tags: input.tags,
          },
        },
        objectives: {
          create: {
            kind: 'mentor',
            side: 'b',
          },
        },
        publicPage: {
          create: {
            isPublished: true,
          },
        },
      },
      update: {},
      select: { id: true },
    });
  }

  private async ensureMatch(input: {
    userAId: string;
    userBId: string;
    candidateName: string;
    score: number;
    reason: string;
  }): Promise<void> {
    const existing = await this.prisma.match.findFirst({
      where: { userAId: input.userAId, userBId: input.userBId },
      select: { id: true },
    });

    if (existing) {
      return;
    }

    await this.prisma.match.create({
      data: {
        userAId: input.userAId,
        userBId: input.userBId,
        objectiveKind: 'mentor',
        score: input.score,
        reason: input.reason,
        invitations: {
          create: {
            text: `Hi ${input.candidateName}, your work caught my eye. Jingfei is exploring similar AI PM questions and would like our Agents to compare fit first.`,
            variant: 'professional',
            isActive: true,
          },
        },
      },
    });
  }

  private slugFromProviderId(providerId: string): string {
    const normalized = providerId
      .toLowerCase()
      .replace(/@.*$/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return normalized || 'demo-user';
  }

  private openIdFromCode(code: string): string {
    return `wx_${code.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  }
}
