import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { buildDamageRecordRow } from "../constructors/DamageRecordDtoFactory";
import { auditService } from "./AuditService";
import { affectedPropagationService } from "./AffectedPropagationService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { DamageSeverity } from "../constants/DamageSeverity";
import { db } from "../database/inMemoryDb";
import { nowIso, requireId, requireEnum, requireText } from "../utils/formatters";
import { BusinessError } from "../utils/BusinessError";
import type { AuthUser } from "../types/AuthUser";
import type { DamageRecordCreatePayload, DamageRecordCorrectPayload } from "../types/DamageRecordPayload";

class DamageRecordService {
  list(relicId?: number) {
    if (relicId !== undefined) return damageRecordRepository.findByRelic(relicId);
    return damageRecordRepository.findAll();
  }

  get(id: number) {
    const damage = damageRecordRepository.findById(id);
    if (!damage) throw BusinessError.notFound(`病害记录 ${id} 不存在`);
    return damage;
  }

  /** 病害登记：登记后即可在其基础上编制修复方案 */
  async register(actor: AuthUser, payload: DamageRecordCreatePayload) {
    const relicId = requireId(payload.relic_id, "文物 id");
    const fields = {
      relic_id: relicId,
      damage_type: requireText(payload.damage_type, "病害类型"),
      position_desc: requireText(payload.position_desc, "位置描述"),
      severity: requireEnum(DamageSeverity, payload.severity, "严重程度"),
      image_url: typeof payload.image_url === "string" ? payload.image_url.trim() : ""
    };
    return db.transaction((context) => {
      const relic = relicItemRepository.findById(relicId, context);
      if (!relic) throw BusinessError.notFound(`文物 ${relicId} 不存在`);
      const damageNo = damageRecordRepository.nextDamageNo(context);
      const damage = damageRecordRepository.insert(
        buildDamageRecordRow(damageNo, fields, actor),
        context
      );
      auditService.record(
        actor,
        "DamageRecord.create",
        "DamageRecord",
        damage.id,
        LOG_TEMPLATES.DamageRecord.create,
        { damage_no: damage.damage_no, relic_id: damage.relic_id },
        context
      );
      return damage;
    });
  }

  /**
   * 原病害更正：旧档保留并标记 CORRECTED，生成沿用同一病害编号的修订版；
   * 旧档关联的后续方案、步骤、影像保留旧档并标记为受影响。
   */
  async correct(actor: AuthUser, id: number, payload: DamageRecordCorrectPayload) {
    const reason = requireText(payload.corrected_reason, "更正原因");
    return db.transaction((context) => {
      const original = damageRecordRepository.findById(id, context);
      if (!original) throw BusinessError.notFound(`病害记录 ${id} 不存在`);
      // 始终更正“当前最新修订版”
      const latest = damageRecordRepository.latestRevision(original.damage_no, context) ?? original;

      const nextRevision = latest.revision + 1;
      const corrected = damageRecordRepository.insert(
        buildDamageRecordRow(
          latest.damage_no,
          {
            relic_id: latest.relic_id,
            damage_type: requireText(payload.damage_type ?? latest.damage_type, "病害类型"),
            position_desc: requireText(payload.position_desc ?? latest.position_desc, "位置描述"),
            severity: requireEnum(DamageSeverity, payload.severity ?? latest.severity, "严重程度"),
            image_url:
              payload.image_url !== undefined ? payload.image_url.trim() : latest.image_url
          },
          actor,
          nextRevision,
          latest.id
        ),
        context
      );
      damageRecordRepository.update(
        latest.id,
        { status: "CORRECTED", corrected_reason: reason, updated_at: nowIso() },
        context
      );
      // 后续方案 / 步骤 / 影像保留旧档并标记受影响
      affectedPropagationService.fromDamage(
        latest.damage_no,
        `上游病害 ${latest.damage_no} 已更正（${reason}）`,
        context
      );
      auditService.record(
        actor,
        "DamageRecord.correct",
        "DamageRecord",
        corrected.id,
        LOG_TEMPLATES.DamageRecord.update,
        { damage_no: latest.damage_no, new_no: `${latest.damage_no}#R${nextRevision}` },
        context
      );
      auditService.record(
        actor,
        "DamageRecord.correct",
        "DamageRecord",
        latest.id,
        LOG_TEMPLATES.DamageRecord.correct,
        { damage_no: latest.damage_no },
        context
      );
      return corrected;
    });
  }

  /** 关闭病害（全部修复完成归档时由方案服务联动调用） */
  close(damageNo: string, context = db) {
    const latest = damageRecordRepository.latestRevision(damageNo, context);
    if (latest && latest.status !== "CORRECTED") {
      damageRecordRepository.update(
        latest.id,
        { status: "CLOSED", updated_at: nowIso() },
        context
      );
    }
  }
}

export const damageRecordService = new DamageRecordService();
