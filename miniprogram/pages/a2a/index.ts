import { A2ASessionView, abortA2ASession, getA2ASession } from '../../src/api';
import { A2A_POLL_INTERVAL_MS, USE_MOCK } from '../../src/config';
import { dialogueMessages } from '../../src/mock-data';
import { goBack, goToday } from '../../src/navigation';
import { A2A_STATE } from '../../src/state-fixtures';

const MODE_LABEL: Record<PairMiniProgram.A2AMode, string> = {
  delegated: '切换到参与型',
  collaborative: '切换到托付型',
};

Page({
  data: {
    // Widened to string because polling can reach 'completed', which is not
    // part of the A2A_STATE review switch.
    a2aState: A2A_STATE as string,
    visibleMessages: dialogueMessages.slice(0, 1),
    progress: 0,
    round: 1,
    estimatedSeconds: 0,
    sessionId: '',
    mode: 'delegated' as PairMiniProgram.A2AMode,
    modeLabel: MODE_LABEL.delegated,
  },

  // Polling timer id; 0 means "not polling".
  _timer: 0,

  onLoad(query: Record<string, string | undefined>): void {
    const app = getApp<{ globalData: PairMiniProgram.AppGlobalData }>();
    const mode = app.globalData.a2aMode;
    // Only mock mode has a synthetic default session; real mode must be given
    // a real session id via navigation.
    const sessionId = query.sessionId || (USE_MOCK ? 'session_sarah' : '');
    this.setData({ sessionId, mode, modeLabel: MODE_LABEL[mode] });

    // Preset failed/aborted review states keep already-visible messages and
    // do not poll (Step 5.4.5).
    if (this.data.a2aState !== 'running') {
      this.setData({ visibleMessages: dialogueMessages.slice(0, 2), progress: 52, round: 2 });
      return;
    }

    // Real mode reached without a session id — show failed instead of polling
    // a bogus id (which the backend rejects with 500 on non-UUID input).
    if (!sessionId) {
      this.setData({ a2aState: 'failed', visibleMessages: [] });
      return;
    }

    this.startPolling();
  },

  onUnload(): void {
    this.stopPolling();
  },

  startPolling(): void {
    this.poll();
    this._timer = setInterval(() => {
      this.poll();
    }, A2A_POLL_INTERVAL_MS);
  },

  stopPolling(): void {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = 0;
    }
  },

  poll(): void {
    getA2ASession(this.data.sessionId)
      .then((session: A2ASessionView) => {
        this.applySession(session);
      })
      .catch(() => {
        this.stopPolling();
        this.setData({ a2aState: 'failed' });
      });
  },

  applySession(session: A2ASessionView): void {
    this.setData({
      visibleMessages: session.messages,
      progress: session.progress,
      round: session.currentRound,
      estimatedSeconds: Math.round(session.estimatedSeconds),
    });

    if (session.status === 'running') {
      return;
    }

    // Any terminal status stops the poll loop.
    this.stopPolling();
    this.setData({ a2aState: session.status });
  },

  goBack,
  goToday,

  abort(): void {
    wx.showModal({
      title: '截停对话？',
      content: '这会停止本轮 Agent 对齐，你可以稍后重新发起。',
      confirmText: '截停',
      success: (result) => {
        if (!result.confirm) {
          return;
        }
        this.stopPolling();
        abortA2ASession(this.data.sessionId)
          .then((session: A2ASessionView) => {
            this.setData({
              a2aState: 'aborted',
              visibleMessages: session.messages,
              progress: session.progress,
            });
          })
          .catch(() => {
            this.setData({ a2aState: 'aborted' });
          });
      },
    });
  },

  retryA2A(): void {
    this.stopPolling();

    if (!USE_MOCK) {
      // Real mode: re-poll the same session; nothing to fabricate.
      if (!this.data.sessionId) {
        goToday();
        return;
      }
      this.setData({ a2aState: 'running', progress: 0, round: 1, estimatedSeconds: 0 });
      this.startPolling();
      return;
    }

    // Mock: a fresh session id restarts the simulated timeline.
    this.setData({
      a2aState: 'running',
      sessionId: `session_${Date.now()}`,
      visibleMessages: dialogueMessages.slice(0, 1),
      progress: 0,
      round: 1,
      estimatedSeconds: 0,
    });
    this.startPolling();
  },

  toggleMode(): void {
    const next: PairMiniProgram.A2AMode =
      this.data.mode === 'delegated' ? 'collaborative' : 'delegated';
    getApp<{ globalData: PairMiniProgram.AppGlobalData }>().globalData.a2aMode = next;
    this.setData({ mode: next, modeLabel: MODE_LABEL[next] });
    wx.showToast({
      title: next === 'collaborative' ? '已切换到参与型' : '已切换到托付型',
      icon: 'none',
    });
  },

  // A2A is now a secondary "full dialogue" view reached from Summary/Chats, so
  // completing just returns to wherever it was opened from.
  finish(): void {
    goBack();
  },
});
