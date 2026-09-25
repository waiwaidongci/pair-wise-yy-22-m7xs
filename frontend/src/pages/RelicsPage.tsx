import { useEffect, useState } from "react";
import { Spin } from "antd";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { useDossierStore } from "../stores/DossierStore";
import { RelicInfoCard } from "../components/common/RelicInfoCard";
import { EmptyState } from "../components/common/EmptyState";
import { DamageRegisterModal } from "../components/common/DamageRegisterModal";
import { FlowButton } from "../components/common/FlowButton";
import { usePermissions } from "../hooks/usePermissions";
import { notifyAction } from "../utils/notifyAction";
import type { DamageRegisterPayload } from "../api/DamageRecord";
import { registerDamage } from "../api/DamageRecord";
import type { RelicItem } from "../types/RelicItem";

interface Props {
  onOpenRelic: (id: number) => void;
}

/** 文物档案：列表，点击进入可操作档案详情；修复师可直接发起病害登记 */
export function RelicsPage({ onOpenRelic }: Props) {
  const { rows, loading, load } = useRelicItemStore();
  const { preloadSummary, summaryCache } = useDossierStore();
  const { isRestorer } = usePermissions();
  const [registerTarget, setRegisterTarget] = useState<RelicItem | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  // 简单加载各文物的病害/方案数量用于卡片摘要
  useEffect(() => {
    void Promise.all(rows.map((relic) => preloadSummary(relic.id)));
  }, [rows, preloadSummary]);

  const handleRegister = async (values: DamageRegisterPayload) => {
    const result = await notifyAction(() => registerDamage(values), "病害已登记，可在文物详情中编制方案");
    if (result.ok) {
      setRegisterTarget(null);
      if (registerTarget) void preloadSummary(registerTarget.id);
    }
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic archive</p>
          <h1>文物档案</h1>
        </div>
      </section>

      {loading && rows.length === 0 ? <Spin /> : null}
      {!loading && rows.length === 0 ? <EmptyState title="暂无藏品" /> : null}

      <div className="entity-grid">
        {rows.map((relic) => {
          const summary = summaryCache[relic.id];
          return (
            <div key={relic.id} className="panel relic-card" onClick={() => onOpenRelic(relic.id)}>
              <RelicInfoCard relic={relic} />
              <div className="meta-line">
                <span>病害 {summary?.damages.length ?? 0}</span>
                <span>方案 {summary?.plans.length ?? 0}</span>
                <span>影像 {summary?.images.length ?? 0}</span>
              </div>
              {isRestorer ? (
                <FlowButton
                  onClick={(event) => {
                    event.stopPropagation();
                    setRegisterTarget(relic);
                  }}
                >
                  登记病害
                </FlowButton>
              ) : null}
            </div>
          );
        })}
      </div>

      {registerTarget ? (
        <DamageRegisterModal
          open
          relicId={registerTarget.id}
          onCancel={() => setRegisterTarget(null)}
          onSubmit={handleRegister}
        />
      ) : null}
    </main>
  );
}
