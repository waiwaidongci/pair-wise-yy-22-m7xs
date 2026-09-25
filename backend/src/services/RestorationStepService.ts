import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { buildRestorationStepRow } from "../constructors/RestorationStepDtoFactory";
import { auditService } from "./AuditService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { db } from "../database/inMemoryDb";
import { nowIso, requireId, requireText } from "../utils/formatters";
import { BusinessError } from "../utils/BusinessError";
import type { AuthUser } from "../types/AuthUser";
import type { RestorationStepCreatePayload, RestorationStepFinishPayload } from "../types/RestorationStepPayload";

class RestorationStepService {
  list(planId?: number) {
    if (planId !== undefined) return restorationStepRepository.findByPlan(planId);
    return restorationStepRepository.findAll();
  }

  get(id: number) {
    const step = restorationStepRepository.findById(id);
    if (!step) throw BusinessError.notFound(`修复步骤 ${id} 不存在`);
    return step;
  }

  /**
   * 拆步骤：只有审批通过的方案才能拆。
   * 记录工序与所用材料；操作人和完成时间在步骤完成时回写。
   */
  async create(actor: AuthUser, planIdRaw: number | string, payload: RestorationStepCreatePayload) {
    const planId = requireId(planIdRaw, "方案 id");
    const technique = requireText(payload.technique, "工序/技法");
    const materialUsed = requireText(payload.material_used, "使用材料");
    return db.transaction((context) => {
      const plan = restorationPlanRepository.findById(planId, context);
      if (!plan) throw BusinessError.notFound(`修复方案 ${planId} 不存在`);
      if (plan.approval_status !== "APPROVED") {
        throw new BusinessError(
          ERROR_CODES.FLOW_CONFLICT,
          "方案审批通过后才能拆解修复步骤"
        );
      }
      const existing = restorationStepRepository.findByPlan(planId, context);
      const stepOrder = existing.length + 1;
      const step = restorationStepRepository.insert(
        buildRestorationStepRow(planId, stepOrder, technique, materialUsed),
        context
      );
      auditService.record(
        actor,
        "RestorationStep.create",
        "RestorationStep",
        step.id,
        LOG_TEMPLATES.RestorationStep.create,
        { plan_no: plan.plan_no, step_order: step.step_order, technique: step.technique },
        context
      );
      return step;
    });
  }

  /**
   * 完成步骤：回写材料、操作人与完成时间。
   * 两人同时提交同一步骤时先到者生效，后到者看到步骤已被处理。
   */
  async finish(actor: AuthUser, id: number, payload: RestorationStepFinishPayload) {
    return db.transaction((context) => {
      const step = restorationStepRepository.findById(id, context);
      if (!step) throw BusinessError.notFound(`修复步骤 ${id} 不存在`);
      if (step.step_status === "FINISHED") {
        throw BusinessError.alreadyProcessed(
          `步骤 ${id} 已由 ${step.operator} 于 ${step.finished_at} 完成`
        );
      }
      if (
        payload.expected_version !== undefined &&
        Number(payload.expected_version) !== step.version
      ) {
        throw BusinessError.alreadyProcessed();
      }
      const ts = nowIso();
      const updated = restorationStepRepository.update(
        id,
        {
          material_used:
            typeof payload.material_used === "string" && payload.material_used.trim() !== ""
              ? payload.material_used.trim()
              : step.material_used,
          operator_id: actor.id,
          operator: actor.name,
          step_status: "FINISHED",
          finished_at: ts,
          version: step.version + 1,
          updated_at: ts
        },
        context
      );
      auditService.record(
        actor,
        "RestorationStep.finish",
        "RestorationStep",
        id,
        LOG_TEMPLATES.RestorationStep.finish,
        { step_id: id, operator: actor.name },
        context
      );
      return updated;
    });
  }
}

export const restorationStepService = new RestorationStepService();
