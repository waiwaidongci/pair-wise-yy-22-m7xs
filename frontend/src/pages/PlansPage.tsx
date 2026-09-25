import { useEffect, useMemo, useState } from "react";
import { useArchiveStore } from "../stores/ArchiveStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { AffectedTag } from "../components/common/AffectedTag";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { PlanWorkflowCard } from "../components/workflow/PlanWorkflowCard";
import { EmptyState } from "../components/common/EmptyState";
import { ActionButton } from "../components/common/ActionButton";
import { relicDetailRoute } from "../router/routes";
import { PlanApprovalStatus } from "../constants/PlanApprovalStatus";
import { PlanApprovalStatusText } from "../constants/PlanApprovalStatus";

interface PlansPageProps {
  navigate: (path: string) => void;
}

export function PlansPage({ navigate }: PlansPageProps) {
  const { relics, plans, steps, loading, loadAll } = useArchiveStore();
  const [status, setStatus] = useState("");

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const rows = useMemo(() => {
    const filtered = plans.filter((plan) => !status || plan.approval_status === status);
    return filtered.sort((a, b) => b.id - a.id);
  }, [plans, status]);

  const relicName = (id: number) => relics.find((relic) => relic.id === id)?.name ?? `文物#${id}`;
  const progressOf = (planId: number) => {
    const planSteps = steps.filter((step) => step.plan_id === planId);
    const done = planSteps.filter((step) => step.step_status === "COMPLETED").length;
    return planSteps.length ? `${done}/${planSteps.length}` : "未拆步骤";
  };

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复方案</h1>
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">全部审批状态</option>
          {PlanApprovalStatus.map((value) => (
            <option key={value} value={value}>{PlanApprovalStatusText[value]}</option>
          ))}
        </select>
      </div>

      {loading && plans.length === 0 ? (
        <p className="muted">档案加载中…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="暂无方案" hint="先在病害记录中登记病害，再编制方案" />
      ) : (
        <section className="stack">
          {rows.map((plan) => (
            <div key={plan.id} className="plan-page-item">
              <div className="panel plan-summary">
                <div className="panel-head">
                  <div>
                    <small className="muted">{relicName(plan.relic_id)} · 步骤进度 {progressOf(plan.id)}</small>
                  </div>
                  <span className="row-gap">
                    <AffectedTag affected={plan.affected} />
                    <StatusBadge value={plan.approval_status} group="PlanApprovalStatus" />
                    <ActionButton size="small" onClick={() => navigate(relicDetailRoute(plan.relic_id))}>打开档案</ActionButton>
                  </span>
                </div>
              </div>
              <PlanWorkflowCard plan={plan} onChanged={loadAll} />
              <div className="panel">
                <ApprovalTimeline plan={plan} />
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
