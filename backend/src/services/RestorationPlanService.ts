import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { createRestorationPlanFormDto } from "../constructors/RestorationPlanDtoFactory";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { nextId, nowIso, buildPlanNo } from "../utils/ids";
import { notFound, validation, conflict } from "../utils/AppError";
import { planContentFingerprint } from "../utils/formatters";
import { writeAudit } from "../utils/audit";
import { writeLock } from "../utils/SerialLock";
import type { Actor } from "../models/Actor";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationPlanPayload, PlanApprovalPayload } from "../types/RestorationPlanPayload";

const requireText = (value: unknown, label: string) => {
  const text = String(value ?? "").trim();
  if (!text) throw validation(`${label}不能为空`);
  return text;
};

const getPlanOrThrow = (id: number): RestorationPlan => {
  const plan = restorationPlanRepository.findById(id);
  if (!plan) throw notFound("PLAN_NOT_FOUND");
  return plan;
};

/** 已被更正标记受影响的旧档，只能查看不能继续流转。 */
const assertNotAffected = (plan: RestorationPlan) => {
  if (plan.affected) throw conflict("PLAN_AFFECTED");
};

/** 方案级更正：旧方案之后的步骤、影像保留旧档并标记受影响。 */
const markPlanChainAffected = (planId: number) => {
  restorationStepRepository.findByPlan(planId).forEach((step) => {
    if (!step.affected) restorationStepRepository.update(step.id, { affected: true });
  });
  imageVersionRepository.findByPlan(planId).forEach((image) => {
    if (!image.affected) imageVersionRepository.update(image.id, { affected: true });
  });
};

