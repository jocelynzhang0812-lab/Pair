import { join } from 'node:path';

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { A2AModule } from './a2a/a2a.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { JobsModule } from './jobs/jobs.module';
import { MatchesModule } from './matches/matches.module';
import { MeModule } from './me/me.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
import { PublicPagesModule } from './public-pages/public-pages.module';
import { SummariesModule } from './summaries/summaries.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Anchor .env to the app directory so the API boots regardless of cwd
      // (__dirname is apps/api/dist at runtime → ../.env is apps/api/.env).
      envFilePath: join(__dirname, '..', '.env'),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.get<string>('REDIS_URL') ?? 'redis://localhost:6379');
        const db = url.pathname.length > 1 ? Number(url.pathname.slice(1)) : undefined;
        return {
          connection: {
            host: url.hostname,
            port: url.port ? Number(url.port) : 6379,
            username: url.username || undefined,
            password: url.password || undefined,
            db: Number.isFinite(db) ? db : undefined,
            // Required by BullMQ blocking connections.
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    PrismaModule,
    AiModule,
    AuthModule,
    HealthModule,
    JobsModule,
    MeModule,
    ProfilesModule,
    ObjectivesModule,
    UsersModule,
    MatchesModule,
    A2AModule,
    SummariesModule,
    PublicPagesModule,
  ],
})
export class AppModule {}
