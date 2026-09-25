import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { buildRestorationPlanRow } from "../constructors/RestorationPlanDtoFactory";
import { auditService } from "./AuditService";
import { affectedPropagationService } from "./AffectedPropagationService";
import { damageRecordService } from "./DamageRecordService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { db } from "../database/inMemoryDb";
import {
  buildPlanNo,
  hashPlanContent,
  nowIso,
  requireId,
  requireText
} from "../utils/formatters";
import { BusinessError } from "../utils/BusinessError";
import type { AuthUser } from "../types/AuthUser";
import type {
  PlanReviewPayload,
  RestorationPlanCorrectPayload,
  RestorationPlanCreatePayload,
  RestorationPlanUpdatePayload
} from "../types/RestorationPlanPayload";
import type { InMemoryDatabase } from "../database/inMemoryDb";
import type { RestorationPlan } from "../models/RestorationPlan";

class RestorationPlanService {
  list(relicId?: number) {
    if (relicId !== undefined) return restorationPlanRepository.findByRelic(relicId);
    return restorationPlanRepository.findAll();
  }

  get(id: number) {
    const plan = restorationPlanRepository.findById(id);
    if (!plan) throw BusinessError.notFound(`修复方案 ${id} 不存在`);
    return plan;
  }

  private mustGetPlan(id: number, context: InMemoryDatabase): RestorationPlan {
    const plan = restorationPlanRepository.findById(id, context);
    if (!plan) throw BusinessError.notFound(`修复方案 ${id} 不存在`);
    return plan;
  }

  /** 编制方案：沿用病害编号、记录编制人；同一病害只能有一份未结束方案 */
  async create(actor: AuthUser, payload: RestorationPlanCreatePayload) {
    const damageRecordId = requireId(payload.damage_record_id, "病害记录 id");
    const fields = {
      plan_title: requireText(payload.plan_title, "方案标题"),
      method: requireText(payload.method, "修复方法"),
      risk_assessment: requireText(payload.risk_assessment, "风险评估")
    };
    return db.transaction((context) => {
      const damage = damageRecordRepository.findById(damageRecordId, context);
      if (!damage) throw BusinessError.notFound(`病害记录 ${damageRecordId} 不存在`);
      if (damage.status === "CORRECTED") {
        throw new BusinessError(
          ERROR_CODES.FLOW_CONFLICT,
          `病害 ${damage.damage_no} 已更正，请基于最新修订版重新登记方案`
        );
      }
      const open = restorationPlanRepository.findOpenByDamageNo(damage.damage_no, context);
      if (open) {
        throw new BusinessError(
          ERROR_CODES.OPEN_PLAN_EXISTS,
          `病害 ${damage.damage_no} 已存在未结束方案 ${open.plan_no}，不能重复编制`
        );
      }
      const planRevision = restorationPlanRepository.nextPlanRevision(damage.damage_no, context);
      const planNo = buildPlanNo(damage.damage_no, planRevision);
      const plan = restorationPlanRepository.insert(
        buildRestorationPlanRow(
          planNo,
          planRevision,
          { id: damage.id, damage_no: damage.damage_no, relic_id: damage.relic_id },
          fields,
          actor.id,
          actor.name
        ),
        context
      );
      auditService.record(
        actor,
        "RestorationPlan.create",
        "RestorationPlan",
        plan.id,
        LOG_TEMPLATES.RestorationPlan.create,
        { plan_no: plan.plan_no, damage_no: damage.damage_no, author: actor.name },
        context
      );
      return plan;
    });
  }

  /**
   * 修改方案内容：
   * - 草稿/驳回：正常编辑；
   * - 已提交待审批：修改后自动退回草稿（专家审批前内容变动必须重新提交）；
   * - 已通过/已归档：不允许直接改，须走“更正”生成修订版。
   */
  async update(actor: AuthUser, id: number, payload: RestorationPlanUpdatePayload) {
    return db.transaction((context) => {
      const plan = this.mustGetPlan(id, context);
      if (plan.approval_status === "APPROVED" || plan.approval_status === "ARCHIVED") {
        throw new BusinessError(
          ERROR_CODES.FLOW_CONFLICT,
          "方案已通过/已归档，不能直接修改，请使用“更正”生成修订版"
        );
      }
      const patch: Partial<RestorationPlan> = { updated_at: nowIso() };
      if (payload.plan_title !== undefined) patch.plan_title = requireText(payload.plan_title, "方案标题");
      if (payload.method !== undefined) patch.method = requireText(payload.method, "修复方法");
      if (payload.risk_assessment !== undefined)
        patch.risk_assessment = requireText(payload.risk_assessment, "风险评估");

      let bounced = false;
      if (plan.approval_status === "SUBMITTED") {
        // 审批前内容被修改 → 退回重新提交
        patch.approval_status = "DRAFT";
        patch.submitted_content_hash = null;
        patch.submitted_at = null;
        patch.review_comment = "方案内容在审批前被修改，已退回，请重新提交";
        patch.version = plan.version + 1;
        bounced = true;
      }
      const updated = restorationPlanRepository.update(id, patch, context);
      auditService.record(
        actor,
        bounced ? "RestorationPlan.update" : "RestorationPlan.update",
        "RestorationPlan",
        id,
        LOG_TEMPLATES.RestorationPlan.update,
        { plan_no: plan.plan_no },
        context
      );
      if (bounced) {
        auditService.record(
          actor,
          "RestorationPlan.status",
          "RestorationPlan",
          id,
          LOG_TEMPLATES.RestorationPlan.status,
          { plan_no: plan.plan_no, approval_status: "DRAFT" },
          context
        );
      }
      return updated;
    });
  }

