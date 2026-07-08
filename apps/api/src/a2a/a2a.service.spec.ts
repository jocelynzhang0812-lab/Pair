import { getQueueToken } from '@nestjs/bullmq';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { DIALOGUE_QUEUE } from './a2a.queue';
import { A2AService } from './a2a.service';

describe('A2AService', () => {
  let service: A2AService;
  let prismaService: any;
  let dialogueQueue: any;

  // Mock data factories
  const createMockUser = (id: string, name: string) => ({
    id,
    email: `${name}@example.com`,
    pairProfileUrl: `https://pair.app/u/${name}`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    profile: {
      id: `profile-${id}`,
      userId: id,
      name,
      headline: `Headline of ${name}`,
      bio: `Bio of ${name}`,
      avatarUrl: `https://example.com/avatar/${name}.jpg`,
      tags: ['tag1', 'tag2'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  });

  const createMockMatch = (userAId: string, userBId: string, state: string = 'dialogue_running') => ({
    id: 'match-1',
    userAId,
    userBId,
    state,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    userA: createMockUser(userAId, 'UserA'),
    userB: createMockUser(userBId, 'UserB'),
  });

  const createMockMessage = (id: string, round: number, speakerUserId: string) => ({
    id,
    sessionId: 'session-1',
    round,
    speakerAgentUserId: speakerUserId,
    content: `Message ${id}`,
    redactedSpans: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    speaker: createMockUser(speakerUserId, `Speaker${round}`),
  });

  const createMockSummary = (id: string) => ({
    id,
    sessionId: 'session-1',
    content: 'Summary content',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  const createMockSession = (
    userAId: string,
    userBId: string,
    messages: any[] = [],
    summary: any = null,
    state: string = 'running',
  ) => ({
    id: 'session-1',
    matchId: 'match-1',
    state,
    totalRounds: 5,
    startedAt: new Date('2024-01-01'),
    completedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    match: createMockMatch(userAId, userBId, 'dialogue_running'),
    messages,
    summary,
  });

  beforeEach(async () => {
    // Create a mock PrismaService
    const mockPrismaService = {
      a2ASession: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    // Mock the BullMQ dialogue queue injected via @InjectQueue.
    const mockDialogueQueue = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        A2AService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken(DIALOGUE_QUEUE),
          useValue: mockDialogueQueue,
        },
      ],
    }).compile();

    service = module.get<A2AService>(A2AService);
    prismaService = module.get(PrismaService);
    dialogueQueue = module.get(getQueueToken(DIALOGUE_QUEUE));
  });

  describe('get', () => {
    describe('B1.1: 正常流程：userId 为 userA 时，candidate 正确指向 userB', () => {
      it('should return session view with userB as candidate when userId is userA', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const messages = [createMockMessage('msg-1', 1, userAId)];
        const mockSession = createMockSession(userAId, userBId, messages);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);

        expect(result.id).toBe('session-1');
        expect(result.candidate.id).toBe(userBId);
        expect(result.candidate.profile!.name).toBe('UserB');
        expect(prismaService.a2ASession.findUnique).toHaveBeenCalledWith({
          where: { id: sessionId },
          include: expect.any(Object),
        });
      });
    });

    describe('B1.2: 正常流程：userId 为 userB 时，candidate 正确指向 userA', () => {
      it('should return session view with userA as candidate when userId is userB', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const messages = [createMockMessage('msg-1', 1, userBId)];
        const mockSession = createMockSession(userAId, userBId, messages);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userBId, sessionId);

        expect(result.id).toBe('session-1');
        expect(result.candidate.id).toBe(userAId);
        expect(result.candidate.profile!.name).toBe('UserA');
      });
    });

    describe('B2: 异常路径：session 不存在时抛 NotFoundException', () => {
      it('should throw NotFoundException when session does not exist', async () => {
        const userAId = 'user-a';
        const sessionId = 'non-existent-session';

        prismaService.a2ASession.findUnique.mockResolvedValue(null);

        await expect(service.get(userAId, sessionId)).rejects.toThrow(NotFoundException);
        await expect(service.get(userAId, sessionId)).rejects.toThrow('A2A session not found');
      });
    });

    describe('B3: 异常路径：userId 无权限访问时抛 ForbiddenException', () => {
      it('should throw ForbiddenException when userId is not authorized', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const unauthorizedUserId = 'user-c';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        await expect(service.get(unauthorizedUserId, sessionId)).rejects.toThrow(ForbiddenException);
        await expect(service.get(unauthorizedUserId, sessionId)).rejects.toThrow(
          'You do not have access to this A2A session',
        );
      });
    });
  });

  describe('abort', () => {
    describe('B4: 正常流程：abort() 成功更新 session 状态为 aborted、设置 completedAt、match 更新为 rejected', () => {
      it('should update session state to aborted and match state to rejected', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId);
        const abortedSession = {
          ...mockSession,
          state: 'aborted',
          completedAt: new Date(),
          match: { ...mockSession.match, state: 'rejected' },
        };

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);
        prismaService.a2ASession.update.mockResolvedValue(abortedSession);

        const result = await service.abort(userAId, sessionId);

        expect(prismaService.a2ASession.update).toHaveBeenCalledWith({
          where: { id: sessionId },
          data: {
            state: 'aborted',
            completedAt: expect.any(Date),
            match: { update: { state: 'rejected' } },
          },
          include: expect.any(Object),
        });
        expect(result.state).toBe('aborted');
      });
    });

    describe('B5: 正常流程：abort() 返回正确的 toView 结果', () => {
      it('should return correct view after abort', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const messages = [createMockMessage('msg-1', 1, userAId)];
        const mockSession = createMockSession(userAId, userBId, messages);
        const abortedSession = {
          ...mockSession,
          state: 'aborted',
          completedAt: new Date(),
          match: { ...mockSession.match, state: 'rejected' },
        };

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);
        prismaService.a2ASession.update.mockResolvedValue(abortedSession);

        const result = await service.abort(userAId, sessionId);

        expect(result.id).toBe('session-1');
        expect(result.state).toBe('aborted');
        expect(result.completedAt).toBeDefined();
        expect(result.candidate.id).toBe(userBId);
        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].source).toBe('agent_auto');
      });
    });

    describe('B6: 异常路径：abort() session 不存在时抛 NotFoundException', () => {
      it('should throw NotFoundException when session does not exist during abort', async () => {
        const userAId = 'user-a';
        const sessionId = 'non-existent-session';

        prismaService.a2ASession.findUnique.mockResolvedValue(null);

        await expect(service.abort(userAId, sessionId)).rejects.toThrow(NotFoundException);
      });
    });

    describe('B7: 异常路径：abort() userId 无权限时抛 ForbiddenException', () => {
      it('should throw ForbiddenException when userId is not authorized during abort', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const unauthorizedUserId = 'user-c';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        await expect(service.abort(unauthorizedUserId, sessionId)).rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('retry', () => {
    describe('B8: 正常流程：retry() 成功更新 session 状态为 running、设置 startedAt、清空 completedAt、match 更新为 dialogue_running', () => {
      it('should update session state to running and clear completedAt', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId, [], null, 'aborted');
        const retriedSession = {
          ...mockSession,
          state: 'running',
          startedAt: new Date(),
          completedAt: null,
          match: { ...mockSession.match, state: 'dialogue_running' },
        };

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);
        prismaService.a2ASession.update.mockResolvedValue(retriedSession);

        const result = await service.retry(userAId, sessionId);

        expect(prismaService.a2ASession.update).toHaveBeenCalledWith({
          where: { id: sessionId },
          data: {
            state: 'running',
            startedAt: expect.any(Date),
            completedAt: null,
            match: { update: { state: 'dialogue_running' } },
          },
          include: expect.any(Object),
        });
        expect(result.state).toBe('running');
        expect(result.completedAt).toBeNull();
        // retry should re-enqueue a dialogue job so the worker resumes.
        expect(dialogueQueue.add).toHaveBeenCalledWith(
          'run',
          { sessionId },
          expect.objectContaining({ removeOnComplete: true }),
        );
      });
    });

    describe('B9: 正常流程：retry() 返回正确的 toView 结果', () => {
      it('should return correct view after retry', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const messages = [createMockMessage('msg-1', 1, userAId)];
        const mockSession = createMockSession(userAId, userBId, messages, null, 'aborted');
        const retriedSession = {
          ...mockSession,
          state: 'running',
          startedAt: new Date(),
          completedAt: null,
          match: { ...mockSession.match, state: 'dialogue_running' },
        };

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);
        prismaService.a2ASession.update.mockResolvedValue(retriedSession);

        const result = await service.retry(userAId, sessionId);

        expect(result.id).toBe('session-1');
        expect(result.state).toBe('running');
        expect(result.startedAt).toBeDefined();
        expect(result.completedAt).toBeNull();
        expect(result.candidate.id).toBe(userBId);
      });
    });

    describe('B10: 异常路径：retry() session 不存在时抛 NotFoundException', () => {
      it('should throw NotFoundException when session does not exist during retry', async () => {
        const userAId = 'user-a';
        const sessionId = 'non-existent-session';

        prismaService.a2ASession.findUnique.mockResolvedValue(null);

        await expect(service.retry(userAId, sessionId)).rejects.toThrow(NotFoundException);
      });
    });

    describe('B11: 异常路径：retry() userId 无权限时抛 ForbiddenException', () => {
      it('should throw ForbiddenException when userId is not authorized during retry', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const unauthorizedUserId = 'user-c';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        await expect(service.retry(unauthorizedUserId, sessionId)).rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('toView (private method via public methods)', () => {
    describe('D1: 边界值：当 messages 为空数组时，completedRounds 为 0', () => {
      it('should return completedRounds as 0 when messages array is empty', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId, []);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);

        expect(result.completedRounds).toBe(0);
        expect(result.messages).toHaveLength(0);
      });
    });

    describe('D2: 边界值：当 messages 非空时，completedRounds 取最大 round 值', () => {
      it('should return completedRounds as max round value when messages exist', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const messages = [
          createMockMessage('msg-1', 1, userAId),
          createMockMessage('msg-2', 2, userBId),
          createMockMessage('msg-3', 3, userAId),
        ];
        const mockSession = createMockSession(userAId, userBId, messages);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);

        expect(result.completedRounds).toBe(3);
        expect(result.messages).toHaveLength(3);
      });
    });

    describe('D3: 边界值：当 summary 存在时，summaryId 为 summary.id', () => {
      it('should return summaryId when summary exists', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const summary = createMockSummary('summary-1');
        const mockSession = createMockSession(userAId, userBId, [], summary);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);

        expect(result.summaryId).toBe('summary-1');
      });
    });

    describe('D4: 边界值：当 summary 不存在时，summaryId 为 null', () => {
      it('should return summaryId as null when summary does not exist', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId, [], null);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);

        expect(result.summaryId).toBeNull();
      });
    });

    describe('D5: 边界值：messages 映射正确，source 固定为 agent_auto', () => {
      it('should map messages correctly with source as agent_auto', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const messages = [
          createMockMessage('msg-1', 1, userAId),
          createMockMessage('msg-2', 2, userBId),
        ];
        const mockSession = createMockSession(userAId, userBId, messages);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);

        expect(result.messages).toHaveLength(2);
        result.messages.forEach((msg) => {
          expect(msg.source).toBe('agent_auto');
          expect(msg.id).toBeDefined();
          expect(msg.round).toBeDefined();
          expect(msg.speakerUserId).toBeDefined();
          expect(msg.speaker).toBeDefined();
          expect(msg.content).toBeDefined();
          expect(msg.redactedSpans).toBeDefined();
        });
      });
    });

    describe('D6: 边界值：candidate 的 profile 和 pairProfileUrl 正确映射', () => {
      it('should map candidate profile and pairProfileUrl correctly', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);

        expect(result.candidate.id).toBe(userBId);
        expect(result.candidate.pairProfileUrl).toBe('https://pair.app/u/UserB');
        expect(result.candidate.profile).toBeDefined();
        expect(result.candidate.profile!.name).toBe('UserB');
        expect(result.candidate.profile!.bio).toBe('Bio of UserB');
      });
    });
  });

  describe('Edge cases and integration', () => {
    describe('F1: 边界值：Math.max 处理空消息数组', () => {
      it('should correctly handle empty messages array in completedRounds calculation', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId, []);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);

        // Math.max(...[], 0) should return 0
        expect(result.completedRounds).toBe(0);
        expect(Number.isFinite(result.completedRounds)).toBe(true);
      });
    });

    describe('F2: 权限检查：三种用户身份验证', () => {
      it('should correctly identify userA', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);
        expect(result.candidate.id).toBe(userBId);
      });

      it('should correctly identify userB', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userBId, sessionId);
        expect(result.candidate.id).toBe(userAId);
      });

      it('should reject unauthorized user', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const unauthorizedUserId = 'user-c';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        await expect(service.get(unauthorizedUserId, sessionId)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('F3: 关系完整性：match 关系验证', () => {
      it('should correctly access match relationship', async () => {
        const userAId = 'user-a';
        const userBId = 'user-b';
        const sessionId = 'session-1';
        const mockSession = createMockSession(userAId, userBId);

        prismaService.a2ASession.findUnique.mockResolvedValue(mockSession);

        const result = await service.get(userAId, sessionId);

        expect(result.matchId).toBe('match-1');
        expect(result.candidate).toBeDefined();
        expect(result.candidate.id).toBe(userBId);
      });
    });
  });
});
