import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { createRestorationStepFormDto } from "../constructors/RestorationStepDtoFactory";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { nextId, nowIso } from "../utils/ids";
import { notFound, validation, conflict } from "../utils/AppError";
import { writeAudit } from "../utils/audit";
import { writeLock } from "../utils/SerialLock";
import type { Actor } from "../models/Actor";
import type { RestorationStep } from "../models/RestorationStep";
import type { StepCompletePayload } from "../types/RestorationStepPayload";

const requireText = (value: unknown, label: string) => {
  const text = String(value ?? "").trim();
  if (!text) throw validation(`${label}不能为空`);
  return text;
};

export const restorationStepService = {
  list() {
    return restorationStepRepository.findAll();
  },

  /** 只有审批通过（且未因更正失效）的方案才能拆解步骤，步骤序号不可重复。 */
  async create(actor: Actor, planId: number, technique: string): Promise<RestorationStep> {
    return writeLock.run(async () => {
      const plan = restorationPlanRepository.findById(planId);
      if (!plan) throw notFound("PLAN_NOT_FOUND");
      if (plan.approval_status !== "APPROVED") throw conflict("PLAN_NOT_APPROVED");
      if (plan.affected) throw conflict("PLAN_AFFECTED");

      const existing = restorationStepRepository.findByPlan(planId);
      const stepOrder = existing.length + 1;
      if (restorationStepRepository.existsOrder(planId, stepOrder)) {
        throw conflict("STEP_ORDER_DUPLICATED");
      }
      const timestamp = nowIso();
      const row = createRestorationStepFormDto({
        plan_id: planId,
        step_order: stepOrder,
        technique: requireText(technique, "工艺做法"),
        created_at: timestamp,
        updated_at: timestamp
      });
      const created = restorationStepRepository.create({ ...row, id: nextId(restorationStepRepository.findAll()) });
      writeAudit(
        actor,
        LOG_TEMPLATES.RestorationStep.create,
        "RestorationStep",
        created.id,
        `方案 ${plan.plan_no} 拆解第 ${stepOrder} 步：${created.technique}`
      );
      return created;
    });
  },

  /**
   * 完成步骤：记录材料、操作人和完成时间。
   * 两人同时提交时，锁内第二位看到的已是 COMPLETED，返回 409 已被处理。
   */
  async complete(actor: Actor, id: number, payload: StepCompletePayload): Promise<RestorationStep> {
    return writeLock.run(async () => {
      const step = restorationStepRepository.findById(id);
      if (!step) throw notFound("STEP_NOT_FOUND");
      if (step.step_status === "COMPLETED") throw conflict("STEP_ALREADY_COMPLETED");
      const plan = restorationPlanRepository.findById(step.plan_id);
      if (!plan) throw notFound("PLAN_NOT_FOUND");
      if (plan.affected) throw conflict("PLAN_AFFECTED");

      const timestamp = nowIso();
      restorationStepRepository.update(id, {
        step_status: "COMPLETED",
        material_used: requireText(payload.material_used, "使用材料"),
        operator_id: actor.id,
        operator_name: actor.name,
        finished_at: timestamp,
        updated_at: timestamp
      });
      writeAudit(
        actor,
        LOG_TEMPLATES.RestorationStep.complete,
        "RestorationStep",
        id,
        `${actor.name} 完成第 ${step.step_order} 步，材料：${payload.material_used}`
      );
      return restorationStepRepository.findById(id)!;
    });
  }
};
