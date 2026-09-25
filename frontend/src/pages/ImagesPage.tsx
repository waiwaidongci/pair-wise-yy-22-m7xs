import { useEffect, useMemo, useState } from "react";
import { useArchiveStore } from "../stores/ArchiveStore";
import { ImageCompare } from "../components/common/ImageCompare";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { ActionButton } from "../components/common/ActionButton";
import { AffectedTag } from "../components/common/AffectedTag";
import { relicDetailRoute } from "../router/routes";
import { usePagination } from "../hooks/usePagination";

interface ImagesPageProps {
  navigate: (path: string) => void;
}

export function ImagesPage({ navigate }: ImagesPageProps) {
  const { relics, plans, images, loading, loadAll } = useArchiveStore();
  const [archivedOnly, setArchivedOnly] = useState(false);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const groups = useMemo(() => {
    return plans
      .filter((plan) => {
        const planImages = images.filter((image) => image.plan_id === plan.id);
        if (planImages.length === 0) return false;
        if (archivedOnly && !planImages.every((image) => image.archived)) return false;
        return true;
      })
      .sort((a, b) => b.id - a.id)
      .map((plan) => ({
        plan,
        before: images.find((image) => image.plan_id === plan.id && image.image_type === "BEFORE"),
        after: images.find((image) => image.plan_id === plan.id && image.image_type === "AFTER")
      }));
  }, [plans, images, archivedOnly]);

  const { pageRows, page, setPage, totalPages } = usePagination(groups, 6);
  const relicName = (id: number) => relics.find((relic) => relic.id === id)?.name ?? `文物#${id}`;

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>影像版本</h1>
        </div>
        <label className="filter-check">
          <input type="checkbox" checked={archivedOnly} onChange={(event) => setArchivedOnly(event.target.checked)} />
          仅看已归档
        </label>
      </div>

      {loading && images.length === 0 ? (
        <p className="muted">档案加载中…</p>
      ) : groups.length === 0 ? (
        <EmptyState title="暂无影像" hint="方案审批通过后，在文物详情内上传修复前/修复后影像" />
      ) : (
        <section className="stack">
          {pageRows.map(({ plan, before, after }) => (
            <div key={plan.id} className="panel image-group">
              <div className="panel-head">
                <div>
                  <h3>{plan.plan_title}</h3>
                  <small className="muted">
                    {relicName(plan.relic_id)} · {plan.plan_no}
                  </small>
                </div>
                <span className="row-gap">
                  <AffectedTag affected={plan.affected || !!before?.affected || !!after?.affected} />
                  <StatusBadge value={plan.approval_status} group="PlanApprovalStatus" />
                  <ActionButton size="small" onClick={() => navigate(relicDetailRoute(plan.relic_id))}>打开档案</ActionButton>
                </span>
              </div>
              <ImageCompare before={before} after={after} />
            </div>
          ))}
          {totalPages > 1 && (
            <div className="pager">
              <ActionButton size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</ActionButton>
              <span className="muted">{page} / {totalPages}</span>
              <ActionButton size="small" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</ActionButton>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
