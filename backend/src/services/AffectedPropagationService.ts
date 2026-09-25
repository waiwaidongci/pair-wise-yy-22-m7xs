import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import type { InMemoryDatabase } from "../database/inMemoryDb";

/**
 * “更正”传播规则（旧档保留，不删除、不覆盖）：
 * - 病害更正：其下所有方案，以及方案的步骤、影像标记受影响；
 * - 方案更正：该方案的步骤、影像标记受影响。
 * 标记后旧档继续可查，流程按钮禁用并提示原因。
 */
export const affectedPropagationService = {
  /** 病害更正：沿病害编号波及全部方案修订 */
  fromDamage(damageNo: string, reason: string, context: InMemoryDatabase) {
    const plans = restorationPlanRepository.findRevisionsByDamageNo(damageNo, context);
    for (const plan of plans) {
      restorationPlanRepository.update(
        plan.id,
        { affected: true, affected_reason: reason },
        context
      );
      this.markStepsAndImages(plan.id, reason, context);
    }
  },

  /** 方案更正：仅波及该方案的步骤与影像 */
  fromPlan(planId: number, reason: string, context: InMemoryDatabase) {
    this.markStepsAndImages(planId, reason, context);
  },

  markStepsAndImages(planId: number, reason: string, context: InMemoryDatabase) {
    for (const step of restorationStepRepository.findByPlan(planId, context)) {
      restorationStepRepository.update(
        step.id,
        { affected: true, affected_reason: reason },
        context
      );
    }
    for (const image of imageVersionRepository.findByPlan(planId, context)) {
      imageVersionRepository.update(
        image.id,
        { affected: true, affected_reason: reason },
        context
      );
    }
  }
};
