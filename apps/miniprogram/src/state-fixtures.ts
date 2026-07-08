export type SurfaceState = 'loading' | 'ready' | 'empty' | 'error' | 'failed';
export type A2AViewState = 'running' | 'failed' | 'aborted';
export type SummaryViewState = 'ready' | 'missing';
export type ProfilePreviewState = 'ready' | 'missing_fields';

/**
 * Mini Program local state switches.
 *
 * Keep defaults on the happy path. To review edge states in WeChat DevTools,
 * change the constants below and recompile the Mini Program.
 */
export const TODAY_STATE: SurfaceState = 'ready';
export const ONBOARDING_PROFILE_STATE: ProfilePreviewState = 'ready';
export const ONBOARDING_GENERATION_STATE: SurfaceState = 'ready';
export const A2A_STATE: A2AViewState = 'running';
export const SUMMARY_STATE: SummaryViewState = 'ready';
export const PEOPLE_STATE: SurfaceState = 'ready';
export const CHATS_STATE: SurfaceState = 'ready';
export const ME_PUBLIC_PROFILE_PUBLISHED = false;

export const profileMissingFields = ['姓名', '一句话身份', '简介'];
