import { fetchMatches, passMatch as apiPassMatch, sendMatch } from '../../src/api';
import { USE_MOCK } from '../../src/config';
import { MatchView, todayMatches } from '../../src/mock-data';
import { goSummary } from '../../src/navigation';
import { TODAY_STATE } from '../../src/state-fixtures';

interface DragChangeEvent {
  detail: {
    x: number;
  };
}

Page({
  data: {
    greeting: '下午好，jingfei',
    pageState: TODAY_STATE,
    matches: todayMatches,
    activeIndex: 0,
    activeMatch: todayMatches[0],
    nextMatch: todayMatches[1],
    archivedMatches: [],
    dragX: 0,
    detailVisible: false,
    detailMatch: todayMatches[0],
  },

  onLoad(): void {
    // Mock mode keeps the static happy-path deck + the TODAY_STATE review
    // switch untouched. Real mode loads matches through the api client.
    if (USE_MOCK) {
      return;
    }
    this.loadMatches();
  },

  loadMatches(): void {
    this.setData({ pageState: 'loading' });
    fetchMatches()
      .then((matches: MatchView[]) => {
        if (matches.length === 0) {
          this.setData({ pageState: 'empty', matches: [], archivedMatches: [] });
          return;
        }
        this.setData({
          pageState: 'ready',
          matches,
          activeIndex: 0,
          activeMatch: matches[0],
          nextMatch: matches[1],
          detailMatch: matches[0],
          archivedMatches: [],
        });
      })
      .catch(() => {
        this.setData({ pageState: 'error' });
      });
  },

  handleDragChange(event: DragChangeEvent): void {
    this.setData({ dragX: event.detail.x });
  },

  handleDragEnd(): void {
    const currentX = this.data.dragX as number;

    if (currentX < 120) {
      this.setData({ dragX: 0 });
      return;
    }

    this.advanceCard();
  },

  advanceCard(): void {
    const matches = this.data.matches as typeof todayMatches;
    const activeIndex = this.data.activeIndex as number;
    const archivedMatches = this.data.archivedMatches as typeof todayMatches;
    const current = matches[activeIndex];
    const nextIndex = (activeIndex + 1) % matches.length;
    const followingIndex = (nextIndex + 1) % matches.length;

    this.setData({
      activeIndex: nextIndex,
      activeMatch: matches[nextIndex],
      nextMatch: matches[followingIndex],
      archivedMatches: [current, ...archivedMatches].slice(0, 4),
      dragX: 0,
    });
  },

  openMatchDetail(): void {
    this.setData({ detailVisible: true, detailMatch: this.data.activeMatch });
  },

  closeMatchDetail(): void {
    this.setData({ detailVisible: false });
  },

  noop(): void {
    // Absorb taps inside the drawer sheet so the mask does not close it.
  },

  sendInvite(): void {
    const match = this.data.activeMatch;
    this.setData({ detailVisible: false });
    wx.showToast({ title: 'Agent 已开始对齐', icon: 'none' });
    sendMatch(match.id)
      .then((res) => {
        goSummary(res.sessionId);
      })
      .catch(() => {
        wx.showToast({ title: '发起失败，请稍后再试', icon: 'none' });
      });
  },

  passMatch(): void {
    const match = this.data.activeMatch;
    this.setData({ detailVisible: false });
    wx.showToast({ title: '已放到底部栏', icon: 'none' });
    void apiPassMatch(match.id).catch(() => undefined);
    this.advanceCard();
  },

  rewriteIntro(): void {
    wx.showToast({ title: '已改写开场白', icon: 'none' });
  },

  retryLoad(): void {
    if (!USE_MOCK) {
      this.loadMatches();
      return;
    }
    this.setData({ pageState: 'loading' });
    setTimeout(() => this.setData({ pageState: 'ready' }), 500);
  },

  adjustObjective(): void {
    wx.navigateTo({ url: '/pages/onboarding/index' });
  },
});
