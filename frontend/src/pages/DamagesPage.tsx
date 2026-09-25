import { useEffect, useMemo, useState } from "react";
import { useArchiveStore } from "../stores/ArchiveStore";
import { SeverityBadge } from "../components/common/SeverityBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { AffectedTag } from "../components/common/AffectedTag";
import { ActionButton } from "../components/common/ActionButton";
import { EmptyState } from "../components/common/EmptyState";
import { Rbac } from "../components/common/Rbac";
import { DamageRegisterModal } from "../components/workflow/DamageRegisterModal";
import { relicDetailRoute } from "../router/routes";
import { formatDateTime } from "../utils/formatters";
import { DamageSeverity } from "../constants/DamageSeverity";
import { DamageSeverityText } from "../constants/DamageSeverity";

interface DamagesPageProps {
  navigate: (path: string) => void;
}

export function DamagesPage({ navigate }: DamagesPageProps) {
  const { relics, damages, loading, loadAll } = useArchiveStore();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [severity, setSeverity] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const rows = useMemo(() => {
    const text = keyword.trim();
    return damages
      .filter((damage) => (!severity || damage.severity === severity) && (!text || damage.damage_no.includes(text) || damage.damage_type.includes(text)))
      .sort((a, b) => b.id - a.id);
  }, [damages, severity, keyword]);

  const relicName = (id: number) => relics.find((relic) => relic.id === id)?.name ?? `文物#${id}`;

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>病害记录</h1>
        </div>
        <Rbac roles={["RESTORER"]}>
          <ActionButton tone="primary" onClick={() => setRegisterOpen(true)}>登记病害</ActionButton>
        </Rbac>
      </div>

      <section className="filter-bar panel">
        <input placeholder="按病害编号 / 类型搜索" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="">全部严重程度</option>
          {DamageSeverity.map((value) => (
            <option key={value} value={value}>{DamageSeverityText[value]}</option>
          ))}
        </select>
      </section>

      {loading && damages.length === 0 ? (
        <p className="muted">档案加载中…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="暂无病害记录" hint="点击右上角登记第一条病害" />
      ) : (
        <section className="table panel">
          {rows.map((damage) => (
            <article key={damage.id} className={"table-row damage-row " + (damage.affected ? "is-affected" : "")}>
              <div className="row-main">
                <strong>{damage.damage_type} <span className="muted">{damage.damage_no} · R{damage.revision_no}</span></strong>
                <small className="muted">
                  {relicName(damage.relic_id)} · {damage.position_desc}
                </small>
                <small className="muted">发现人 {damage.discovered_by} · {formatDateTime(damage.discovered_at)}</small>
              </div>
              <span className="row-gap">
                <AffectedTag affected={damage.affected} />
                <SeverityBadge value={damage.severity} />
                <StatusBadge value={damage.status} group="DamageStatus" />
                <ActionButton size="small" onClick={() => navigate(relicDetailRoute(damage.relic_id))}>查看档案</ActionButton>
              </span>
            </article>
          ))}
        </section>
      )}

      <DamageRegisterModal open={registerOpen} relics={relics} onClose={() => setRegisterOpen(false)} onChanged={loadAll} />
    </main>
  );
}
