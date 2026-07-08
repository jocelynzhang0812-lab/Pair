declare function App<T extends Record<string, unknown>>(options: T): void;
declare function Page<T extends Record<string, unknown>>(
  options: T & ThisType<T & PairMiniProgram.PageInstance>,
): void;
declare function getApp<T extends Record<string, unknown> = Record<string, unknown>>(): T;
declare function setTimeout(handler: () => void, timeout?: number): number;
declare function clearTimeout(timeoutId: number): void;
declare function setInterval(handler: () => void, timeout?: number): number;
declare function clearInterval(intervalId: number): void;

declare namespace WechatMiniprogram {
  interface GeneralCallbackResult {
    errMsg: string;
  }

  interface LoginSuccessCallbackResult extends GeneralCallbackResult {
    code: string;
  }

  interface NavigateOptions {
    url: string;
  }

  interface SwitchTabOptions {
    url: string;
  }

  interface ToastOptions {
    title: string;
    icon?: 'success' | 'error' | 'loading' | 'none';
    duration?: number;
  }

  interface ModalOptions {
    title: string;
    content: string;
    confirmText?: string;
    cancelText?: string;
    success?: (result: { confirm: boolean; cancel: boolean }) => void;
  }

  interface RequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: Record<string, unknown>;
    header?: Record<string, string>;
    success?: (res: { statusCode: number; data: unknown }) => void;
    fail?: (err: GeneralCallbackResult) => void;
  }
}

declare const wx: {
  login(options: {
    success?: (result: WechatMiniprogram.LoginSuccessCallbackResult) => void;
    fail?: (result: WechatMiniprogram.GeneralCallbackResult) => void;
  }): void;
  navigateTo(options: WechatMiniprogram.NavigateOptions): void;
  redirectTo(options: WechatMiniprogram.NavigateOptions): void;
  reLaunch(options: WechatMiniprogram.NavigateOptions): void;
  switchTab(options: WechatMiniprogram.SwitchTabOptions): void;
  navigateBack(options?: { delta?: number }): void;
  showToast(options: WechatMiniprogram.ToastOptions): void;
  showModal(options: WechatMiniprogram.ModalOptions): void;
  request(options: WechatMiniprogram.RequestOptions): void;
  getStorageSync(key: string): string;
  setStorageSync(key: string, value: string): void;
  removeStorageSync(key: string): void;
};

declare namespace PairMiniProgram {
  type A2AMode = 'delegated' | 'collaborative';

  interface Profile {
    name: string;
    headline: string;
    tags: string[];
    bio: string;
  }

  interface AppGlobalData {
    hasProfile: boolean;
    profile: Profile;
    selectedObjectives: string[];
    a2aMode: A2AMode;
  }

  interface AppOptions extends Record<string, unknown> {
    globalData: AppGlobalData;
  }

  interface PageInstance {
    setData(data: Record<string, unknown>, callback?: () => void): void;
  }

  interface TapEvent {
    currentTarget: {
      dataset: Record<string, string>;
    };
  }
}
