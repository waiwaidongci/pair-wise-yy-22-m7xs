export const LOG_TEMPLATES = {
  RelicItem: {
    create: "文物建档",
    update: "文物更新",
    conditionChange: "文物状态变更",
    export: "文物导出"
  },
  DamageRecord: {
    create: "病害登记",
    update: "病害更新",
    correct: "病害更正",
    close: "病害关闭",
    export: "病害导出"
  },
  RestorationPlan: {
    create: "方案编制",
    update: "方案更新",
    submit: "方案提交审批",
    reset: "审批前修改退回",
    approve: "专家审批通过",
    reject: "专家退回方案",
    correct: "方案更正",
    archive: "方案归档",
    export: "方案导出"
  },
  RestorationStep: {
    create: "步骤拆解",
    complete: "步骤完成",
    affected: "步骤标记受影响",
    export: "步骤导出"
  },
  ImageVersion: {
    upload: "影像上传",
    archive: "影像归档",
    affected: "影像标记受影响",
    export: "影像导出"
  }
} as const;
