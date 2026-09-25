import { relicItemRepository } from "../repositories/RelicItemRepository";
import { buildRelicItemRow } from "../constructors/RelicItemDtoFactory";
import { auditService } from "./AuditService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { db } from "../database/inMemoryDb";
import { nowIso, requireEnum, requireText } from "../utils/formatters";
import { RelicCondition } from "../constants/RelicCondition";
import { BusinessError } from "../utils/BusinessError";
import type { AuthUser } from "../types/AuthUser";
import type { RelicItemCreatePayload, RelicItemUpdatePayload } from "../types/RelicItemPayload";

class RelicItemService {
  list() {
    return relicItemRepository.findAll();
  }

  get(id: number) {
    const relic = relicItemRepository.findById(id);
    if (!relic) throw BusinessError.notFound(`文物 ${id} 不存在`);
    return relic;
  }

  async create(actor: AuthUser, payload: RelicItemCreatePayload) {
    const fields = {
      relic_code: requireText(payload.relic_code, "文物编号"),
      name: requireText(payload.name, "文物名称"),
      era: requireText(payload.era, "年代"),
      material: requireText(payload.material, "材质"),
      collection_level: requireText(payload.collection_level, "藏品级别"),
      storage_location: requireText(payload.storage_location, "存放位置"),
      current_condition: requireEnum(RelicCondition, payload.current_condition ?? "STABLE", "保存现状")
    };
    return db.transaction((context) => {
      const relic = relicItemRepository.insert(buildRelicItemRow(fields), context);
      auditService.record(
        actor,
        "RelicItem.create",
        "RelicItem",
        relic.id,
        LOG_TEMPLATES.RelicItem.create,
        { relic_code: relic.relic_code, name: relic.name },
        context
      );
      return relic;
    });
  }

  async update(actor: AuthUser, id: number, payload: RelicItemUpdatePayload) {
    return db.transaction((context) => {
      const relic = relicItemRepository.findById(id, context);
      if (!relic) throw BusinessError.notFound(`文物 ${id} 不存在`);
      const patch: Record<string, string> = {};
      if (payload.name !== undefined) patch.name = requireText(payload.name, "文物名称");
      if (payload.era !== undefined) patch.era = requireText(payload.era, "年代");
      if (payload.material !== undefined) patch.material = requireText(payload.material, "材质");
      if (payload.collection_level !== undefined)
        patch.collection_level = requireText(payload.collection_level, "藏品级别");
      if (payload.storage_location !== undefined)
        patch.storage_location = requireText(payload.storage_location, "存放位置");
      patch.updated_at = nowIso();
      const updated = relicItemRepository.update(id, patch, context);
      auditService.record(
        actor,
        "RelicItem.update",
        "RelicItem",
        id,
        LOG_TEMPLATES.RelicItem.update,
        { relic_code: updated.relic_code },
        context
      );
      return updated;
    });
  }
}

export const relicItemService = new RelicItemService();
