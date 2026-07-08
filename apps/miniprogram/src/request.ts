/**
 * Low-level Mini Program HTTP client.
 *
 * Wraps `wx.request` with a base URL, JWT injection, 401 handling, and a
 * normalized error shape. Pages must not call this directly — they go through
 * the higher-level api in `src/api.ts` so mock and real modes stay symmetric.
 */
import { API_BASE_URL, TOKEN_STORAGE_KEY } from './config';
import { goLogin } from './navigation';

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  /** Backend `details` payload (e.g. `{ sessionId }` on 409 A2A_ALREADY_STARTED). */
  details?: unknown;
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export function getToken(): string {
  try {
    return wx.getStorageSync(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token: string): void {
  wx.setStorageSync(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  try {
    wx.removeStorageSync(TOKEN_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in some contexts; treat as already cleared.
  }
}

/**
 * Perform a request against `@pair/api`. The API wraps successful payloads in
 * `{ data }`, so we unwrap it when present. Rejects with an {@link ApiError}.
 */
export function request<T>(method: Method, path: string, data?: Record<string, unknown>): Promise<T> {
  const token = getToken();
  const header: Record<string, string> = { 'content-type': 'application/json' };
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  return new Promise<T>((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${path}`,
      method,
      data,
      header,
      success: (res) => {
        if (res.statusCode === 401) {
          clearToken();
          goLogin();
          reject({ code: 'UNAUTHORIZED', message: '登录状态已失效，请重新登录。', statusCode: 401 });
          return;
        }
        if (res.statusCode >= 400) {
          const errBody = (res.data ?? {}) as Partial<ApiError>;
          reject({
            code: errBody.code ?? 'REQUEST_FAILED',
            message: errBody.message ?? '请求失败，请稍后再试。',
            statusCode: res.statusCode,
            details: errBody.details,
          });
          return;
        }
        const body = res.data as { data?: T };
        resolve(body && body.data !== undefined ? body.data : (res.data as T));
      },
      fail: () => {
        reject({ code: 'NETWORK_ERROR', message: '网络异常，请检查网络后重试。', statusCode: 0 });
      },
    });
  });
}
