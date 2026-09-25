import type { RestorationPlan } from "../../types/RestorationPlan";
import { formatDateTime } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import { AffectedTag } from "./AffectedTag";

interface ApprovalTimelineProps {
  plan: RestorationPlan;
}

interface TimelineNode {
  key: string;
  title: string;
  time: string | null;
  actor?: string | null;
  active: boolean;
  detail?: string | null;
}

/** 方案编制 → 提交 → 审批 → 归档 的全流程时间线，退回/更正也在其中留痕。 */
export function ApprovalTimeline({ plan }: ApprovalTimelineProps) {
  const nodes: TimelineNode[] = [
    { key: "draft", title: `编制（${plan.owner_name}）`, time: plan.created_at, active: true },
    {
      key: "submit",
      title: "提交审批",
      time: plan.submitted_at,
      active:
        !!plan.submitted_at ||
        plan.approval_status === "APPROVED" ||
        plan.approval_status === "ARCHIVED" ||
        plan.approval_status === "REJECTED",
      detail:
        plan.approval_status === "DRAFT" && plan.content_version > (plan.submitted_content_version ?? 0)
          ? "内容修改后已退回重新提交"
          : null
    },
    {
      key: "approve",
      title: plan.approval_status === "REJECTED" ? "专家退回" : "专家审批通过",
      time: plan.approval_status === "REJECTED" ? plan.updated_at : plan.approved_at,
      actor: plan.approval_status === "REJECTED" ? null : plan.approved_by_name,
      active: plan.approval_status === "APPROVED" || plan.approval_status === "ARCHIVED",
      detail: plan.reject_reason
    },
    { key: "archive", title: "影像归档", time: plan.archived_at, active: plan.approval_status === "ARCHIVED" }
  ];

  return (
    <div className="timeline">
      <div className="timeline-head">
        <strong>{plan.plan_no}</strong>
        <span className="row-gap">
          <StatusBadge value={plan.approval_status} group="PlanApprovalStatus" />
          <AffectedTag affected={plan.affected} />
        </span>
      </div>
      <ol>
        {nodes.map((node, index) => (
          <li key={node.key} className={node.active ? "active" : index === nodes.findIndex((item) => !item.active) ? "current" : ""}>
            <span className="dot" />
            <div>
              <p>{node.title}</p>
              <small className="muted">
                {node.time ? formatDateTime(node.time) : "待处理"}
                {node.actor ? ` · ${node.actor}` : ""}
              </small>
              {node.detail && <small className="warn-text">{node.detail}</small>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
