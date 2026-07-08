import { objectives, viewerProfile } from '../../src/mock-data';
import { goToday } from '../../src/navigation';
import {
  ONBOARDING_GENERATION_STATE,
  ONBOARDING_PROFILE_STATE,
  profileMissingFields,
} from '../../src/state-fixtures';

interface ObjectiveOption {
  id: string;
  title: string;
  detail: string;
  selected: boolean;
}

Page({
  data: {
    step: 'identity',
    progress: 18,
    sourceUrl: '',
    sourceError: '',
    generationState: ONBOARDING_GENERATION_STATE,
    profileState: ONBOARDING_PROFILE_STATE,
    profileMissingFields,
    profile: { ...viewerProfile },
    editingProfile: false,
    objectives: objectives.map((item): ObjectiveOption => ({ ...item, selected: item.id === 'mentor' })),
    selectedObjectives: ['mentor'],
    mode: 'delegated',
    tasks: ['正在分析公开内容', '正在提炼关键标签', '正在构建 v0 档案'],
  },

  updateSource(event: { detail: { value: string } }): void {
    this.setData({
      sourceUrl: event.detail.value,
      sourceError: event.detail.value.trim() ? '' : this.data.sourceError,
    });
  },

  startReading(): void {
    const sourceUrl = this.data.sourceUrl as string;

    if (!sourceUrl.trim()) {
      this.setData({ sourceError: '至少粘贴一个公开主页链接或一段介绍' });
      return;
    }

    if (this.data.generationState === 'failed') {
      this.setData({ step: 'reading', progress: 28 });
      return;
    }

    this.setData({ step: 'reading', progress: 36 });
    setTimeout(() => this.setData({ progress: 72 }), 600);
    setTimeout(() => this.setData({ step: 'profile', progress: 100 }), 1300);
  },

  retryGeneration(): void {
    this.setData({ generationState: 'ready' });
    this.startReading();
  },

  manualProfile(): void {
    this.setData({
      step: 'profile',
      progress: 100,
      profileState: 'missing_fields',
    });
  },

  goObjectives(): void {
    this.setData({ step: 'objectives' });
  },

  startEditProfile(): void {
    this.setData({ editingProfile: true });
  },

  updateProfileField(event: {
    currentTarget: { dataset: { field: string } };
    detail: { value: string };
  }): void {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`profile.${field}`]: event.detail.value });
  },

  saveProfile(): void {
    const profile = this.data.profile;
    if (!profile.name.trim() || !profile.headline.trim() || !profile.bio.trim()) {
      wx.showToast({ title: '请先补齐姓名、身份和简介', icon: 'none' });
      return;
    }
    this.setData({ editingProfile: false, profileState: 'ready' });
    wx.showToast({ title: '已更新档案', icon: 'none' });
  },

  toggleObjective(event: PairMiniProgram.TapEvent): void {
    const id = event.currentTarget.dataset.id;
    const current = this.data.selectedObjectives as string[];
    let next: string[];

    if (current.includes(id)) {
      next = current.filter((item) => item !== id);
    } else if (current.length >= 3) {
      wx.showToast({ title: '最多先选 3 个目标', icon: 'none' });
      return;
    } else {
      next = [...current, id];
    }

    this.setData({
      selectedObjectives: next,
      objectives: objectives.map((item): ObjectiveOption => ({
        ...item,
        selected: next.includes(item.id),
      })),
    });
  },

  goMode(): void {
    const current = this.data.selectedObjectives as string[];
    if (current.length < 1) {
      wx.showToast({ title: '至少选择 1 个目标', icon: 'none' });
      return;
    }

    this.setData({ step: 'mode' });
  },

  selectMode(event: PairMiniProgram.TapEvent): void {
    this.setData({ mode: event.currentTarget.dataset.mode });
  },

  finish(): void {
    const app = getApp<PairMiniProgram.AppOptions>();
    app.globalData.hasProfile = true;
    app.globalData.selectedObjectives = this.data.selectedObjectives as string[];
    app.globalData.a2aMode = this.data.mode as PairMiniProgram.A2AMode;
    goToday();
  },
});
