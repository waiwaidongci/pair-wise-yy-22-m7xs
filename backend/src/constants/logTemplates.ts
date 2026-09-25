export const LOG_TEMPLATES = {
  RelicItem: {
    create: "RelicItem.create",
    update: "RelicItem.update",
    status: "RelicItem.status",
    conditionChange: "RelicItem.conditionChange",
    export: "RelicItem.export"
  },
  DamageRecord: {
    create: "DamageRecord.create",
    update: "DamageRecord.update",
    status: "DamageRecord.status",
    correct: "DamageRecord.correct",
    close: "DamageRecord.close",
    export: "DamageRecord.export"
  },
  RestorationPlan: {
    create: "RestorationPlan.create",
    update: "RestorationPlan.update",
    submit: "RestorationPlan.submit",
    reset: "RestorationPlan.reset",
    approve: "RestorationPlan.approve",
    reject: "RestorationPlan.reject",
    correct: "RestorationPlan.correct",
    archive: "RestorationPlan.archive",
    export: "RestorationPlan.export"
  },
  RestorationStep: {
    create: "RestorationStep.create",
    update: "RestorationStep.update",
    complete: "RestorationStep.complete",
    affected: "RestorationStep.affected",
    export: "RestorationStep.export"
  },
  ImageVersion: {
    create: "ImageVersion.create",
    upload: "ImageVersion.upload",
    archive: "ImageVersion.archive",
    affected: "ImageVersion.affected",
    export: "ImageVersion.export"
  }
} as const;
