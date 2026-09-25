import type { RestorationPlan } from "../models/RestorationPlan";

export const createRestorationPlanFormDto = (
  overrides: Partial<RestorationPlan> = {}
): Omit<RestorationPlan, "id"> => ({
  plan_no: "",
  relic_id: 0,
  damage_record_id: 0,
  damage_no: "",
  plan_title: "",
  method: "",
  risk_assessment: "",
  approval_status: "DRAFT",
  owner_id: 0,
  owner_name: "",
  revision_no: 1,
  superseded_by_id: null,
  submitted_at: null,
  content_version: 1,
  submitted_content_version: null,
  approved_by: null,
  approved_by_name: null,
  approved_at: null,
  reject_reason: null,
  archived_at: null,
  affected: false,
  created_at: "",
  updated_at: "",
  ...overrides
});

export const createRestorationPlanResponseDto = (row: RestorationPlan): RestorationPlan => ({ ...row });

export const createRestorationPlanDto = createRestorationPlanFormDto;
