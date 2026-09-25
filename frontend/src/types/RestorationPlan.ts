export interface RestorationPlan {
  id: number;
  plan_no: string;
  relic_id: number;
  damage_record_id: number;
  damage_no: string;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: string;
  owner_id: number;
  owner_name: string;
  revision_no: number;
  superseded_by_id: number | null;
  submitted_at: string | null;
  content_version: number;
  submitted_content_version: number | null;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  reject_reason: string | null;
  archived_at: string | null;
  affected: boolean;
  created_at: string;
  updated_at: string;
}
