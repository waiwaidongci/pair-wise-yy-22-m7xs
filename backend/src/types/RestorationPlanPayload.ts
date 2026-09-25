export interface RestorationPlanPayload {
  damage_record_id?: number;
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
}

export interface PlanApprovalPayload {
  comment?: string;
}
