import { useEffect, useMemo } from "react";
import { Spin } from "antd";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { SeverityBadge } from "../components/common/SeverityBadge";
import { EmptyState } from "../components/common/EmptyState";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { useDamageRecordStore } from "../stores/DamageRecordStore";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useImageVersionStore } from "../stores/ImageVersionStore";
import { listAuditLogs } from "../api/RelicItem";
import { formatDate } from "../utils/formatters";
import { useState } from "react";
import type { AuditLogEntry } from "../types/Dossier";

interface Props {
  onOpenRelic: (id: number) => void;
}

/** 修复工作台：待审批、重度病害、修复进度、影像归档量与操作日志 */
export function DashboardPage({ onOpenRelic }: Props) {
  const relicStore = useRelicItemStore();
  const damageStore = useDamageRecordStore();
  const planStore = useRestorationPlanStore();
  const imageStore = useImageVersionStore();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    void relicStore.load();
    void damageStore.load();
    void planStore.load();
    void imageStore.load();
    void listAuditLogs().then(setLogs).catch(() => setLogs([]));
  }, [relicStore, damageStore, planStore, imageStore]);

  const loading = relicStore.loading;

  const pendingPlans = planStore.rows.filter((plan) => plan.approval_status === "SUBMITTED");
  const severeDamages = damageStore.rows.filter(
    (damage) => (damage.severity === "HIGH" || damage.severity === "CRITICAL") && damage.status !== "CLOSED" && damage.status !== "CORRECTED"
  );
  const inProgress = planStore.rows.filter((plan) => plan.approval_status === "APPROVED").length;
  const archivedImages = imageStore.rows.filter((image) => image.archived === "ARCHIVED").length;

  const relicName = useMemo(() => {
    const map = new Map(relicStore.rows.map((relic) => [relic.id, relic.name]));
    return (id: number) => map.get(id) ?? `文物#${id}`;
  }, [relicStore.rows]);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">dashboard</p>
          <h1>修复工作台</h1>
        </div>
      </section>

      {loading ? <Spin /> : (
        <section className="metrics">
          <StatCard label="待专家审批方案" value={pendingPlans.length} hint="份" />
          <StatCard label="重度/严重病害（未关闭）" value={severeDamages.length} hint="条" />
          <StatCard label="修复中方案" value={inProgress} hint="份" />
          <StatCard label="已归档影像" value={archivedImages} hint="张" />
        </section>
      )}

      <section className="workbench">
        <div className="panel">
          <h2>待审批方案</h2>
          {pendingPlans.length === 0 ? <EmptyState title="暂无待审批方案" /> : pendingPlans.map((plan) => (
            <div className="row" key={plan.id}>
              <div>
                <strong>{plan.plan_no}</strong>
                <div className="meta-line" style={{ marginTop: 4 }}>
                  <span>{plan.plan_title}</span>
                  <span>{relicName(plan.relic_id)}</span>
                  <span>编制 {plan.author} · 提交 {formatDate(plan.submitted_at)}</span>
                </div>
              </div>
              <StatusBadge value={plan.approval_status} />
              <button className="back-link" onClick={() => onOpenRelic(plan.relic_id)}>去审批</button>
            </div>
          ))}

          <h2 style={{ marginTop: 18 }}>重度 / 严重病害</h2>
          {severeDamages.length === 0 ? <EmptyState title="暂无重度以上未关闭病害" /> : severeDamages.map((damage) => (
            <div className="row" key={damage.id}>
              <div>
                <strong>{damage.damage_no} · R{damage.revision}</strong>
                <div className="meta-line" style={{ marginTop: 4 }}>
                  <span>{damage.damage_type}</span>
                  <span>{relicName(damage.relic_id)}</span>
                </div>
              </div>
              <SeverityBadge value={damage.severity} />
              <button className="back-link" onClick={() => onOpenRelic(damage.relic_id)}>查看档案</button>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>操作日志</h2>
          {logs.length === 0 ? (
            <EmptyState title="暂无操作日志" hint="病害登记、方案审批、步骤完成、影像归档等写操作都会在此留痕。" />
          ) : (
            <ul className="timeline">
              {[...logs].reverse().slice(0, 18).map((log) => (
                <li key={log.id}>
                  <span className="t-time">{formatDate(log.created_at)}</span>
                  {log.detail}
                  <div className="meta-line"><span>{log.actor}（{log.actor_role}）</span></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
