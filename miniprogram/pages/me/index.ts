import { MeView, getMe, getPublicPageMe, publishPublicPage } from '../../src/api';
import { USE_MOCK } from '../../src/config';
import { viewerProfile } from '../../src/mock-data';
import { goSettings } from '../../src/navigation';
import { ME_PUBLIC_PROFILE_PUBLISHED } from '../../src/state-fixtures';

Page({
  data: {
    profile: {
      name: viewerProfile.name,
      headline: viewerProfile.headline,
      bio: viewerProfile.bio,
      tags: viewerProfile.tags,
      pairProfileUrl: '',
    } as MeView,
    publicProfilePublished: ME_PUBLIC_PROFILE_PUBLISHED,
    settings: [
      '我的状态',
      '我的 objectives',
      'A2A 模式偏好',
      '追踪设置',
      '屏蔽列表',
      '隐私设置',
      '关于 Pair',
    ],
  },

  onLoad(): void {
    if (USE_MOCK) {
      this.setData({ publicProfilePublished: ME_PUBLIC_PROFILE_PUBLISHED });
      return;
    }
    this.loadMe();
  },

  loadMe(): void {
    getMe()
      .then((me: MeView) => {
        this.setData({ profile: me, publicProfilePublished: me.publicPagePublished });
      })
      .catch(() => {
        wx.showToast({ title: '档案加载失败', icon: 'none' });
      });
  },

  openSettings(): void {
    goSettings();
  },

  publishProfile(): void {
    if (USE_MOCK) {
      this.setData({ publicProfilePublished: true });
      wx.showToast({ title: '公开档案已发布', icon: 'none' });
      return;
    }
    publishPublicPage()
      .then(() => getPublicPageMe())
      .then((view) => {
        this.setData({ publicProfilePublished: view.publicPagePublished });
        wx.showToast({ title: '公开档案已发布', icon: 'none' });
      })
      .catch(() => {
        wx.showToast({ title: '发布失败，请重试', icon: 'none' });
      });
  },

  previewProfile(): void {
    const slug = this.data.profile.pairProfileUrl;
    if (slug) {
      wx.showToast({ title: `预览 /u/${slug} 开发中`, icon: 'none' });
      return;
    }
    wx.showToast({ title: '公开页预览开发中', icon: 'none' });
  },
});
