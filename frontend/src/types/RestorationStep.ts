export type StepStatusValue = "PENDING" | "FINISHED";

export interface RestorationStep {
  id: number;
  plan_id: number;
  step_order: number;
  technique: string;
  material_used: string;
  operator_id: number | null;
  operator: string | null;
  step_status: StepStatusValue | string;
  finished_at: string | null;
  affected: boolean;
  affected_reason: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}