  /** 提交专家审批：仅草稿/驳回可提交，并固化当前内容指纹 */
  async submit(actor: AuthUser, id: number) {
    return db.transaction((context) => {
      const plan = this.mustGetPlan(id, context);
      if (plan.approval_status !== "DRAFT" && plan.approval_status !== "REJECTED") {
        throw new BusinessError(
          ERROR_CODES.FLOW_CONFLICT,
          "只有草稿或被驳回的方案才能提交审批"
        );
      }
      const updated = restorationPlanRepository.update(
        id,
        {
          approval_status: "SUBMITTED",
          submitted_content_hash: hashPlanContent(plan),
          submitted_at: nowIso(),
          reviewer: null,
          reviewed_at: null,
          review_comment: null,
          version: plan.version + 1,
          updated_at: nowIso()
        },
        context
      );
      auditService.record(
        actor,
        "RestorationPlan.submit",
        "RestorationPlan",
        id,
        LOG_TEMPLATES.RestorationPlan.submit,
        { plan_no: plan.plan_no },
        context
      );
      return updated;
    });
  }

  /**
   * 专家审批：两人同时审批同一方案时，先到者生效；
   * 后到者携带的 expected_version 已过期，看到“已被处理”。
   * 审批时再次比对内容指纹，期间内容被修改则退回重新提交。
   */
  async review(actor: AuthUser, id: number, payload: PlanReviewPayload) {
    return db.transaction((context) => {
      const plan = this.mustGetPlan(id, context);
      if (plan.approval_status !== "SUBMITTED") {
        // 已被另一位专家先行审批
        throw BusinessError.alreadyProcessed(
          `方案 ${plan.plan_no} 当前状态为 ${plan.approval_status}，已被其他专家处理`
        );
      }
      if (payload.expected_version !== undefined && Number(payload.expected_version) !== plan.version) {
        throw BusinessError.alreadyProcessed();
      }
      const approved = payload.approved !== false;
      const comment = typeof payload.comment === "string" ? payload.comment.trim() : null;
      const ts = nowIso();

      // 提交后内容被修改 → 指纹不一致，退回重新提交
      const contentChanged =
        plan.submitted_content_hash !== null &&
        plan.submitted_content_hash !== hashPlanContent(plan);
      if (contentChanged) {
        const bounced = restorationPlanRepository.update(
          id,
          {
            approval_status: "DRAFT",
            submitted_content_hash: null,
            submitted_at: null,
            review_comment: "审批时发现方案内容已被修改，退回重新提交",
            version: plan.version + 1,
            updated_at: ts
          },
          context
        );
        auditService.record(
          actor,
          "RestorationPlan.update",
          "RestorationPlan",
          id,
          LOG_TEMPLATES.RestorationPlan.update,
          { plan_no: plan.plan_no },
          context
        );
        throw new BusinessError(ERROR_CODES.PLAN_CONTENT_CHANGED);
      }

      const updated = restorationPlanRepository.update(
        id,
        {
          approval_status: approved ? "APPROVED" : "REJECTED",
          reviewer: actor.name,
          reviewed_at: ts,
          review_comment: comment,
          version: plan.version + 1,
          updated_at: ts
        },
        context
      );
      if (approved) {
        // 病害进入处置中、文物进入修复中
        damageRecordRepository.update(
          plan.damage_record_id,
          { status: "TREATING", updated_at: ts },
          context
        );
        const relic = relicItemRepository.findById(plan.relic_id, context);
        if (relic) {
          relicItemRepository.update(
            relic.id,
            { current_condition: "IN_RESTORATION", updated_at: ts },
            context
          );
        }
      }
      auditService.record(
        actor,
        approved ? "RestorationPlan.approve" : "RestorationPlan.reject",
        "RestorationPlan",
        id,
        approved
          ? LOG_TEMPLATES.RestorationPlan.approve
          : LOG_TEMPLATES.RestorationPlan.reject,
        { plan_no: plan.plan_no, reviewer: actor.name, approval_status: updated.approval_status },
        context
      );
      return updated;
    });
  }

