import { RelicConditionText } from "./RelicCondition";
import { PlanApprovalStatusText } from "./PlanApprovalStatus";
import { DamageSeverityText } from "./DamageSeverity";
import { DamageStatusText } from "./DamageStatusText";
import { StepStatusText } from "./StepStatusText";
import { ImageTypeText } from "./ImageTypeText";
import { UserRoleText } from "./UserRoleText";

export const STATUS_TEXT = {
  RelicCondition: RelicConditionText,
  PlanApprovalStatus: PlanApprovalStatusText,
  DamageSeverity: DamageSeverityText,
  DamageStatus: DamageStatusText,
  StepStatus: StepStatusText,
  ImageType: ImageTypeText,
  UserRole: UserRoleText
} as const;
