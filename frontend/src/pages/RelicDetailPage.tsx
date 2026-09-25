import { useEffect, useMemo, useState } from "react";
import { useArchiveStore } from "../stores/ArchiveStore";
import { RelicInfoCard } from "../components/common/RelicInfoCard";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { DamageRecordItem } from "../components/workflow/DamageRecordItem";
import { PlanWorkflowCard } from "../components/workflow/PlanWorkflowCard";
import { StepsPanel } from "../components/workflow/StepsPanel";
import { ImagesPanel } from "../components/workflow/ImagesPanel";
import { DamageRegisterModal } from "../components/workflow/DamageRegisterModal";
import { ActionButton } from "../components/common/ActionButton";
import { Rbac } from "../components/common/Rbac";
import { EmptyState } from "../components/common/EmptyState";
import { archivePlan } from "../api/RestorationPlan";
import { ApiError } from "../api/client";
import { toast } from "../utils/toast";

interface RelicDetailPageProps {
  relicId: number;
  onBack: () => void;
}

export function RelicDetailPage({ relicId, onBack }: RelicDetailPageProps) {
  const { relics, damages, plans, steps, images, loading, loadAll } = useArchiveStore();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [archivingId, setArchivingId] = useState<number | null>(null);

  useEffect(() => {
    void loadAll();
  }, [loadAll, relicId]);

  const relic = relics.find((item) => item.id === relicId);
  const relicDamages = useMemo(() => damages.filter((item) => item.relic_id === relicId), [damages, relicId]);
  const relicPlans = useMemo(
    () =>
      plans
        .filter((item) => item.relic_id === relicId)
        .sort((a, b) => b.revision_no - a.revision_no || b.id - a.id),
    [plans, relicId]
  );

  if (loading && !relic) {
    return <main className="page"><p className="muted">档案加载中…</p></main>;
  }
  if (!relic) {
    return (
      <main className="page">
        <EmptyState title="未找到该文物档案" />
        <div><ActionButton onClick={onBack}>返回文物列表</ActionButton></div>
      </main>
    );
  }

  const onArchive = async (planId: number) => {
    setArchivingId(planId);
    try {
      await archivePlan(planId);
      toast.success("修复前后影像核对无误，方案已归档");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "归档失败");
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <main className="page detail-page">
      <div className="page-head">
        <div>
          <button className="back-link" onClick={onBack}>← 文物档案</button>
          <h1>可操作修复档案</h1>
        </div>
        <Rbac roles={["RESTORER"]}>
          <ActionButton tone="primary" onClick={() => setRegisterOpen(true)}>登记新病害</ActionButton>
        </Rbac>
      </div>

      <RelicInfoCard relic={relic} />

      <section className="panel">
        <h2 className="section-title">病害登记（{relicDamages.length}）</h2>
        {relicDamages.length === 0 ? (
          <EmptyState title="暂无病害记录" hint="修复师登记病害后才能编制修复方案" />
        ) : (
          <div className="stack">
            {relicDamages
              .slice()
              .sort((a, b) => b.revision_no - a.revision_no || b.id - a.id)
              .map((damage) => (
                <DamageRecordItem key={damage.id} damage={damage} plans={plans} onChanged={loadAll} />
              ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="section-title">修复方案与全流程（{relicPlans.length}）</h2>
        {relicPlans.length === 0 ? (
          <EmptyState title="暂无修复方案" hint="在上方病害卡片中编制方案，方案将沿用病害编号" />
        ) : (
          <div className="stack">
            {relicPlans.map((plan) => {
              const planSteps = steps.filter((step) => step.plan_id === plan.id);
              const stepsDone = planSteps.length > 0 && planSteps.every((step) => step.step_status === "COMPLETED");
              return (
                <div key={plan.id} className="plan-workflow">
                  <PlanWorkflowCard plan={plan} onChanged={loadAll} />
                  <ApprovalTimeline plan={plan} />
                  {(plan.approval_status === "APPROVED" || planSteps.length > 0 || plan.approval_status === "ARCHIVED") && (
                    <StepsPanel plan={plan} steps={steps} onChanged={loadAll} />
                  )}
                  {(plan.approval_status === "APPROVED" || images.some((image) => image.plan_id === plan.id) || plan.approval_status === "ARCHIVED") && (
                    <ImagesPanel
                      plan={plan}
                      images={images}
                      stepsDone={stepsDone}
                      onChanged={loadAll}
                      onArchive={() => onArchive(plan.id)}
                      archiving={archivingId === plan.id}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <DamageRegisterModal
        open={registerOpen}
        relics={[relic]}
        defaultRelicId={relic.id}
        onClose={() => setRegisterOpen(false)}
        onChanged={loadAll}
      />
    </main>
  );
}
