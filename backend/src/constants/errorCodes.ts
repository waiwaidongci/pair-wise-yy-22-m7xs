export const ERROR_CODES = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  RBAC_DENIED: "RBAC_DENIED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  RATE_LIMITED: "RATE_LIMITED",
  NOT_FOUND: "NOT_FOUND",
  /** 流程前置条件不满足，例如：方案未通过就拆步骤、步骤未完成就传修复后影像 */
  FLOW_CONFLICT: "FLOW_CONFLICT",
  /** 同一病害已有一份未结束方案 */
  OPEN_PLAN_EXISTS: "OPEN_PLAN_EXISTS",
  /** 方案在审批前内容被修改，需要退回重新提交 */
  PLAN_CONTENT_CHANGED: "PLAN_CONTENT_CHANGED",
  /** 并发冲突：两人同时审批 / 同时提交同一步骤，后到者看到该对象已被处理 */
  ALREADY_PROCESSED: "ALREADY_PROCESSED",
  /** 修复后影像与归档要求未满足（必须前后影像齐全且全部步骤完成） */
  ARCHIVE_NOT_READY: "ARCHIVE_NOT_READY"
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
