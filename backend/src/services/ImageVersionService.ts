import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { buildImageVersionRow } from "../constructors/ImageVersionDtoFactory";
import { auditService } from "./AuditService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ImageType } from "../constants/ImageType";
import { db } from "../database/inMemoryDb";
import { nowIso, requireEnum, requireId, requireText } from "../utils/formatters";
import { BusinessError } from "../utils/BusinessError";
import type { AuthUser } from "../types/AuthUser";
import type { ImageVersionCreatePayload } from "../types/ImageVersionPayload";

class ImageVersionService {
  list(params: { relicId?: number; planId?: number } = {}) {
    if (params.planId !== undefined) return imageVersionRepository.findByPlan(params.planId);
    if (params.relicId !== undefined) return imageVersionRepository.findByRelic(params.relicId);
    return imageVersionRepository.findAll();
  }

  /**
   * 上传影像：
   * - 修复前影像：方案审批通过后即可上传；
   * - 修复后影像：必须全部步骤完成后才能上传；
   * - 全部步骤完成且修复前后影像齐全后，由方案“归档”动作统一归档。
   */
  async upload(actor: AuthUser, planIdRaw: number | string, payload: ImageVersionCreatePayload) {
    const planId = requireId(planIdRaw, "方案 id");
    const imageType = requireEnum(ImageType, payload.image_type, "影像类型");
    const filePath = requireText(payload.file_path, "影像文件路径");
    const note = typeof payload.note === "string" ? payload.note.trim() : "";
    const captureAt =
      typeof payload.capture_at === "string" && payload.capture_at.trim() !== ""
        ? payload.capture_at.trim()
        : nowIso();

    return db.transaction((context) => {
      const plan = restorationPlanRepository.findById(planId, context);
      if (!plan) throw BusinessError.notFound(`修复方案 ${planId} 不存在`);
      if (plan.approval_status !== "APPROVED") {
        throw new BusinessError(
          ERROR_CODES.FLOW_CONFLICT,
          "方案审批通过后才能上传修复影像"
        );
      }
      const existing = imageVersionRepository.findByPlan(planId, context);
      if (imageType === "AFTER") {
        const steps = restorationStepRepository.findByPlan(planId, context);
        if (steps.length === 0 || steps.some((step) => step.step_status !== "FINISHED")) {
          throw new BusinessError(
            ERROR_CODES.FLOW_CONFLICT,
            "全部修复步骤完成后才能上传修复后影像"
          );
        }
      }
      const versionNo = existing.length + 1;
      const image = imageVersionRepository.insert(
        buildImageVersionRow({
          relicId: plan.relic_id,
          planId,
          planNo: plan.plan_no,
          versionNo,
          imageType,
          filePath,
          note,
          captureAt,
          uploadedBy: actor.name
        }),
        context
      );
      auditService.record(
        actor,
        "ImageVersion.create",
        "ImageVersion",
        image.id,
        LOG_TEMPLATES.ImageVersion.create,
        {
          image_type: imageType === "BEFORE" ? "修复前" : "修复后",
          version_no: versionNo,
          plan_no: plan.plan_no
        },
        context
      );
      return image;
    });
  }
}

export const imageVersionService = new ImageVersionService();