  /**
   * 方案更正：已通过/已归档方案不能直接改，生成沿用病害编号的修订方案；
   * 原方案及其步骤、影像保留旧档并标记受影响。修订方案从草稿重新走审批。
   */
  async correct(actor: AuthUser, id: number, payload: RestorationPlanCorrectPayload) {
    const reason = requireText(payload.corrected_reason, "更正原因");
    return db.transaction((context) => {
      const oldPlan = this.mustGetPlan(id, context);
      if (oldPlan.approval_status !== "APPROVED" && oldPlan.approval_status !== "ARCHIVED") {
        throw new BusinessError(
          ERROR_CODES.FLOW_CONFLICT,
          "只有已通过或已归档的方案才需要更正生成修订版"
        );
      }
      const damage = damageRecordRepository.findById(oldPlan.damage_record_id, context);
      if (!damage) throw BusinessError.notFound(`病害记录 ${oldPlan.damage_record_id} 不存在`);
      const open = restorationPlanRepository.findOpenByDamageNo(damage.damage_no, context, {
        excludePlanId: oldPlan.id
      });
      if (open) {
        throw new BusinessError(
          ERROR_CODES.OPEN_PLAN_EXISTS,
          `病害 ${damage.damage_no} 已有未结束方案 ${open.plan_no}，无法再发起更正`
        );
      }
      const planRevision = restorationPlanRepository.nextPlanRevision(damage.damage_no, context);
      const planNo = buildPlanNo(damage.damage_no, planRevision);
      const newPlan = restorationPlanRepository.insert(
        buildRestorationPlanRow(
          planNo,
          planRevision,
          { id: damage.id, damage_no: damage.damage_no, relic_id: damage.relic_id },
          {
            plan_title: requireText(payload.plan_title ?? oldPlan.plan_title, "方案标题"),
            method: requireText(payload.method ?? oldPlan.method, "修复方法"),
            risk_assessment: requireText(
              payload.risk_assessment ?? oldPlan.risk_assessment,
              "风险评估"
            )
          },
          actor.id,
          actor.name,
          oldPlan.id
        ),
        context
      );
      // 原方案保留旧档并标记受影响（不删除），步骤与影像一并标记
      restorationPlanRepository.update(
        oldPlan.id,
        { affected: true, affected_reason: `方案已更正生成 ${planNo}（${reason}）` },
        context
      );
      affectedPropagationService.fromPlan(
        oldPlan.id,
        `原方案 ${oldPlan.plan_no} 已更正（${reason}）`,
        context
      );
      auditService.record(
        actor,
        "RestorationPlan.correct",
        "RestorationPlan",
        newPlan.id,
        LOG_TEMPLATES.RestorationPlan.correct,
        { plan_no: oldPlan.plan_no, new_no: planNo },
        context
      );
      return newPlan;
    });
  }

  /** 归档前置校验：全部步骤完成且修复前、修复后影像齐全 */
  assertArchiveReady(planId: number, context: InMemoryDatabase) {
    const steps = restorationStepRepository.findByPlan(planId, context);
    if (steps.length === 0 || steps.some((step) => step.step_status !== "FINISHED")) {
      throw new BusinessError(ERROR_CODES.ARCHIVE_NOT_READY);
    }
    const images = imageVersionRepository.findByPlan(planId, context);
    const hasBefore = images.some((image) => image.image_type === "BEFORE");
    const hasAfter = images.some((image) => image.image_type === "AFTER");
    if (!hasBefore || !hasAfter) {
      throw new BusinessError(
        ERROR_CODES.ARCHIVE_NOT_READY,
        "必须上传修复前与修复后两类影像后才能归档"
      );
    }
    return { steps, images };
  }

  /** 全部步骤完成、前后影像齐全后归档：方案、影像一并归档，病害关闭、文物恢复稳定 */
  async archive(actor: AuthUser, id: number) {
    return db.transaction((context) => {
      const plan = this.mustGetPlan(id, context);
      if (plan.approval_status !== "APPROVED") {
        throw new BusinessError(ERROR_CODES.FLOW_CONFLICT, "只有已通过且修复完成的方案才能归档");
      }
      const { images } = this.assertArchiveReady(id, context);
      const ts = nowIso();
      const archived = restorationPlanRepository.update(
        id,
        { approval_status: "ARCHIVED", archived_at: ts, version: plan.version + 1, updated_at: ts },
        context
      );
      for (const image of images) {
        imageVersionRepository.update(image.id, { archived: "ARCHIVED", archived_at: ts }, context);
      }
      damageRecordService.close(plan.damage_no, context);
      const relic = relicItemRepository.findById(plan.relic_id, context);
      if (relic) {
        relicItemRepository.update(
          relic.id,
          { current_condition: "STABLE", updated_at: ts },
          context
        );
      }
      auditService.record(
        actor,
        "RestorationPlan.archive",
        "RestorationPlan",
        id,
        LOG_TEMPLATES.RestorationPlan.archive,
        { plan_no: plan.plan_no },
        context
      );
      auditService.record(
        actor,
        "ImageVersion.archive",
        "ImageVersion",
        id,
        LOG_TEMPLATES.ImageVersion.archive,
        { plan_no: plan.plan_no },
        context
      );
      return archived;
    });
  }
}

export const restorationPlanService = new RestorationPlanService();
