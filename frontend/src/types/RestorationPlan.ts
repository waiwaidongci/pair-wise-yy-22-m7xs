export interface RestorationPlan {
  id: number;
  plan_no: string;
  plan_revision: number;
  relic_id: number;
  damage_record_id: number;
  damage_no: string;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: string;
  owner_id: number;
  author: string;
  submitted_content_hash: string | null;
  submitted_at: string | null;
  reviewer: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  archived_at: string | null;
  affected: boolean;
  affected_reason: string | null;
  revised_from_id: number | null;
  version: number;
  created_at: string;
  updated_at: string;
}
