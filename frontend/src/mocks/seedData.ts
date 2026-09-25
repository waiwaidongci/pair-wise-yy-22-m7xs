/**
 * 本地档案数据统一来自后端内存库（backend/src/seed.ts），禁止接入第三方 API。
 * 此文件仅保留 mocks 分层占位；前端不再使用内置样例，避免与真实流程脱节。
 */
export const mockData = {
  relicItem: [],
  damageRecord: [],
  restorationPlan: [],
  restorationStep: [],
  imageVersion: []
} as const;
