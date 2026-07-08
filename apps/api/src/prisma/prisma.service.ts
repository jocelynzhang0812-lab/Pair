import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../generated/prisma';

/**
 * Prisma 7 客户端的 Nest 封装。
 *
 * Prisma 7 启用 Query Compiler 后，运行时连接必须经由 driver adapter，
 * 这里使用 @prisma/adapter-pg（基于 node-postgres）。连接串从 ConfigService
 * 读取（@nestjs/config 已在 AppModule 加载 .env），确保构造时 env 已就绪。
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
