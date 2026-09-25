/**
 * 前端操作日志文案：与后端 constants/logTemplates.ts 对应，
 * 每个实体至少 4 条；所有写操作在后端落审计日志，前端用于时间线展示。
 */
export const LOG_TEMPLATES = {
  RelicItem: {
    create: "文物建档",
    update: "文物信息更新",
    status: "文物状态变更",
    export: "文物档案导出"
  },
  DamageRecord: {
    create: "病害登记",
    update: "病害信息更正",
    status: "病害状态变更",
    export: "病害记录导出",
    correct: "病害原档更正，下游档案标记受影响"
  },
  RestorationPlan: {
    create: "方案编制（沿用病害编号）",
    update: "方案内容修改，审批退回重新提交",
    status: "方案审批状态变更",
    export: "修复方案导出",
    submit: "方案提交审批",
    approve: "专家审批通过",
    reject: "专家审批驳回",
    correct: "方案更正生成修订版",
    archive: "修复完成方案归档"
  },
  RestorationStep: {
    create: "拆解修复步骤",
    update: "步骤信息更新",
    status: "步骤状态变更",
    export: "修复步骤导出",
    finish: "步骤完成，回写材料/操作人/完成时间"
  },
  ImageVersion: {
    create: "上传修复影像",
    update: "影像说明更新",
    status: "影像状态变更",
    export: "影像版本导出",
    archive: "修复前后影像随方案归档"
  }
} as const;
