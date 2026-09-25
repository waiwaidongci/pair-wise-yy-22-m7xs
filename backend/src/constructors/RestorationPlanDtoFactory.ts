import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationPlanCreatePayload } from "../types/RestorationPlanPayload";
import { nowIso } from "../utils/formatters";

/** 方案编制入库结构：plan_no 沿用病害编号 damage_no */
export const buildRestorationPlanRow = (
  planNo: string,
  planRevision: number,
  damage: { id: number; damage_no: string; relic_id: number },
  payload: Required<Pick<RestorationPlanCreatePayload, "plan_title" | "method" | "risk_assessment">>,
  authorId: number,
  authorName: string,
  revisedFromId: number | null = null
): Omit<RestorationPlan, "id"> => {
  const ts = nowIso();
  return {
    plan_no: planNo,
    plan_revision: planRevision,
    relic_id: damage.relic_id,
    damage_record_id: damage.id,
    damage_no: damage.damage_no,
    plan_title: payload.plan_title,
    method: payload.method,
    risk_assessment: payload.risk_assessment,
    approval_status: "DRAFT",
    owner_id: authorId,
    author: authorName,
    submitted_content_hash: null,
    submitted_at: null,
    reviewer: null,
    reviewed_at: null,
    review_comment: null,
    archived_at: null,
    affected: false,
    affected_reason: null,
    revised_from_id: revisedFromId,
    version: 0,
    created_at: ts,
    updated_at: ts
  };
};

export const toRestorationPlanDto = (row: RestorationPlan): RestorationPlan => ({ ...row });
