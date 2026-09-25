import { relicItemRepository } from "../repositories/RelicItemRepository";
import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { BusinessError } from "../utils/BusinessError";
import type { RestorationPlan } from "../models/RestorationPlan";

export interface PlanDossier extends RestorationPlan {
  steps: ReturnType<typeof restorationStepRepository.findByPlan>;
  images: ReturnType<typeof imageVersionRepository.findByPlan>;
  /** 是否可拆步骤（仅审批通过、未归档） */
  can_break_steps: boolean;
  /** 是否可上传修复后影像（全部步骤已完成） */
  can_upload_after: boolean;
  /** 是否满足归档条件（步骤全完成 + 前后影像齐全） */
  archive_ready: boolean;
  /** 步骤完成进度文本 */
  progress_text: string;
}

/**
 * 文物可操作档案：把文物、病害、方案、步骤、影像按真实修复流程组装，
 * 并附带每个方案当前可执行的动作开关，供详情页直接驱动按钮。
 */
class DossierService {
  getRelicDossier(relicId: number) {
    const relic = relicItemRepository.findById(relicId);
    if (!relic) throw BusinessError.notFound(`文物 ${relicId} 不存在`);

    const damages = damageRecordRepository.findByRelic(relicId).map((damage) => {
      const plans = restorationPlanRepository.findByDamage(damage.id);
      return {
        ...damage,
        plan_count: plans.length,
        /** 该病害是否还能编制新方案：已更正病害禁止；存在未结束方案禁止 */
        can_create_plan:
          damage.status !== "CORRECTED" &&
          !restorationPlanRepository.findOpenByDamageNo(damage.damage_no)
      };
    });

    const plans = restorationPlanRepository.findByRelic(relicId).map((plan) => this.decoratePlan(plan.id));

    return {
      relic,
      damages,
      plans,
      images: imageVersionRepository.findByRelic(relicId)
    };
  }

  getPlanDossier(planId: number) {
    const plan = restorationPlanRepository.findById(planId);
    if (!plan) throw BusinessError.notFound(`修复方案 ${planId} 不存在`);
    return this.decoratePlan(planId);
  }

  decoratePlan(planId: number): PlanDossier {
    const plan = restorationPlanRepository.findById(planId)!;
    const steps = restorationStepRepository.findByPlan(planId);
    const images = imageVersionRepository.findByPlan(planId);
    const finished = steps.filter((step) => step.step_status === "FINISHED").length;
    const allFinished = steps.length > 0 && finished === steps.length;
    const hasBefore = images.some((image) => image.image_type === "BEFORE");
    const hasAfter = images.some((image) => image.image_type === "AFTER");

    return {
      ...plan,
      steps,
      images,
      can_break_steps: plan.approval_status === "APPROVED",
      can_upload_after: plan.approval_status === "APPROVED" && allFinished,
      archive_ready: plan.approval_status === "APPROVED" && allFinished && hasBefore && hasAfter,
      progress_text: `${finished}/${steps.length}`
    };
  }
}

export const dossierService = new DossierService();
