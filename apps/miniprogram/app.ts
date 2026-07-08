import { viewerProfile } from './src/mock-data';

App<PairMiniProgram.AppOptions>({
  globalData: {
    hasProfile: false,
    profile: viewerProfile,
    selectedObjectives: ['mentor'],
    a2aMode: 'delegated',
  },
});
