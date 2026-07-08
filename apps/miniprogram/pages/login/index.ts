import { login } from '../../src/api';
import { goOnboarding, goToday } from '../../src/navigation';

Page({
  data: {
    loading: false,
  },

  handleWechatLogin(): void {
    this.setData({ loading: true });

    wx.login({
      success: () => {
        login()
          .then((res) => {
            const app = getApp<PairMiniProgram.AppOptions>();
            app.globalData.hasProfile = res.hasProfile;
            if (res.hasProfile) {
              goToday();
              return;
            }
            goOnboarding();
          })
          .catch(() => {
            this.setData({ loading: false });
            wx.showToast({ title: '登录失败，请重试', icon: 'none' });
          });
      },
      fail: () => {
        this.setData({ loading: false });
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      },
    });
  },

  handleGoogleLogin(): void {
    wx.showToast({ title: 'Demo 先走微信登录', icon: 'none' });
    this.handleWechatLogin();
  },
});
