import { A2ASessionView, getA2ASession } from '../../src/api';
import { A2A_POLL_INTERVAL_MS, USE_MOCK } from '../../src/config';
import { summary } from '../../src/mock-data';
import { goA2A, goBack, goToday } from '../../src/navigation';
import { SUMMARY_STATE } from '../../src/state-fixtures';

Page({
  data: {
    // Widened to string to allow the transient 'loading' (aligning) state.
    summaryState: SUMMARY_STATE as string,
    summary,
    sessionId: '',
  },

  // Polling timer id; 0 means "not polling".
  _timer: 0,

  onLoad(query: Record<string, string | undefined>): void {
    const sessionId = query.sessionId || '';
    this.setData({ sessionId });

    // Mock mode keeps the static summary + SUMMARY_STATE review switch.
    if (USE_MOCK) {
      return;
    }

    if (!sessionId) {
      this.setData({ summaryState: 'missing' });
      return;
    }

    // Summary is the decision screen: wait here while the Agents align, then
    // show the card. The full dialogue is reachable via 查看完整对话.
    this.setData({ summaryState: 'loading' });
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
        const view = session.summary;
        if (view) {
          this.stopPolling();
          this.setData({
            summaryState: 'ready',
            summary: {
              score: view.score,
              oneLine: view.oneLine,
              yourView: view.yourView ?? '',
              theirView: view.theirView ?? '',
              topics: view.topics,
              risk: view.risk ?? '',
            },
          });
          return;
        }
        if (session.status === 'aborted' || session.status === 'failed') {
          this.stopPolling();
          this.setData({ summaryState: 'missing' });
        }
        // running / pending: keep waiting on the loading state.
      })
      .catch(() => {
        this.stopPolling();
        this.setData({ summaryState: 'missing' });
      });
  },

  viewDialogue(): void {
    goA2A(this.data.sessionId);
  },

  goBack,
  goToday,

  schedule(): void {
    wx.showModal({
      title: '排期功能开发中',
      content: 'Phase 1 先记录意向，后续会接入日历和微信提醒。',
      confirmText: '知道了',
    });
  },

  notInterested(): void {
    wx.showModal({
      title: '暂时不见？',
      content: 'Pair 会记录你的判断，后续少推荐类似低匹配意图的人。',
      confirmText: '不见了',
      cancelText: '再看看',
      success: (result) => {
        if (result.confirm) {
          goToday();
        }
      },
    });
  },
});
