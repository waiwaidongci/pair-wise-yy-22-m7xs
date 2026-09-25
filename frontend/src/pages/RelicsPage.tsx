import { useEffect, useMemo, useState } from "react";
import { useArchiveStore } from "../stores/ArchiveStore";
import { RelicInfoCard } from "../components/common/RelicInfoCard";
import { ActionButton } from "../components/common/ActionButton";
import { EmptyState } from "../components/common/EmptyState";
import { Rbac } from "../components/common/Rbac";
import { relicDetailRoute } from "../router/routes";
import { RelicCondition } from "../constants/RelicCondition";
import { RelicConditionText } from "../constants/RelicCondition";

interface RelicsPageProps {
  navigate: (path: string) => void;
}

export function RelicsPage({ navigate }: RelicsPageProps) {
  const { relics, damages, plans, loading, loadAll } = useArchiveStore();
  const [keyword, setKeyword] = useState("");
  const [condition, setCondition] = useState("");

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const rows = useMemo(() => {
    const text = keyword.trim();
    return relics.filter((relic) => {
      const matchKeyword =
        !text || relic.name.includes(text) || relic.relic_code.toLowerCase().includes(text.toLowerCase());
      const matchCondition = !condition || relic.current_condition === condition;
      return matchKeyword && matchCondition;
    });
  }, [relics, keyword, condition]);

  const countOf = (relicId: number) => ({
    damages: damages.filter((item) => item.relic_id === relicId && item.status !== "SUPERSEDED").length,
    plans: plans.filter((item) => item.relic_id === relicId && !item.affected).length
  });

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>文物档案</h1>
        </div>
        <Rbac roles={["RESTORER", "ARCHIVIST"]}>
          <span className="muted">在文物详情内登记病害并推进修复</span>
        </Rbac>
      </div>

      <section className="filter-bar panel">
        <input placeholder="按文物名称 / 编号搜索" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        <select value={condition} onChange={(event) => setCondition(event.target.value)}>
          <option value="">全部状态</option>
          {RelicCondition.map((value) => (
            <option key={value} value={value}>{RelicConditionText[value]}</option>
          ))}
        </select>
      </section>

      {loading && relics.length === 0 ? (
        <p className="muted">档案加载中…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="没有符合条件的文物" />
      ) : (
        <section className="card-grid">
          {rows.map((relic) => {
            const count = countOf(relic.id);
            return (
              <div key={relic.id} className="relic-tile">
                <RelicInfoCard relic={relic} compact />
                <p className="muted">在档病害 {count.damages} · 方案 {count.plans}</p>
                <ActionButton tone="primary" size="small" onClick={() => navigate(relicDetailRoute(relic.id))}>
                  打开修复档案
                </ActionButton>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