export const restorationPlanService = {
  list() {
    return restorationPlanRepository.findAll();
  },

  /** 病害登记后编制方案：沿用病害编号、记录编制人；同一病害仅一份未结束方案。 */
  async create(actor: Actor, payload: RestorationPlanPayload): Promise<RestorationPlan> {
    return writeLock.run(async () => {
      const damageId = Number(payload.damage_record_id);
      const damage = damageRecordRepository.findById(damageId);
      if (!damage) throw notFound("DAMAGE_NOT_FOUND");
      if (damage.status === "SUPERSEDED" || damage.status === "CLOSED") {
        throw conflict("DAMAGE_CANNOT_CORRECT", "病害已关闭或已被更正，不能再编制方案");
      }
      if (restorationPlanRepository.findOpenByDamage(damageId)) {
        throw conflict("PLAN_ACTIVE_EXISTS");
      }
      const planTitle = requireText(payload.plan_title, "方案标题");
      const method = requireText(payload.method, "修复方法");
      const risk = requireText(payload.risk_assessment, "风险评估");
      const timestamp = nowIso();
      const row = createRestorationPlanFormDto({
        plan_no: buildPlanNo(damage.damage_no, 1),
        relic_id: damage.relic_id,
        damage_record_id: damage.id,
        damage_no: damage.damage_no,
        plan_title: planTitle,
        method,
        risk_assessment: risk,
        approval_status: "DRAFT",
        owner_id: actor.id,
        owner_name: actor.name,
        revision_no: 1,
        content_version: 1,
        created_at: timestamp,
        updated_at: timestamp
      });
      const created = restorationPlanRepository.create({ ...row, id: nextId(restorationPlanRepository.findAll()) });
      damageRecordRepository.update(damage.id, { status: "IN_TREATMENT", updated_at: timestamp });
      writeAudit(
        actor,
        LOG_TEMPLATES.RestorationPlan.create,
        "RestorationPlan",
        created.id,
        `${actor.name} 依据 ${damage.damage_no} 编制方案 ${created.plan_no}`
      );
      return created;
    });
  },

  /** 编制人修改内容：若已提交审批，则自动退回草稿，专家稍后审批将看到"内容被修改"。 */
  async updateContent(actor: Actor, id: number, payload: RestorationPlanPayload): Promise<RestorationPlan> {
    return writeLock.run(async () => {
      const plan = getPlanOrThrow(id);
      assertNotAffected(plan);
      if (plan.approval_status === "ARCHIVED") throw conflict("PLAN_ALREADY_ARCHIVED");
      if (plan.approval_status === "APPROVED") {
        throw conflict("PLAN_NOT_CORRECTABLE", "已通过方案不能直接修改，请发起更正");
      }
      if (plan.owner_id !== actor.id) throw conflict("RBAC_DENIED", "仅编制人可以修改方案内容");

      const patch: Partial<RestorationPlan> = {
        plan_title: payload.plan_title !== undefined ? requireText(payload.plan_title, "方案标题") : plan.plan_title,
        method: payload.method !== undefined ? requireText(payload.method, "修复方法") : plan.method,
        risk_assessment:
          payload.risk_assessment !== undefined ? requireText(payload.risk_assessment, "风险评估") : plan.risk_assessment,
        updated_at: nowIso()
      };

      const fingerprintChanged =
        planContentFingerprint({ plan_title: patch.plan_title!, method: patch.method!, risk_assessment: patch.risk_assessment! }) !==
        planContentFingerprint(plan);

      if (plan.approval_status === "SUBMITTED" && fingerprintChanged) {
        patch.approval_status = "DRAFT";
        patch.submitted_at = null;
        writeAudit(
          actor,
          LOG_TEMPLATES.RestorationPlan.reset,
          "RestorationPlan",
          id,
          `方案 ${plan.plan_no} 审批前内容被修改，退回编制人重新提交`
        );
      } else {
        writeAudit(actor, LOG_TEMPLATES.RestorationPlan.update, "RestorationPlan", id, `方案 ${plan.plan_no} 内容更新`);
      }
      if (fingerprintChanged) patch.content_version = plan.content_version + 1;
      return restorationPlanRepository.update(id, patch)!;
    });
  },

  async submit(actor: Actor, id: number): Promise<RestorationPlan> {
    return writeLock.run(async () => {
      const plan = getPlanOrThrow(id);
      assertNotAffected(plan);
      if (plan.approval_status !== "DRAFT" && plan.approval_status !== "REJECTED") {
        throw conflict("INVALID_STATE", "仅草稿或被退回方案可以提交审批");
      }
      if (plan.owner_id !== actor.id) throw conflict("RBAC_DENIED", "仅编制人可以提交方案");
      const timestamp = nowIso();
      restorationPlanRepository.update(id, {
        approval_status: "SUBMITTED",
        submitted_at: timestamp,
        submitted_content_version: plan.content_version,
        reject_reason: null,
        updated_at: timestamp
      });
      writeAudit(actor, LOG_TEMPLATES.RestorationPlan.submit, "RestorationPlan", id, `方案 ${plan.plan_no} 提交专家审批`);
      return restorationPlanRepository.findById(id)!;
    });
  },

  /**
   * 专家审批：必须在串行锁内重新读取并比对提交时内容指纹。
   * 两位专家同时通过时，第二位看到的已不是 SUBMITTED，返回 409 已被处理。
   */
  async decide(actor: Actor, id: number, approved: boolean, payload: PlanApprovalPayload): Promise<RestorationPlan> {
    return writeLock.run(async () => {
      const plan = getPlanOrThrow(id);
      assertNotAffected(plan);
      if (plan.approval_status !== "SUBMITTED") {
        throw conflict("PLAN_ALREADY_PROCESSED");
      }
      // 提交后内容若被修改，content_version 会前进，审批一律退回重新提交。
      if (
        plan.submitted_content_version === null ||
        plan.submitted_content_version !== plan.content_version
      ) {
        restorationPlanRepository.update(id, { approval_status: "DRAFT", submitted_at: null });
        throw conflict("PLAN_CONTENT_CHANGED");
      }

      const timestamp = nowIso();
      if (approved) {
        restorationPlanRepository.update(id, {
          approval_status: "APPROVED",
          approved_by: actor.id,
          approved_by_name: actor.name,
          approved_at: timestamp,
          reject_reason: null,
          updated_at: timestamp
        });
        relicItemRepository.update(plan.relic_id, { current_condition: "IN_RESTORATION" });
        writeAudit(actor, LOG_TEMPLATES.RestorationPlan.approve, "RestorationPlan", id, `专家 ${actor.name} 审批通过 ${plan.plan_no}`);
      } else {
        restorationPlanRepository.update(id, {
          approval_status: "REJECTED",
          reject_reason: String(payload.comment ?? "未填写退回意见"),
          updated_at: timestamp
        });
        writeAudit(
          actor,
          LOG_TEMPLATES.RestorationPlan.reject,
          "RestorationPlan",
          id,
          `专家 ${actor.name} 退回方案 ${plan.plan_no}：${payload.comment ?? "无意见"}`
        );
      }
      return restorationPlanRepository.findById(id)!;
    });
  },

  /** 方案更正：仅 APPROVED 方案可发起；旧步骤/影像保留并标记受影响，新版本回到草稿。 */
  async correct(actor: Actor, id: number, payload: RestorationPlanPayload): Promise<RestorationPlan> {
    return writeLock.run(async () => {
      const origin = getPlanOrThrow(id);
      if (origin.affected) throw conflict("PLAN_AFFECTED");
      if (origin.approval_status !== "APPROVED") throw conflict("PLAN_NOT_CORRECTABLE");
      // 若病害本身已被更正，方案更正须挂到病害的最新更正版本上。
      const damageChain = damageRecordRepository.findByDamageNo(origin.damage_no);
      const latestDamage =
        damageChain
          .filter((damage) => damage.status !== "SUPERSEDED")
          .sort((a, b) => b.revision_no - a.revision_no)[0] ??
        damageRecordRepository.findById(origin.damage_record_id)!;
      if (restorationPlanRepository.findOpenByDamage(latestDamage.id)) {
        throw conflict("PLAN_ACTIVE_EXISTS", "该病害已有未结束方案，不能再发起更正");
      }
      const timestamp = nowIso();
      const revisionNo =
        restorationPlanRepository
          .findByDamage(latestDamage.id)
          .reduce((max, plan) => Math.max(max, plan.revision_no), origin.revision_no) + 1;
      const row = createRestorationPlanFormDto({
        plan_no: buildPlanNo(origin.damage_no, revisionNo),
        relic_id: latestDamage.relic_id,
        damage_record_id: latestDamage.id,
        damage_no: origin.damage_no,
        plan_title: payload.plan_title !== undefined ? requireText(payload.plan_title, "方案标题") : origin.plan_title,
        method: payload.method !== undefined ? requireText(payload.method, "修复方法") : origin.method,
        risk_assessment:
          payload.risk_assessment !== undefined ? requireText(payload.risk_assessment, "风险评估") : origin.risk_assessment,
        approval_status: "DRAFT",
        owner_id: actor.id,
        owner_name: actor.name,
        revision_no: revisionNo,
        content_version: 1,
        created_at: timestamp,
        updated_at: timestamp
      });
      const revision = restorationPlanRepository.create({ ...row, id: nextId(restorationPlanRepository.findAll()) });
      restorationPlanRepository.update(origin.id, {
        superseded_by_id: revision.id,
        affected: true,
        updated_at: timestamp
      });
      markPlanChainAffected(origin.id);
      writeAudit(
        actor,
        LOG_TEMPLATES.RestorationPlan.correct,
        "RestorationPlan",
        revision.id,
        `方案 ${origin.plan_no} 更正为 R${revisionNo}，原步骤与影像保留旧档并标记受影响`
      );
      return revision;
    });
  },

  /** 全部步骤完成且修复前/后影像齐全后才能归档。 */
  async archive(actor: Actor, id: number): Promise<RestorationPlan> {
    return writeLock.run(async () => {
      const plan = getPlanOrThrow(id);
      assertNotAffected(plan);
      if (plan.approval_status === "ARCHIVED") throw conflict("PLAN_ALREADY_ARCHIVED");
      if (plan.approval_status !== "APPROVED") throw conflict("PLAN_NOT_APPROVED");
      const steps = restorationStepRepository.findByPlan(id);
      if (steps.length === 0 || steps.some((step) => step.step_status !== "COMPLETED")) {
        throw conflict("PLAN_STEPS_INCOMPLETE");
      }
      const images = imageVersionRepository.findByPlan(id);
      const hasBefore = images.some((image) => image.image_type === "BEFORE");
      const hasAfter = images.some((image) => image.image_type === "AFTER");
      if (!hasBefore || !hasAfter) throw conflict("PLAN_IMAGES_INCOMPLETE");

      const timestamp = nowIso();
      restorationPlanRepository.update(id, { approval_status: "ARCHIVED", archived_at: timestamp, updated_at: timestamp });
      imageVersionRepository.markArchivedByPlan(id);
      relicItemRepository.update(plan.relic_id, { current_condition: "STABLE" });
      damageRecordRepository.update(plan.damage_record_id, { status: "CLOSED", updated_at: timestamp });
      writeAudit(actor, LOG_TEMPLATES.RestorationPlan.archive, "RestorationPlan", id, `方案 ${plan.plan_no} 影像齐全，修复档案归档`);
      return restorationPlanRepository.findById(id)!;
    });
  }
};
