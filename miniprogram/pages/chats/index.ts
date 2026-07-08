import { ChatItemView, fetchChats } from '../../src/api';
import { USE_MOCK } from '../../src/config';
import { chats } from '../../src/mock-data';
import { goA2A, goSummary, goToday } from '../../src/navigation';
import { CHATS_STATE } from '../../src/state-fixtures';

Page({
  data: {
    pageState: CHATS_STATE,
    chats,
  },

  onLoad(): void {
    // Mock mode keeps the static list + CHATS_STATE review switch. Real mode
    // derives A2A history from the backend (matches that have a session).
    if (USE_MOCK) {
      return;
    }
    this.loadChats();
  },

  loadChats(): void {
    this.setData({ pageState: 'loading' });
    fetchChats()
      .then((records: ChatItemView[]) => {
        this.setData({
          chats: records,
          pageState: records.length === 0 ? 'empty' : 'ready',
        });
      })
      .catch(() => {
        this.setData({ pageState: 'error' });
      });
  },

  openChat(event: PairMiniProgram.TapEvent): void {
    const dataset = event.currentTarget.dataset;

    if (!USE_MOCK) {
      if (dataset.summary) {
        goSummary(dataset.session);
        return;
      }
      if (dataset.session) {
        goA2A(dataset.session);
      }
      return;
    }

    // Mock routing by id.
    if (dataset.id === 'chat_david' || dataset.id === 'chat_maya') {
      goA2A();
      return;
    }
    goSummary();
  },

  retryChats(): void {
    if (!USE_MOCK) {
      this.loadChats();
      return;
    }
    this.setData({ pageState: 'loading' });
    setTimeout(() => this.setData({ pageState: 'ready' }), 500);
  },

  goToday,
});
