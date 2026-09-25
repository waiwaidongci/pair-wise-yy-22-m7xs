import type { DamageRecord } from "../models/DamageRecord";
import type { DamageRecordCreatePayload } from "../types/DamageRecordPayload";
import type { AuthUser } from "../types/AuthUser";
import { nowIso } from "../utils/formatters";

/** 病害登记入库结构：编号由 service 分配，修订沿用同一 damage_no */
export const buildDamageRecordRow = (
  damageNo: string,
  payload: Required<Pick<DamageRecordCreatePayload, "relic_id" | "damage_type" | "position_desc" | "severity">> &
    Pick<DamageRecordCreatePayload, "image_url">,
  actor: AuthUser,
  revision = 1,
  revisedFromId: number | null = null
): Omit<DamageRecord, "id"> => {
  const ts = nowIso();
  return {
    damage_no: damageNo,
    revision,
    revised_from_id: revisedFromId,
    relic_id: Number(payload.relic_id),
    damage_type: payload.damage_type,
    position_desc: payload.position_desc,
    severity: payload.severity,
    discovered_by: actor.name,
    discovered_at: ts,
    image_url: payload.image_url ?? "",
    status: "REGISTERED",
    corrected_reason: null,
    affected: false,
    affected_reason: null,
    created_at: ts,
    updated_at: ts
  };
};

export const toDamageRecordDto = (row: DamageRecord): DamageRecord => ({ ...row });
