export interface RestorationPlanCreatePayload {
  damage_record_id?: number | string;
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
}

export interface RestorationPlanUpdatePayload {
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
}

export interface PlanReviewPayload {
  approved?: boolean;
  comment?: string;
  /** 客户端读取到的版本号，用于两人同时审批的乐观锁判定 */
  expected_version?: number;
}

export interface RestorationPlanCorrectPayload {
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
  corrected_reason?: string;
}
