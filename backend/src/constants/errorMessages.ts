export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "缺少登录信息，请先登录",
  RBAC_DENIED: "当前角色无权执行该操作",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  NOT_FOUND: "记录不存在或已归档更正",
  FLOW_CONFLICT: "当前流程状态不允许执行该操作",
  OPEN_PLAN_EXISTS: "同一病害只能存在一份未结束方案，请先结束或更正现有方案",
  PLAN_CONTENT_CHANGED: "方案在提交后被修改过，已退回草稿，请重新提交",
  ALREADY_PROCESSED: "该记录已被另一位用户先行处理，请刷新查看最新状态",
  ARCHIVE_NOT_READY: "全部步骤完成并上传修复前、修复后影像后才能归档"
} as const;
