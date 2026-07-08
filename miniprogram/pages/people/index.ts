import { PersonItemView, fetchPeople, sendMatch } from '../../src/api';
import { USE_MOCK } from '../../src/config';
import { people } from '../../src/mock-data';
import { goA2A, goSummary, goToday } from '../../src/navigation';
import { PEOPLE_STATE } from '../../src/state-fixtures';

function getVisiblePeople(activeTab: string, list: PersonItemView[]): PersonItemView[] {
  if (activeTab === '潜在') {
    return list.filter((person) => person.statusKind === 'potential');
  }
  return list.filter((person) => person.statusKind !== 'potential');
}

Page({
  data: {
    pageState: PEOPLE_STATE,
    tabs: ['已建立', '潜在'],
    activeTab: '已建立',
    people: [] as PersonItemView[],
    visiblePeople: [] as PersonItemView[],
    detailVisible: false,
    detailMatch: {} as PersonItemView,
  },

  onLoad(): void {
    if (USE_MOCK) {
      this.setData({
        people: people.map((person): PersonItemView => ({
          id: person.id,
          name: person.name,
          headline: person.headline,
          avatarSrc: person.avatarSrc,
          status: person.status,
          statusKind: person.statusKind,
        })),
        visiblePeople: getVisiblePeople('已建立', people as unknown as PersonItemView[]),
      });
      return;
    }
    this.loadPeople();
  },

  loadPeople(): void {
    this.setData({ pageState: 'loading' });
    fetchPeople()
      .then((records: PersonItemView[]) => {
        this.setData({
          people: records,
          visiblePeople: getVisiblePeople(this.data.activeTab as string, records),
          pageState: records.length === 0 ? 'empty' : 'ready',
        });
      })
      .catch(() => {
        this.setData({ pageState: 'error' });
      });
  },

  selectTab(event: PairMiniProgram.TapEvent): void {
    const activeTab = event.currentTarget.dataset.tab;
    this.setData({
      activeTab,
      visiblePeople: getVisiblePeople(activeTab, this.data.people as PersonItemView[]),
    });
  },

  openPerson(event: PairMiniProgram.TapEvent): void {
    const dataset = event.currentTarget.dataset;
    const person = this.data.people.find((p) => p.id === dataset.id) as PersonItemView;

    if (!USE_MOCK) {
      if (person?.statusKind === 'potential') {
        this.setData({ detailVisible: true, detailMatch: person });
        return;
      }
      if (dataset.summary) {
        goSummary(dataset.session);
        return;
      }
      if (dataset.session) {
        goA2A(dataset.session);
        return;
      }
      return;
    }

    // Mock routing by id.
    if (dataset.id === 'david') {
      goA2A();
      return;
    }
    goSummary();
  },

  closeMatchDetail(): void {
    this.setData({ detailVisible: false });
  },

  noop(): void {
    // Absorb taps inside the drawer sheet so the mask does not close it.
  },

  sendInvite(): void {
    const match = this.data.detailMatch;
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

  retryPeople(): void {
    if (!USE_MOCK) {
      this.loadPeople();
      return;
    }
    this.setData({ pageState: 'loading' });
    setTimeout(() => this.setData({ pageState: 'ready' }), 500);
  },

  findMore(): void {
    goToday();
  },
});
