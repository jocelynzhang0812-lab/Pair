import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { ObjectiveInputDto } from './dto';

@Injectable()
export class ObjectivesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    await this.ensureUser(userId);

    return this.prisma.objective.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async replace(userId: string, objectives: ObjectiveInputDto[]) {
    await this.ensureUser(userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.objective.deleteMany({ where: { userId } });
      await tx.objective.createMany({
        data: objectives.map((objective) => ({
          userId,
          kind: objective.kind,
          side: objective.side,
        })),
      });

      return tx.objective.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
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
}
