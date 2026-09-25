import { useEffect, useMemo, useState } from "react";
import { Select, Spin } from "antd";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { AffectedTag } from "../components/common/AffectedTag";
import { PlanReviewModal } from "../components/common/PlanReviewModal";
import { FlowButton } from "../components/common/FlowButton";
import { EmptyState } from "../components/common/EmptyState";
import { usePagination } from "../hooks/usePagination";
import { usePermissions } from "../hooks/usePermissions";
import { notifyAction } from "../utils/notifyAction";
import { PlanApprovalStatus } from "../constants/PlanApprovalStatus";
import { PlanApprovalStatusText } from "../constants/PlanApprovalStatus";
import { formatDate } from "../utils/formatters";
import type { RestorationPlan } from "../types/RestorationPlan";

interface Props {
  onOpenRelic: (id: number) => void;
}

/** 修复方案页：方案状态筛选；专家可直接审批，编制人可跳详情继续流程 */
export function PlansPage({ onOpenRelic }: Props) {
  const { rows, loading, load, review } = useRestorationPlanStore();
  const relicStore = useRelicItemStore();
  const { isExpert } = usePermissions();
  const [status, setStatus] = useState<string | undefined>();
  const [reviewTarget, setReviewTarget] = useState<RestorationPlan | null>(null);

  useEffect(() => {
    void load();
    void relicStore.load();
  }, [load, relicStore]);

  const relicName = (id: number) => relicStore.rows.find((relic) => relic.id === id)?.name ?? `文物#${id}`;

  const filtered = useMemo(
    () => rows.filter((plan) => (status ? plan.approval_status === status : true)),
    [rows, status]
  );
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 10);

  const handleReview = async (values: { approved: boolean; comment?: string }) => {
    if (!reviewTarget) return;
    const result = await notifyAction(
      () => review(reviewTarget.id, { ...values, expected_version: reviewTarget.version }),
      values.approved ? "审批通过" : "已驳回"
    );
    if (result.ok) {
      setReviewTarget(null);
      void load();
    }
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">restoration plans</p>
          <h1>修复方案</h1>
        </div>
        <div className="toolbar">
          <Select
            placeholder="审批状态"
            allowClear
            style={{ width: 150 }}
            value={status}
            onChange={setStatus}
            options={PlanApprovalStatus.map((value) => ({ value, label: PlanApprovalStatusText[value] }))}
          />
        </div>
      </section>

      {loading ? <Spin /> : null}
      {!loading && filtered.length === 0 ? <EmptyState title="暂无修复方案" hint="文物详情中对已登记病害点击「编制修复方案」。" /> : null}

      <section className="panel wide">
        {pageRows.map((plan) => (
          <div className="row" key={plan.id} style={{ gridTemplateColumns: "1fr auto auto auto" }}>
            <div>
              <strong>{plan.plan_no}</strong>{" "}
              <span className="back-link" onClick={() => onOpenRelic(plan.relic_id)}>{relicName(plan.relic_id)}</span>
              <div className="meta-line" style={{ marginTop: 4 }}>
                <span>{plan.plan_title}</span>
                <span>编制 {plan.author} · {formatDate(plan.created_at)}</span>
                <span>病害 {plan.damage_no}</span>
                {plan.reviewer ? <span>审批 {plan.reviewer}</span> : null}
              </div>
            </div>
            {plan.affected ? <AffectedTag /> : <span />}
            <StatusBadge value={plan.approval_status} />
            <FlowButton
              type="link"
              onClick={() => {
                if (isExpert && plan.approval_status === "SUBMITTED") {
                  setReviewTarget(plan);
                } else {
                  onOpenRelic(plan.relic_id);
                }
              }}
            >
              {isExpert && plan.approval_status === "SUBMITTED" ? "审批" : "查看"}
            </FlowButton>
          </div>
        ))}
        {totalPages > 1 ? (
          <div className="toolbar" style={{ marginTop: 12 }}>
            <span className="meta-line">第 {page}/{totalPages} 页</span>
            <span className="spacer" />
            <button className="back-link" onClick={() => setPage(Math.max(1, page - 1))}>上一页</button>
            <button className="back-link" onClick={() => setPage(Math.min(totalPages, page + 1))}>下一页</button>
          </div>
        ) : null}
      </section>

      {reviewTarget ? (
        <PlanReviewModal
          open
          planNo={reviewTarget.plan_no}
          onCancel={() => setReviewTarget(null)}
          onSubmit={handleReview}
        />
      ) : null}
    </main>
  );
}
