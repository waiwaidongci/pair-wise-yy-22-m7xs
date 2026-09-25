import { relicItemRepository } from "../repositories/RelicItemRepository";
import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { createRelicItemFormDto } from "../constructors/RelicItemDtoFactory";
import { nextId } from "../utils/ids";
import { notFound, validation } from "../utils/AppError";
import { writeAudit } from "../utils/audit";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { RelicCondition } from "../constants/RelicCondition";
import type { Actor } from "../models/Actor";
import type { RelicItemPayload } from "../types/RelicItemPayload";
import type { RelicItem } from "../models/RelicItem";

const requireText = (value: unknown, label: string) => {
  const text = String(value ?? "").trim();
  if (!text) throw validation(`${label}不能为空`);
  return text;
};

export const relicItemService = {
  list() {
    return relicItemRepository.findAll();
  },

  detail(id: number) {
    const relic = relicItemRepository.findById(id);
    if (!relic) throw notFound("RELIC_NOT_FOUND");
    const damages = damageRecordRepository.findByRelic(id);
    const plans = restorationPlanRepository.findByRelic(id);
    const steps = plans.flatMap((plan) => restorationStepRepository.findByPlan(plan.id));
    const images = imageVersionRepository.findByRelic(id);
    return { relic, damages, plans, steps, images };
  },

  async create(actor: Actor, payload: RelicItemPayload): Promise<RelicItem> {
    const row = createRelicItemFormDto({
      relic_code: requireText(payload.relic_code, "文物编号"),
      name: requireText(payload.name, "文物名称"),
      era: requireText(payload.era, "年代"),
      material: requireText(payload.material, "材质"),
      collection_level: requireText(payload.collection_level, "藏品级别"),
      storage_location: requireText(payload.storage_location, "存放位置"),
      current_condition: (payload.current_condition as RelicItem["current_condition"]) ?? "STABLE"
    });
    if (!RelicCondition.includes(row.current_condition as (typeof RelicCondition)[number])) {
      throw validation("文物状态取值非法");
    }
    const created = relicItemRepository.create({ ...row, id: nextId(relicItemRepository.findAll()) });
    writeAudit(actor, LOG_TEMPLATES.RelicItem.create, "RelicItem", created.id, `建档 ${created.relic_code}`);
    return created;
  },

  async updateCondition(actor: Actor, id: number, condition: string): Promise<RelicItem> {
    if (!RelicCondition.includes(condition as (typeof RelicCondition)[number])) {
      throw validation("文物状态取值非法");
    }
    const relic = relicItemRepository.findById(id);
    if (!relic) throw notFound("RELIC_NOT_FOUND");
    const from = relic.current_condition;
    relicItemRepository.update(id, { current_condition: condition });
    writeAudit(
      actor,
      LOG_TEMPLATES.RelicItem.conditionChange,
      "RelicItem",
      id,
      `状态 ${from} → ${condition}`
    );
    return relicItemRepository.findById(id)!;
  }
};
