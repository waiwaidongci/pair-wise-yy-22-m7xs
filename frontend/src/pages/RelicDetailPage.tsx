import { useEffect, useState } from "react";
import { Button, Spin } from "antd";
import { useDossierStore } from "../stores/DossierStore";
import { RelicInfoCard } from "../components/common/RelicInfoCard";
import { EmptyState } from "../components/common/EmptyState";
import { DamageRegisterModal } from "../components/common/DamageRegisterModal";
import { DamageFlowCard } from "../components/workflow/DamageFlowCard";
import { PlanFlowCard } from "../components/workflow/PlanFlowCard";
import { usePermissions } from "../hooks/usePermissions";
import { notifyAction } from "../utils/notifyAction";
import { registerDamage, type DamageRegisterPayload } from "../api/DamageRecord";

interface Props {
  relicId: number;
  onBack: () => void;
}

/**
 * 文物可操作档案：一个页面贯穿真实修复流程
 * 病害登记 → 编制方案（沿用病害编号/记录编制人/唯一未结束方案）
 * → 提交审批（改内容退回）→ 专家审批（并发先到者生效）
 * → 拆步骤（材料/操作人/完成时间）→ 修复前后影像 → 归档
 * 更正病害/方案时，下游旧档保留并标“受影响”。
 */
export function RelicDetailPage({ relicId, onBack }: Props) {
  const { relicDossier, loading, loadRelic } = useDossierStore();
  const { isRestorer } = usePermissions();
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    void loadRelic(relicId);
  }, [relicId, loadRelic]);

  if (loading && !relicDossier) {
    return (
      <main className="page">
        <Spin />
      </main>
    );
  }
  if (!relicDossier) {
    return (
      <main className="page">
        <span className="back-link" onClick={onBack}>← 返回文物档案</span>
        <EmptyState title="档案不存在" />
      </main>
    );
  }

  const { relic, damages, plans } = relicDossier;

  const handleRegister = async (values: DamageRegisterPayload) => {
    const result = await notifyAction(() => registerDamage(values), "病害已登记，可编制修复方案");
    if (result.ok) {
      setRegisterOpen(false);
      await loadRelic(relicId);
    }
  };

  return (
    <main className="page">
      <div className="toolbar">
        <span className="back-link" onClick={onBack}>← 返回文物档案</span>
      </div>

      <section className="page-head">
        <div>
          <p className="eyebrow">可操作修复档案</p>
          <h1>{relic.name}</h1>
        </div>
      </section>

      <RelicInfoCard relic={relic} />

      <section className="panel wide">
        <div className="flow-head" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>病害记录（{damages.length}）— 登记后可编制方案</h2>
          {isRestorer ? (
            <Button type="primary" size="small" onClick={() => setRegisterOpen(true)}>
              登记病害
            </Button>
          ) : null}
        </div>
        {damages.length === 0 ? (
          <EmptyState title="暂无病害登记" hint={isRestorer ? "点击右上角「登记病害」开始修复流程。" : "修复师登录后可登记病害。"} />
        ) : (
          <div className="entity-grid">
            {damages.map((damage) => (
              <DamageFlowCard key={damage.id} damage={damage} onChanged={() => loadRelic(relicId)} />
            ))}
          </div>
        )}
      </section>

      <section className="panel wide">
        <h2>修复方案 · 步骤 · 影像（{plans.length}）</h2>
        {plans.length === 0 ? (
          <EmptyState title="尚未编制方案" hint="在上方病害卡片点击「编制修复方案」，方案编号自动沿用病害编号。" />
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {plans.map((plan) => (
              <PlanFlowCard key={plan.id} plan={plan} onChanged={() => loadRelic(relicId)} />
            ))}
          </div>
        )}
      </section>

      {registerOpen ? (
        <DamageRegisterModal
          open
          relicId={relicId}
          onCancel={() => setRegisterOpen(false)}
          onSubmit={handleRegister}
        />
      ) : null}
    </main>
  );
}
