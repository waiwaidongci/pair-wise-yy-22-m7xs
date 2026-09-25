import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { createImageVersionFormDto } from "../constructors/ImageVersionDtoFactory";
import { ImageType } from "../constants/ImageType";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { nextId, nowIso, buildImageVersionNo } from "../utils/ids";
import { notFound, validation, conflict } from "../utils/AppError";
import { writeAudit } from "../utils/audit";
import { writeLock } from "../utils/SerialLock";
import type { Actor } from "../models/Actor";
import type { ImageVersion } from "../models/ImageVersion";
import type { ImageVersionPayload } from "../types/ImageVersionPayload";

const requireText = (value: unknown, label: string) => {
  const text = String(value ?? "").trim();
  if (!text) throw validation(`${label}不能为空`);
  return text;
};

export const imageVersionService = {
  list() {
    return imageVersionRepository.findAll();
  },

  /**
   * 上传修复前后影像：
   * - BEFORE：方案审批通过即可上传（修复前取证）；
   * - AFTER：必须全部步骤完成；
   * - 同一方案同一类型仅保留一份，重复上传提示冲突。
   */
  async upload(actor: Actor, planId: number, payload: ImageVersionPayload): Promise<ImageVersion> {
    return writeLock.run(async () => {
      const plan = restorationPlanRepository.findById(planId);
      if (!plan) throw notFound("PLAN_NOT_FOUND");
      if (plan.approval_status !== "APPROVED") throw conflict("PLAN_NOT_APPROVED");
      if (plan.affected) throw conflict("PLAN_AFFECTED");

      const imageType = String(payload.image_type ?? "").trim() as ImageVersion["image_type"];
      if (!ImageType.includes(imageType)) throw validation("影像类型必须是 BEFORE 或 AFTER");
      if (imageVersionRepository.findByPlanAndType(planId, imageType)) {
        throw conflict("IMAGE_TYPE_CONFLICT");
      }
      if (imageType === "AFTER") {
        const steps = restorationStepRepository.findByPlan(planId);
        if (steps.length === 0 || steps.some((step) => step.step_status !== "COMPLETED")) {
          throw conflict("IMAGE_BEFORE_STEPS_UNFINISHED");
        }
      }

      const filePath = requireText(payload.file_path, "影像路径");
      const captureAt = payload.capture_at ? String(payload.capture_at) : nowIso();
      const count = imageVersionRepository.countByPlan(planId) + 1;
      const timestamp = nowIso();
      const row = createImageVersionFormDto({
        relic_id: plan.relic_id,
        plan_id: planId,
        version_no: buildImageVersionNo(plan.plan_no, imageType, count),
        image_type: imageType,
        file_path: filePath,
        capture_at: captureAt,
        note: String(payload.note ?? ""),
        uploaded_by: actor.id,
        uploaded_by_name: actor.name,
        archived: false,
        created_at: timestamp
      });
      const created = imageVersionRepository.create({ ...row, id: nextId(imageVersionRepository.findAll()) });
      writeAudit(
        actor,
        LOG_TEMPLATES.ImageVersion.upload,
        "ImageVersion",
        created.id,
        `方案 ${plan.plan_no} 上传${imageType === "BEFORE" ? "修复前" : "修复后"}影像 ${created.version_no}`
      );
      return created;
    });
  }
};
