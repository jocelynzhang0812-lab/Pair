# Pair API Contract

> 版本：v0.2 · 2026-06-30
> 用途：定义 Pair MVP 的后端接口清单、请求响应结构、状态码与轮询规则。
> 当前代码状态：`apps/api` 只有 NestJS + Prisma 骨架，本文档是后续实现契约。

## 1. Global Rules

### Base URL

- Local: `http://localhost:3000`
- Staging / Production: 待部署后配置。

### Auth

除公开档案接口外，默认需要：

```http
Authorization: Bearer <accessToken>
```

### Response Shape

成功响应：

```json
{
  "data": {},
  "meta": {}
}
```

错误响应：

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request payload",
  "details": {}
}
```

### Common Status Codes

| 状态码 | 含义 |
|---|---|
| 200 | 成功读取或同步操作成功 |
| 201 | 创建成功 |
| 202 | 异步任务已接受 |
| 204 | 成功且无响应体 |
| 400 | 参数错误 |
| 401 | 未登录或 token 无效 |
| 403 | 无权访问 |
| 404 | 资源不存在 |
| 409 | 状态冲突或重复操作 |
| 422 | LLM 输出或业务校验失败 |
| 429 | 频率限制 |
| 500 | 系统错误 |

## 2. Auth

### POST /auth/mock-login

本地开发登录。

Request:

```json
{
  "provider": "email",
  "providerId": "demo@pair.app",
  "name": "Demo User"
}
```

Response:

```json
{
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt-or-token",
    "user": {
      "id": "uuid",
      "pairProfileUrl": "demo-user",
      "hasProfile": false
    }
  }
}
```

### POST /auth/wechat-login

微信小程序登录。

Request:

```json
{
  "code": "wx.login code"
}
```

Response:

```json
{
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "user": {
      "id": "uuid",
      "hasProfile": true
    }
  }
}
```

### POST /auth/email/request-code

Web email OTP 请求验证码。

Request:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{
  "data": {
    "sent": true,
    "expiresInSeconds": 600
  }
}
```

### POST /auth/email/verify

校验 email OTP 并登录。

Request:

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

Response: 同 `/auth/mock-login`。

### POST /auth/refresh

刷新 access token。

Request:

```json
{
  "refreshToken": "token"
}
```

Response:

```json
{
  "data": {
    "accessToken": "jwt"
  }
}
```

### POST /auth/logout

退出登录。

Response:

```json
{
  "data": {
    "ok": true
  }
}
```

## 3. Me

### GET /me

读取当前用户首页所需状态。

Response:

```json
{
  "data": {
    "id": "uuid",
    "pairProfileUrl": "jingfei",
    "profile": {
      "name": "章璟菲",
      "headline": "AI PM at Moonshot",
      "avatarUrl": "https://...",
      "bio": "关注 AI 产品和高质量连接。",
      "tags": ["ai-pm", "early-stage"]
    },
    "objectives": [
      { "kind": "mentor", "side": "a" }
    ],
    "a2aDefaultMode": "delegated",
    "publicPage": {
      "isPublished": true,
      "url": "https://pair.app/u/jingfei"
    }
  }
}
```

## 4. Profile

### POST /profiles/generate

提交公开来源，创建 Profile Agent 异步任务。

Request:

```json
{
  "sourceUrl": "https://linkedin.com/in/...",
  "pastedText": "optional pasted bio",
  "locale": "zh-CN"
}
```

Response:

```json
{
  "data": {
    "jobId": "uuid",
    "state": "queued"
  }
}
```

### GET /profiles/generate/:jobId

轮询档案生成任务。

Response:

```json
{
  "data": {
    "jobId": "uuid",
    "state": "succeeded",
    "draft": {
      "displayName": "Sarah Chen",
      "title": "Senior PM at Stripe",
      "companyOrSchool": "Stripe",
      "bio": "专注 AI 支付和增长。",
      "supertags": ["ai-pm", "growth"],
      "socialLinks": [
        { "type": "linkedin", "url": "https://..." }
      ],
      "strengths": ["AI product", "go-to-market"],
      "interests": ["early-stage AI"],
      "confidence": 0.82
    }
  }
}
```

### POST /profiles

确认并保存用户档案。

Request:

```json
{
  "name": "Sarah Chen",
  "headline": "Senior PM at Stripe",
  "avatarUrl": "https://...",
  "bio": "专注 AI 支付和增长。",
  "tags": ["ai-pm", "growth"],
  "sourceLinks": [
    { "platform": "linkedin", "url": "https://..." }
  ]
}
```

