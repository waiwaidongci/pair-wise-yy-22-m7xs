import { db } from "./db";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

const OPEN_STATUSES: PlanApprovalStatus[] = ["DRAFT", "SUBMITTED"];

export const restorationPlanRepository = {
  findAll: (): RestorationPlan[] => [...db.restorationPlan],
  findById: (id: number): RestorationPlan | undefined =>
    db.restorationPlan.find((row) => row.id === id),
  findByDamage: (damageRecordId: number): RestorationPlan[] =>
    db.restorationPlan.filter((row) => row.damage_record_id === damageRecordId),
  findByRelic: (relicId: number): RestorationPlan[] =>
    db.restorationPlan.filter((row) => row.relic_id === relicId),
  /** 同一病害只能有一份未结束方案（草稿/审批中）。 */
  findOpenByDamage: (damageRecordId: number): RestorationPlan | undefined =>
    db.restorationPlan.find(
      (row) => row.damage_record_id === damageRecordId && OPEN_STATUSES.includes(row.approval_status)
    ),
  create: (row: RestorationPlan): RestorationPlan => {
    db.restorationPlan.push(row);
    return row;
  },
  update: (id: number, patch: Partial<RestorationPlan>): RestorationPlan | undefined => {
    const row = db.restorationPlan.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
