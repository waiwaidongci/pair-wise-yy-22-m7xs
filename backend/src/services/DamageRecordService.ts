import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { createDamageRecordFormDto } from "../constructors/DamageRecordDtoFactory";
import { DamageSeverity } from "../constants/DamageSeverity";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { nextId, nowIso, buildDamageNo } from "../utils/ids";
import { notFound, validation, conflict } from "../utils/AppError";
import { writeAudit } from "../utils/audit";
import { writeLock } from "../utils/SerialLock";
import type { Actor } from "../models/Actor";
import type { DamageRecord } from "../models/DamageRecord";
import type { DamageRecordPayload, DamageCorrectPayload } from "../types/DamageRecordPayload";

const requireText = (value: unknown, label: string) => {
  const text = String(value ?? "").trim();
  if (!text) throw validation(`${label}不能为空`);
  return text;
};

const requireSeverity = (value: unknown) => {
  const severity = String(value ?? "").trim() as DamageRecord["severity"];
  if (!DamageSeverity.includes(severity as (typeof DamageSeverity)[number])) {
    throw validation("病害分级取值非法");
  }
  return severity;
};

/** 更正后：旧病害之后产生的方案、步骤、影像一律保留旧档并标记受影响。 */
const markChainAffected = (damageId: number) => {
  restorationPlanRepository.findByDamage(damageId).forEach((plan) => {
    if (plan.affected) return;
    restorationPlanRepository.update(plan.id, { affected: true });
    restorationStepRepository.findByPlan(plan.id).forEach((step) => {
      if (!step.affected) restorationStepRepository.update(step.id, { affected: true });
    });
    imageVersionRepository.findByPlan(plan.id).forEach((image) => {
      if (!image.affected) imageVersionRepository.update(image.id, { affected: true });
    });
  });
};

export const damageRecordService = {
  list() {
    return damageRecordRepository.findAll();
  },

  async register(actor: Actor, payload: DamageRecordPayload): Promise<DamageRecord> {
    return writeLock.run(async () => {
      const relicId = Number(payload.relic_id);
      const relic = relicItemRepository.findById(relicId);
      if (!relic) throw notFound("RELIC_NOT_FOUND");
      const damageType = requireText(payload.damage_type, "病害类型");
      const positionDesc = requireText(payload.position_desc, "病害位置");
      const severity = requireSeverity(payload.severity);
      const discoveredAt = payload.discovered_at ? String(payload.discovered_at) : nowIso();
      const damageNo = buildDamageNo(damageRecordRepository.latestNoSeq() + 1);
      const row = createDamageRecordFormDto({
        damage_no: damageNo,
        revision_no: 1,
        relic_id: relicId,
        damage_type: damageType,
        position_desc: positionDesc,
        severity,
        discovered_by: requireText(payload.discovered_by ?? actor.name, "发现人"),
        discovered_at: discoveredAt,
        image_url: String(payload.image_url ?? ""),
        status: "REGISTERED",
        created_at: discoveredAt,
        updated_at: discoveredAt
      });
      const created = damageRecordRepository.create({ ...row, id: nextId(damageRecordRepository.findAll()) });
      if (relic.current_condition === "STABLE" || relic.current_condition === "SEALED") {
        relicItemRepository.update(relicId, { current_condition: "DAMAGED" });
      }
      writeAudit(actor, LOG_TEMPLATES.DamageRecord.create, "DamageRecord", created.id, `登记病害 ${created.damage_no}`);
      return created;
    });
  },

  async close(actor: Actor, id: number): Promise<DamageRecord> {
    return writeLock.run(async () => {
      const damage = damageRecordRepository.findById(id);
      if (!damage) throw notFound("DAMAGE_NOT_FOUND");
      if (damage.status === "CLOSED") throw conflict("INVALID_STATE", "病害已关闭");
      if (damage.status === "SUPERSEDED") throw conflict("DAMAGE_CANNOT_CORRECT");
      const openPlan = restorationPlanRepository.findOpenByDamage(id);
      if (openPlan) throw conflict("DAMAGE_HAS_ACTIVE_PLAN", "存在未结束方案，不能关闭病害");
      damageRecordRepository.update(id, { status: "CLOSED", updated_at: nowIso() });
      writeAudit(actor, LOG_TEMPLATES.DamageRecord.close, "DamageRecord", id, `关闭病害 ${damage.damage_no}`);
      return damageRecordRepository.findById(id)!;
    });
  },

  /**
   * 病害更正：沿用原病害编号、revision_no + 1 生成新记录；
   * 原记录置 SUPERSEDED 并关联到新记录，旧方案链全部保留并标记受影响。
   */
  async correct(actor: Actor, id: number, payload: DamageCorrectPayload): Promise<DamageRecord> {
    return writeLock.run(async () => {
      const origin = damageRecordRepository.findById(id);
      if (!origin) throw notFound("DAMAGE_NOT_FOUND");
      if (origin.status === "CLOSED" || origin.status === "SUPERSEDED") {
        throw conflict("DAMAGE_CANNOT_CORRECT");
      }

      const damageType = payload.damage_type !== undefined ? requireText(payload.damage_type, "病害类型") : origin.damage_type;
      const positionDesc =
        payload.position_desc !== undefined ? requireText(payload.position_desc, "病害位置") : origin.position_desc;
      const severity = payload.severity !== undefined ? requireSeverity(payload.severity) : origin.severity;
      const imageUrl = payload.image_url !== undefined ? String(payload.image_url) : origin.image_url;
      const timestamp = nowIso();

      const row = createDamageRecordFormDto({
        damage_no: origin.damage_no,
        revision_no: origin.revision_no + 1,
        relic_id: origin.relic_id,
        damage_type: damageType,
        position_desc: positionDesc,
        severity,
        discovered_by: origin.discovered_by,
        discovered_at: origin.discovered_at,
        image_url: imageUrl,
        status: "REGISTERED",
        created_at: timestamp,
        updated_at: timestamp
      });
      const revision = damageRecordRepository.create({ ...row, id: nextId(damageRecordRepository.findAll()) });
      damageRecordRepository.update(origin.id, {
        status: "SUPERSEDED",
        superseded_by_id: revision.id,
        affected: true,
        updated_at: timestamp
      });
      markChainAffected(origin.id);

      writeAudit(
        actor,
        LOG_TEMPLATES.DamageRecord.correct,
        "DamageRecord",
        revision.id,
        `病害 ${origin.damage_no} 更正至 R${revision.revision_no}（${payload.correct_reason ?? "无说明"}），旧档保留并标记受影响`
      );
      return revision;
    });
  }
};
