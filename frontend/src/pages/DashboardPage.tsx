import { useEffect, useMemo } from "react";
import { useArchiveStore } from "../stores/ArchiveStore";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { SeverityBadge } from "../components/common/SeverityBadge";
import { AffectedTag } from "../components/common/AffectedTag";
import { ActionButton } from "../components/common/ActionButton";
import { EmptyState } from "../components/common/EmptyState";
import { relicDetailRoute } from "../router/routes";
import { formatDateTime } from "../utils/formatters";

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const { relics, damages, plans, steps, images, loading, loadAll } = useArchiveStore();

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const stats = useMemo(() => {
    const submitted = plans.filter((plan) => plan.approval_status === "SUBMITTED");
    const critical = damages.filter(
      (damage) => (damage.severity === "CRITICAL" || damage.severity === "HIGH") && damage.status !== "SUPERSEDED"
    );
    const activePlans = plans.filter((plan) => plan.approval_status === "APPROVED");
    const totalSteps = steps.filter((step) => !step.affected).length;
    const doneSteps = steps.filter((step) => step.step_status === "COMPLETED" && !step.affected).length;
    const archivedImages = images.filter((image) => image.archived).length;
    return { submitted, critical, activePlans, totalSteps, doneSteps, archivedImages };
  }, [plans, damages, steps, images]);

  const relicName = (id: number) => relics.find((relic) => relic.id === id)?.name ?? `文物#${id}`;

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复工作台</h1>
        </div>
        <StatusBadge value={loading ? "FRAGILE" : "STABLE"} group="RelicCondition" />
      </div>

      <section className="metrics">
        <StatCard label="待审批方案" value={stats.submitted.length} />
        <StatCard label="重度/严重病害" value={stats.critical.length} />
        <StatCard label="修复中方案" value={stats.activePlans.length} />
        <StatCard label="步骤完成进度" value={`${stats.doneSteps}/${stats.totalSteps}`} />
        <StatCard label="已归档影像" value={stats.archivedImages} />
        <StatCard label="在档文物" value={relics.length} />
      </section>

      <section className="workbench-columns">
        <div className="panel">
          <h2 className="section-title">待专家审批</h2>
          {stats.submitted.length === 0 ? (
            <EmptyState title="暂无待审批方案" />
          ) : (
            <div className="stack tight">
              {stats.submitted.map((plan) => (
                <button key={plan.id} className="list-row" onClick={() => navigate(relicDetailRoute(plan.relic_id))}>
                  <div>
                    <strong>{plan.plan_title}</strong>
                    <small className="muted">{plan.plan_no} · {relicName(plan.relic_id)} · 提交于 {formatDateTime(plan.submitted_at)}</small>
                  </div>
                  <span className="row-gap"><AffectedTag affected={plan.affected} /><StatusBadge value={plan.approval_status} group="PlanApprovalStatus" /></span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2 className="section-title">重度/严重病害</h2>
          {stats.critical.length === 0 ? (
            <EmptyState title="暂无重度以上病害" />
          ) : (
            <div className="stack tight">
              {stats.critical.map((damage) => (
                <button key={damage.id} className="list-row" onClick={() => navigate(relicDetailRoute(damage.relic_id))}>
                  <div>
                    <strong>{damage.damage_type}</strong>
                    <small className="muted">{damage.damage_no} · {relicName(damage.relic_id)}</small>
                  </div>
                  <SeverityBadge value={damage.severity} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">修复中方案进度</h2>
        {stats.activePlans.length === 0 ? (
          <EmptyState title="暂无修复中方案" />
        ) : (
          <div className="plan-progress">
            {stats.activePlans.map((plan) => {
              const planSteps = steps.filter((step) => step.plan_id === plan.id);
              const done = planSteps.filter((step) => step.step_status === "COMPLETED").length;
              const percent = planSteps.length ? Math.round((done / planSteps.length) * 100) : 0;
              return (
                <button key={plan.id} className="progress-row" onClick={() => navigate(relicDetailRoute(plan.relic_id))}>
                  <div className="progress-head">
                    <strong>{plan.plan_title}</strong>
                    <span className="row-gap">
                      <AffectedTag affected={plan.affected} />
                      <small className="muted">{done}/{planSteps.length} 步 · {percent}%</small>
                    </span>
                  </div>
                  <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
                </button>
              );
            })}
          </div>
        )}
        <div className="workbench-entry">
          <ActionButton tone="primary" onClick={() => navigate("/relics")}>进入文物档案</ActionButton>
        </div>
      </section>
    </main>
  );
}
