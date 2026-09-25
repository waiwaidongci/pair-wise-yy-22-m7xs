import type { StepStatus } from "../constants/StepStatus";

export interface RestorationStep {
  id: number;
  plan_id: number;
  step_order: number;
  technique: string;
  material_used: string | null;
  operator_id: number | null;
  operator_name: string | null;
  step_status: StepStatus;
  finished_at: string | null;
  affected: boolean;
  created_at: string;
  updated_at: string;
}
