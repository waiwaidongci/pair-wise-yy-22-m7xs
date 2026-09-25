import { useEffect, useMemo, useState } from "react";
import { Input, Select, Spin } from "antd";
import { useDamageRecordStore } from "../stores/DamageRecordStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { SeverityBadge } from "../components/common/SeverityBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { AffectedTag } from "../components/common/AffectedTag";
import { EmptyState } from "../components/common/EmptyState";
import { usePagination } from "../hooks/usePagination";
import { DamageSeverity } from "../constants/DamageSeverity";
import { formatDate } from "../utils/formatters";
import type { DamageRecord } from "../types/DamageRecord";

interface Props {
  onOpenRelic: (id: number) => void;
}

/** 病害记录页：全量病害、分级筛选、修订版本一目了然，点击跳转文物档案 */
export function DamagesPage({ onOpenRelic }: Props) {
  const { rows, loading, load } = useDamageRecordStore();
  const relicStore = useRelicItemStore();
  const [keyword, setKeyword] = useState("");
  const [severity, setSeverity] = useState<string | undefined>();

  useEffect(() => {
    void load();
    void relicStore.load();
  }, [load, relicStore]);

  const relicName = (id: number) => relicStore.rows.find((relic) => relic.id === id)?.name ?? `文物#${id}`;

  const filtered = useMemo(
    () =>
      rows.filter((damage) => {
        if (severity && damage.severity !== severity) return false;
        if (keyword && !`${damage.damage_no}${damage.damage_type}${damage.position_desc}`.includes(keyword))
          return false;
        return true;
      }),
    [rows, keyword, severity]
  );
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 10);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">damage register</p>
          <h1>病害记录</h1>
        </div>
        <div className="toolbar">
          <Input.Search placeholder="搜索编号/类型/位置" allowClear style={{ width: 240 }} onChange={(e) => setKeyword(e.target.value)} />
          <Select
            placeholder="严重程度"
            allowClear
            style={{ width: 140 }}
            value={severity}
            onChange={setSeverity}
            options={DamageSeverity.map((value) => ({ value, label: { LOW: "轻度", MEDIUM: "中度", HIGH: "重度", CRITICAL: "严重" }[value] }))}
          />
        </div>
      </section>

      {loading ? <Spin /> : null}
      {!loading && filtered.length === 0 ? <EmptyState title="没有符合条件的病害记录" /> : null}

      <section className="panel wide">
        {pageRows.map((damage: DamageRecord) => (
          <div className="row" key={damage.id}>
            <div>
              <strong>{damage.damage_no} · R{damage.revision}</strong>{" "}
              <span className="back-link" onClick={() => onOpenRelic(damage.relic_id)}>{relicName(damage.relic_id)}</span>
              <div className="meta-line" style={{ marginTop: 4 }}>
                <span>{damage.damage_type}</span>
                <span>{damage.position_desc}</span>
                <span>登记 {formatDate(damage.discovered_at)}</span>
                {damage.corrected_reason ? <span>更正原因：{damage.corrected_reason}</span> : null}
              </div>
            </div>
            <SeverityBadge value={damage.severity} />
            <span className="flow-actions">
              <StatusBadge value={damage.status} />
              {damage.affected ? <AffectedTag /> : null}
            </span>
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
    </main>
  );
}
