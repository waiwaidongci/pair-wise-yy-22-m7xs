import type { RestorationStep } from "../../types/RestorationStep";
import { formatDateTime } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import { AffectedTag } from "./AffectedTag";
import { EmptyState } from "./EmptyState";

interface StepListProps {
  steps: RestorationStep[];
  onComplete?: (step: RestorationStep) => void;
  completingId?: number | null;
}

export function StepList({ steps, onComplete, completingId }: StepListProps) {
  if (steps.length === 0) {
    return <EmptyState title="尚未拆解步骤" hint="方案审批通过后，按修复顺序逐步拆解" />;
  }
  return (
    <ol className="step-list">
      {steps.map((step) => (
        <li key={step.id} className={step.step_status === "COMPLETED" ? "done" : ""}>
          <div className="step-main">
            <span className="step-order">{step.step_order}</span>
            <div>
              <p className="step-tech">{step.technique}</p>
              <small className="muted">
                {step.step_status === "COMPLETED"
                  ? `材料：${step.material_used} · 操作人：${step.operator_name} · 完成于 ${formatDateTime(step.finished_at)}`
                  : "待完成"}
              </small>
            </div>
          </div>
          <span className="row-gap">
            <AffectedTag affected={step.affected} />
            <StatusBadge value={step.step_status} group="StepStatus" />
            {step.step_status !== "COMPLETED" && onComplete && !step.affected && (
              <button
                className="btn small primary"
                disabled={completingId === step.id}
                onClick={() => onComplete(step)}
              >
                {completingId === step.id ? "提交中…" : "完成并记录"}
              </button>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
