import type { PlanDossier } from "../../types/Dossier";
import type { AuditLogEntry } from "../../types/Dossier";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../../utils/formatters";

interface TimelineNode {
  key: string;
  time: string | null;
  title: string;
  actor?: string | null;
  status?: string;
  active: boolean;
}

/** 由方案当前状态推导审批/执行时间线节点 */
function buildPlanNodes(plan: PlanDossier): TimelineNode[] {
  const nodes: TimelineNode[] = [
    { key: "create", time: plan.created_at, title: `方案编制（${plan.author}）`, actor: plan.author, active: true },
    {
      key: "submit",
      time: plan.submitted_at,
      title: "提交专家审批",
      actor: plan.author,
      status: plan.submitted_at ? "SUBMITTED" : undefined,
      active: plan.submitted_at !== null
    },
    {
      key: "review",
      time: plan.reviewed_at,
      title: plan.approval_status === "REJECTED" ? "专家驳回" : "专家审批通过",
      actor: plan.reviewer,
      status: plan.approval_status === "REJECTED" ? "REJECTED" : "APPROVED",
      active: plan.reviewed_at !== null
    },
    {
      key: "steps",
      time: null,
      title: `修复步骤执行（${plan.progress_text} 已完成）`,
      active: ["APPROVED", "ARCHIVED"].includes(plan.approval_status)
    },
    {
      key: "archive",
      time: plan.archived_at,
      title: "影像齐全，归档",
      status: "ARCHIVED",
      active: plan.approval_status === "ARCHIVED"
    }
  ];
  return nodes;
}

/** 审批时间线：方案页与文物详情共用 */
export function ApprovalTimeline({ plan, auditLogs }: { plan: PlanDossier; auditLogs?: AuditLogEntry[] }) {
  const nodes = buildPlanNodes(plan).filter((node) => node.active);
  return (
    <div className="shared-widget">
      <h3>审批与执行时间线 · {plan.plan_no}</h3>
      <ul className="timeline">
        {nodes.map((node) => (
          <li key={node.key}>
            <span className="t-time">{node.time ? formatDate(node.time) : "—"}</span>
            {node.title}
            {node.actor ? ` · ${node.actor}` : ""}{" "}
            {node.status ? <StatusBadge value={node.status} /> : null}
          </li>
        ))}
      </ul>
      {plan.review_comment ? (
        <p className="content-text" style={{ marginTop: 10 }}>审批意见：{plan.review_comment}</p>
      ) : null}
      {auditLogs && auditLogs.length > 0 ? (
        <>
          <h3 style={{ marginTop: 14 }}>操作日志</h3>
          <ul className="timeline">
            {auditLogs.slice(0, 8).map((log) => (
              <li key={log.id}>
                <span className="t-time">{formatDate(log.created_at)}</span>
                {log.detail} · {log.actor}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
