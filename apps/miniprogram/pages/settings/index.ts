import { goBack, goLogin } from '../../src/navigation';

Page({
  data: {
    items: [
      { label: '我的状态', iconSrc: '/assets/prototype/settings-user.png' },
      { label: '我的 objectives', iconSrc: '/assets/prototype/settings-objective.png' },
      { label: 'A2A 模式偏好', iconSrc: '/assets/prototype/settings-agent.png' },
      { label: '通知设置', iconSrc: '/assets/prototype/settings-bell.png' },
      { label: '屏蔽列表', iconSrc: '/assets/prototype/settings-mute.png' },
      { label: '隐私设置', iconSrc: '/assets/prototype/settings-lock.png' },
      { label: '关于 Pair', iconSrc: '/assets/prototype/settings-info.png' },
    ],
  },

  goBack,

  openItem(event: PairMiniProgram.TapEvent): void {
    const label = event.currentTarget.dataset.label;
    wx.showModal({
      title: label,
      content: '这个设置项会在接入后端后展开，当前前端先保留入口和占位状态。',
      confirmText: '知道了',
    });
  },

  logout(): void {
    wx.showModal({
      title: '退出登录？',
      content: '退出后可以随时重新登录。',
      confirmText: '退出',
      success: (result) => {
        if (result.confirm) {
          goLogin();
        }
      },
    });
  },
});