Response:

```json
{
  "data": {
    "profileId": "uuid"
  }
}
```

### GET /profiles/me

读取当前用户档案。

Response:

```json
{
  "data": {
    "id": "uuid",
    "name": "Sarah Chen",
    "headline": "Senior PM at Stripe",
    "avatarUrl": "https://...",
    "bio": "专注 AI 支付和增长。",
    "tags": ["ai-pm", "growth"]
  }
}
```

### PATCH /profiles/me

更新当前用户档案。

Request: 同 `POST /profiles`，所有字段可选。

Response: 返回更新后的 profile。

## 5. Objectives

### PUT /objectives

保存用户目标，替换当前目标集合。

Request:

```json
{
  "objectives": [
    { "kind": "mentor", "side": "a" },
    { "kind": "cross_industry", "side": "b" }
  ]
}
```

Response:

```json
{
  "data": {
    "objectives": [
      { "kind": "mentor", "side": "a" },
      { "kind": "cross_industry", "side": "b" }
    ]
  }
}
```

Rules:

- 最少 1 个，最多 3 个。
- 重复目标返回 400。

## 6. Matches

### POST /matches/generate

触发今日匹配生成。

Request:

```json
{
  "limit": 3
}
```

Response:

```json
{
  "data": {
    "jobId": "uuid",
    "state": "queued"
  }
}
```

### GET /matches

读取 Today 页 Match Card。

Query:

| 参数 | 默认 | 说明 |
|---|---|---|
| `state` | `pending` | 可传 `pending`, `dialogue_running`, `dialogue_done` |
| `limit` | `3` | 最大 3 |

