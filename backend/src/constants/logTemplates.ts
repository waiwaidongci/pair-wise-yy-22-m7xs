/**
 * 操作日志模板：每个实体至少 4 条，所有写操作均记录审计日志。
 * 新增字段/动作时需同步审计日志调用处（各 service）。
 */
export const LOG_TEMPLATES = {
  RelicItem: {
    create: "RelicItem.create 文物建档：{relic_code} {name}",
    update: "RelicItem.update 文物信息更新：{relic_code}",
    status: "RelicItem.status 文物状态变更：{relic_code} -> {condition}",
    export: "RelicItem.export 文物档案导出：{relic_code}"
  },
  DamageRecord: {
    create: "DamageRecord.create 病害登记：{damage_no}（文物 {relic_id}）",
    update: "DamageRecord.update 病害信息更正：{damage_no}，生成修订版 {new_no}",
    status: "DamageRecord.status 病害状态变更：{damage_no} -> {status}",
    export: "DamageRecord.export 病害记录导出：{damage_no}",
    correct: "DamageRecord.correct 病害原档更正：{damage_no} 标记为 CORRECTED，下游档案标记受影响"
  },
  RestorationPlan: {
    create: "RestorationPlan.create 方案编制：{plan_no} 沿用病害 {damage_no}，编制人 {author}",
    update: "RestorationPlan.update 方案内容修改：{plan_no}，审批退回重新提交",
    status: "RestorationPlan.status 方案审批状态变更：{plan_no} -> {approval_status}",
    export: "RestorationPlan.export 修复方案导出：{plan_no}",
    submit: "RestorationPlan.submit 方案提交审批：{plan_no}",
    approve: "RestorationPlan.approve 专家审批通过：{plan_no}，审批人 {reviewer}",
    reject: "RestorationPlan.reject 专家审批驳回：{plan_no}，审批人 {reviewer}",
    correct: "RestorationPlan.correct 方案原档更正：{plan_no} 归档并生成修订版 {new_no}",
    archive: "RestorationPlan.archive 方案修复完成归档：{plan_no}"
  },
  RestorationStep: {
    create: "RestorationStep.create 拆修复步骤：{plan_no} 第 {step_order} 步 {technique}",
    update: "RestorationStep.update 步骤信息更新：步骤 {step_id}",
    status: "RestorationStep.status 步骤状态变更：步骤 {step_id} -> {step_status}",
    export: "RestorationStep.export 修复步骤导出：方案 {plan_id}",
    finish: "RestorationStep.finish 步骤完成：步骤 {step_id}，操作人 {operator}"
  },
  ImageVersion: {
    create: "ImageVersion.create 上传影像：{image_type} 影像 版本 V{version_no}（{plan_no}）",
    update: "ImageVersion.update 影像说明更新：影像 {image_id}",
    status: "ImageVersion.status 影像状态变更：影像 {image_id} -> {archived}",
    export: "ImageVersion.export 影像版本导出：文物 {relic_id}",
    archive: "ImageVersion.archive 修复前后影像随方案归档：{plan_no}"
  },
  Auth: {
    login: "Auth.login 用户登录：{name}（{role}）"
  }
} as const;

export type LogTemplate = typeof LOG_TEMPLATES;
