// The four tab pages (Today / People / Chats / Me) are navigation roots, so
// switching between them uses reLaunch to reset the page stack — matching a
// fixed bottom tab bar and preventing A2A/Summary from being stranded in the
// stack (design-document §3 主导航). A2A / Summary / Settings are detail pages
// pushed with navigateTo and popped with navigateBack.

export function goLogin(): void {
  wx.reLaunch({ url: '/pages/login/index' });
}

export function goOnboarding(): void {
  wx.navigateTo({ url: '/pages/onboarding/index' });
}

export function goToday(): void {
  wx.reLaunch({ url: '/pages/today/index' });
}

export function goPeople(): void {
  wx.reLaunch({ url: '/pages/people/index' });
}

export function goChats(): void {
  wx.reLaunch({ url: '/pages/chats/index' });
}

export function goMe(): void {
  wx.reLaunch({ url: '/pages/me/index' });
}

export function goA2A(sessionId?: string): void {
  const query = sessionId ? `?sessionId=${sessionId}` : '';
  wx.navigateTo({ url: `/pages/a2a/index${query}` });
}

export function goSummary(sessionId?: string): void {
  const query = sessionId ? `?sessionId=${sessionId}` : '';
  wx.navigateTo({ url: `/pages/summary/index${query}` });
}

export function goSettings(): void {
  wx.navigateTo({ url: '/pages/settings/index' });
}

export function goBack(): void {
  wx.navigateBack({ delta: 1 });
}
