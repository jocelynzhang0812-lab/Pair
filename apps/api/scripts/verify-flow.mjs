const baseUrl = process.env.PAIR_API_BASE_URL ?? 'http://127.0.0.1:3000';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...options.headers,
    },
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${response.status} ${JSON.stringify(body)}`);
  }

  return body.data;
}

async function pollA2A(sessionId, headers, timeoutMs = 60_000, intervalMs = 2_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const a2a = await request(`/a2a/${sessionId}`, { headers });

    if (a2a.state === 'completed' && a2a.summaryId) {
      return a2a;
    }
    if (a2a.state === 'aborted' || a2a.state === 'failed') {
      throw new Error(`A2A session ${sessionId} ended in state ${a2a.state}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`A2A session ${sessionId} did not complete within ${timeoutMs}ms`);
}

const health = await request('/health');
const login = await request('/auth/mock-login', {
  method: 'POST',
  body: JSON.stringify({
    provider: 'email',
    providerId: 'verify@pair.local',
    name: 'Verify User',
  }),
});
const authHeaders = {
  authorization: `Bearer ${login.accessToken}`,
};

const wechatLogin = await request('/auth/wechat-login', {
  method: 'POST',
  body: JSON.stringify({
    code: 'verify-wechat-code',
  }),
});
const me = await request('/me', { headers: authHeaders });
const profileGeneration = await request('/profiles/generate', {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    sourceUrl: 'https://linkedin.com/in/verify',
    pastedText:
      'Name: Verify User\nTitle: AI PM at Pair\nFocused on agent UX, early-stage AI products, and structured networking.',
    locale: 'zh-CN',
  }),
});
const profileJob = await request(`/jobs/${profileGeneration.jobId}`, { headers: authHeaders });
const generatedDraft = await request(`/profiles/generate/${profileGeneration.jobId}`, {
  headers: authHeaders,
});
const confirmedProfile = await request('/profiles/confirm-draft', {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    draftId: profileGeneration.draftId,
  }),
});
const matches = await request('/matches', { headers: authHeaders });

if (!matches.length) {
  throw new Error('GET /matches returned an empty list');
}

const match = matches[0];
let send;
try {
  send = await request(`/matches/${match.id}/send`, {
    method: 'POST',
    headers: authHeaders,
  });
} catch (error) {
  const existingSessionId = match.session?.id;
  if (!existingSessionId) {
    throw error;
  }

  send = {
    matchId: match.id,
    sessionId: existingSessionId,
    summaryId: match.session.summaryId,
    state: match.state,
  };
}

// The dialogue now runs asynchronously via BullMQ; poll until it completes.
const a2a = await pollA2A(send.sessionId, authHeaders);
const summaryId = a2a.summaryId;

if (!summaryId) {
  throw new Error('A2A verification did not produce a summary id');
}

const summary = await request(`/summaries/${summaryId}`, { headers: authHeaders });
const publicPage = await request(`/u/${me.pairProfileUrl}`);

console.log(
  JSON.stringify(
    {
      health,
      userId: me.id,
      wechatUserId: wechatLogin.user.id,
      profileJobId: profileJob.id,
      profileDraftId: generatedDraft.draftId,
      confirmedProfileName: confirmedProfile.profile.name,
      matchId: match.id,
      sessionId: a2a.id,
      summaryId: summary.id,
      messageCount: a2a.messages.length,
      alignmentScore: summary.alignmentScore,
      publicSlug: publicPage.slug,
    },
    null,
    2,
  ),
);