Response:

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "score": 86,
        "state": "pending",
        "expiresAt": "2026-07-01T14:00:00.000Z",
        "candidate": {
          "id": "uuid",
          "name": "Sarah Chen",
          "headline": "Senior PM at Stripe",
          "avatarUrl": "https://...",
          "tags": ["ai-pm", "early-stage"]
        },
        "whyMatch": "Both exploring early AI startups.",
        "activeIntro": {
          "id": "uuid",
          "text": "Hi Sarah, your transition from infra to product...",
          "variant": "professional"
        }
      }
    ]
  },
  "meta": {
    "nextRefreshAt": "2026-07-01T00:00:00.000Z"
  }
}
```

### GET /matches/:id

读取 Match 详情。

Response: 单个 `MatchCardView`，附带更多候选人公开档案字段。

### POST /matches/:id/pass

跳过推荐。

Request:

```json
{
  "reason": "not_relevant"
}
```

Response:

```json
{
  "data": {
    "id": "uuid",
    "state": "rejected"
  }
}
```

### POST /matches/:id/rewrite-intro

改写开场白。

Request:

```json
{
  "variant": "casual"
}
```

Response:

```json
{
  "data": {
    "intro": {
      "id": "uuid",
      "text": "Sarah，你最近从 infra 转到 AI 产品的路径很有意思...",
      "variant": "casual"
    }
  }
}
```

### POST /matches/:id/send

用户授权自己的 Agent 发出邀约并启动 A2A。

Request:

```json
{
  "introId": "uuid",
  "mode": "delegated"
}
```

Response:

```json
{
  "data": {
    "matchId": "uuid",
    "state": "dialogue_running",
    "sessionId": "uuid"
  }
}
```

Rules:

- Match 必须属于当前用户。
- Match 必须是 `pending`。
- 若重复 send，返回 409 并附带已存在的 `sessionId`。

## 7. A2A

### GET /a2a/:sessionId

读取 A2A 进行状态。前端每 2 秒轮询。

Response:

```json
{
  "data": {
    "id": "uuid",
    "matchId": "uuid",
    "state": "running",
    "mode": "delegated",
    "progress": {
      "completedMessages": 4,
      "totalMessages": 10,
      "currentRound": 2,
      "estimatedRemainingSeconds": 45
    },
    "participants": {
      "initiator": {
        "name": "Jingfei",
        "agentLabel": "我的 Agent"
      },
      "receiver": {
        "name": "Sarah Chen",
        "agentLabel": "Sarah 的 Agent"
      }
    },
    "messages": [
      {
        "id": "uuid",
        "round": 1,
        "speaker": "initiator",
        "content": "我是 jingfei 的 Agent...",
        "source": "agent_auto",
        "createdAt": "2026-06-30T12:00:00.000Z"
      }
    ],
    "summaryId": null
  }
}
```

### POST /a2a/:sessionId/abort

中止 A2A。

Response:

```json
{
  "data": {
    "id": "uuid",
    "state": "aborted"
  }
}
```

### POST /a2a/:sessionId/retry

失败后重试。

Response:

```json
{
  "data": {
    "id": "uuid",
    "state": "pending"
  }
}
```

### POST /a2a/:sessionId/review

参与型模式下，用户审核一条 Agent 草稿。

Request:

```json
{
  "draftMessageId": "uuid",
  "action": "approve",
  "editedContent": "optional edited content"
}
```

Response:

```json
{
  "data": {
    "accepted": true
  }
}
```

Rules:

- `action`: `approve | edit | takeover | skip`
- Phase 1 可先不实现 collaborative，只保留接口契约。

## 8. Summary

### GET /summaries/:summaryId

读取 Summary Card。

Response:

```json
{
  "data": {
    "id": "uuid",
    "sessionId": "uuid",
    "candidate": {
      "name": "Sarah Chen",
      "headline": "Senior PM at Stripe",
      "tags": ["ai-pm", "early-stage"]
    },
    "alignmentScore": 8,
    "scoreReason": "都在 early-stage AI，并且都重视 first-principle 产品判断。",
    "yourViewOfThem": "Sarah 从 Stripe infra 转 PM，正在探索...",
    "theirViewOfYou": "她会看到你在 AI 公司 PM 实习...",
    "topics": [
      "AI PM 成长路径",
      "Moonshot 和 Stripe 的系统化产品方法",
      "早期 AI 产品的 first-principle 判断"
    ],
    "riskNote": null,
    "generatedAt": "2026-06-30T12:02:00.000Z",
    "cta": {
      "primary": "schedule_meeting",
      "secondary": "not_interested"
    }
  }
}
```

### POST /summaries/:summaryId/not-interested

用户看完 Summary 后选择不继续。

Response:

```json
{
  "data": {
    "ok": true
  }
}
```

## 9. Public Pages

### GET /public-pages/me

读取本人公开页配置。

### PATCH /public-pages/me

发布或取消发布公开页。

Request:

```json
{
  "isPublished": true
}
```

### GET /u/:slug

公开档案页数据，无需登录。

Response:

```json
{
  "data": {
    "slug": "sarah",
    "profile": {
      "name": "Sarah Chen",
      "headline": "AI PM at Moonshot",
      "avatarUrl": "https://...",
      "bio": "关注 AI 产品和高质量连接。",
      "tags": ["ai-pm", "moonshot", "early-stage"]
    },
    "ogImageUrl": "https://..."
  }
}
```

## 10. Settings

### GET /settings

读取设置页。

Response:

```json
{
  "data": {
    "a2aDefaultMode": "delegated",
    "meetingQuotaPerWeek": 3,
    "notifications": {
      "matchReady": true,
      "summaryReady": true
    }
  }
}
```

### PATCH /settings

更新设置。

Request:

```json
{
  "a2aDefaultMode": "collaborative",
  "meetingQuotaPerWeek": 2,
  "notifications": {
    "matchReady": true,
    "summaryReady": false
  }
}
```

## 11. Feedback

### POST /feedback

Phase 2 会后反馈。

Request:

```json
{
  "meetingId": "uuid",
  "score": 5,
  "tags": ["helpful", "relevant"],
  "comment": "聊得很具体。"
}
```

Response:

```json
{
  "data": {
    "id": "uuid"
  }
}
```

## 12. Polling Rules

| 场景 | 接口 | 频率 | 停止条件 |
|---|---|---|---|
| Profile Agent 生成 | `GET /profiles/generate/:jobId` | 2s | `succeeded` / `failed` |
| Match 生成 | `GET /matches` 或 job endpoint | 2s | 有 cards 或 failed |
| A2A 对话 | `GET /a2a/:sessionId` | 2s | `completed` / `failed` / `aborted` |

## 13. Error Codes

| code | 含义 |
|---|---|
| `VALIDATION_ERROR` | 请求参数错误 |
| `UNAUTHORIZED` | 未登录 |
| `FORBIDDEN` | 无权访问 |
| `NOT_FOUND` | 资源不存在 |
| `MATCH_ALREADY_HANDLED` | Match 已被处理 |
| `A2A_ALREADY_RUNNING` | A2A 已启动 |
| `A2A_FAILED` | 对话生成失败 |
| `PROFILE_GENERATION_FAILED` | 档案生成失败 |
| `LLM_OUTPUT_INVALID` | LLM 输出不符合 schema |
| `RATE_LIMITED` | 触发限流 |
