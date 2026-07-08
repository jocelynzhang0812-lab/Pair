import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const candidates = [
  {
    slug: 'sarah-chen',
    name: 'Sarah Chen',
    headline: 'Senior PM at Stripe',
    bio: '从 Stripe infra 转向 AI 产品，正在探索 early-stage AI startup 的产品机会。',
    tags: ['ai-pm', 'fintech', 'early-stage'],
    kind: 'mentor',
    side: 'b',
  },
  {
    slug: 'daniel-liu',
    name: 'Daniel Liu',
    headline: 'AI Researcher at Moonshot',
    bio: '关注多 Agent 协作、产品化验证和 AI infra。',
    tags: ['ai-research', 'agents', 'infra'],
    kind: 'mentor',
    side: 'b',
  },
  {
    slug: 'maya-patel',
    name: 'Maya Patel',
    headline: 'Founder in Residence',
    bio: '正在验证面向知识工作者的 Agent workflow，擅长从用户访谈提炼 MVP。',
    tags: ['founder', 'workflow', 'user-research'],
    kind: 'startup',
    side: 'a',
  },
  {
    slug: 'ethan-wong',
    name: 'Ethan Wong',
    headline: 'Growth Lead at B2B SaaS',
    bio: '负责 PLG 增长和企业客户转化，对 AI native SaaS 的 go-to-market 很感兴趣。',
    tags: ['growth', 'b2b-saas', 'gtm'],
    kind: 'cross_industry',
    side: 'b',
  },
  {
    slug: 'nora-kim',
    name: 'Nora Kim',
    headline: 'Design Engineer',
    bio: '把复杂系统做成清晰界面，近期在做 Agent dashboard 和协作体验原型。',
    tags: ['design-engineering', 'agent-ux', 'prototype'],
    kind: 'cofound',
    side: 'b',
  },
  {
    slug: 'leo-martin',
    name: 'Leo Martin',
    headline: 'Platform Engineer',
    bio: '做过大规模推荐和数据平台，想找产品强的人一起探索 Agent 数据层。',
    tags: ['platform', 'data', 'cofounder'],
    kind: 'cofound',
    side: 'a',
  },
] as const;

async function main(): Promise<void> {
  for (const candidate of candidates) {
    await prisma.user.upsert({
      where: { pairProfileUrl: candidate.slug },
      create: {
        authProvider: 'email',
        authProviderId: `${candidate.slug}@pair.local`,
        pairProfileUrl: candidate.slug,
        profile: {
          create: {
            name: candidate.name,
            headline: candidate.headline,
            bio: candidate.bio,
            tags: [...candidate.tags],
          },
        },
        objectives: {
          create: {
            kind: candidate.kind,
            side: candidate.side,
          },
        },
        socialLinks: {
          create: {
            platform: 'website',
            url: `https://pair.app/u/${candidate.slug}`,
          },
        },
        publicPage: {
          create: {
            isPublished: true,
          },
        },
      },
      update: {
        profile: {
          upsert: {
            create: {
              name: candidate.name,
              headline: candidate.headline,
              bio: candidate.bio,
              tags: [...candidate.tags],
            },
            update: {
              name: candidate.name,
              headline: candidate.headline,
              bio: candidate.bio,
              tags: [...candidate.tags],
            },
          },
        },
        publicPage: {
          upsert: {
            create: { isPublished: true },
            update: { isPublished: true },
          },
        },
      },
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
