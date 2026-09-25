import { useState } from "react";
import type { DamageRecord } from "../../types/DamageRecord";
import { SeverityBadge } from "../common/SeverityBadge";
import { StatusBadge } from "../common/StatusBadge";
import { AffectedTag } from "../common/AffectedTag";
import { FlowButton } from "../common/FlowButton";
import { DamageCorrectModal } from "../common/DamageCorrectModal";
import { PlanFormModal } from "../common/PlanFormModal";
import { useDamageRecordStore } from "../../stores/DamageRecordStore";
import { useRestorationPlanStore } from "../../stores/RestorationPlanStore";
import { usePermissions } from "../../hooks/usePermissions";
import { notifyAction } from "../../utils/notifyAction";
import { formatDate } from "../../utils/formatters";
import type { DamageCorrectPayload } from "../../api/DamageRecord";
import type { PlanCreatePayload } from "../../api/RestorationPlan";

interface Props {
  damage: DamageRecord;
  onChanged: () => Promise<void>;
}

/** 病害流程卡：登记后可编制方案；原病害可更正（旧档保留、下游标受影响） */
export function DamageFlowCard({ damage, onChanged }: Props) {
  const { isRestorer } = usePermissions();
  const registerStore = useDamageRecordStore();
  const planStore = useRestorationPlanStore();
  const [planOpen, setPlanOpen] = useState(false);
  const [correctOpen, setCorrectOpen] = useState(false);

  const isCorrected = damage.status === "CORRECTED";
  const createDisabledReason = isCorrected
    ? "该病害已更正，请基于最新修订版操作"
    : damage.can_create_plan === false
    ? "同一病害只能有一份未结束方案"
    : !isRestorer
    ? "仅修复师可编制方案"
    : null;

  const handleCreatePlan = async (values: PlanCreatePayload) => {
    const result = await notifyAction(() => planStore.create(values), "方案已编制，编号沿用病害编号");
    if (result.ok) {
      setPlanOpen(false);
      await onChanged();
    }
  };

  const handleCorrect = async (values: DamageCorrectPayload) => {
    const result = await notifyAction(
      () => registerStore.correct(damage.id, values),
      "已生成病害修订版，旧档关联方案/步骤/影像标记为受影响"
    );
    if (result.ok) {
      setCorrectOpen(false);
      await onChanged();
    }
  };

  return (
    <article className={"flow-card" + (damage.affected ? " is-affected" : "")}>
      <div className="flow-head">
        <div>
          <span className="no">{damage.damage_no} · R{damage.revision}</span>
          <h3 style={{ marginTop: 4 }}>{damage.damage_type}</h3>
        </div>
        <div className="flow-actions">
          <SeverityBadge value={damage.severity} />
          <StatusBadge value={damage.status} />
          {damage.affected ? <AffectedTag /> : null}
        </div>
      </div>

      <p className="content-text">{damage.position_desc}</p>
      <div className="meta-line">
        <span>登记人：{damage.discovered_by}</span>
        <span>登记时间：{formatDate(damage.discovered_at)}</span>
        <span>关联方案：{damage.plan_count ?? 0} 份</span>
      </div>
      {damage.corrected_reason ? (
        <div className="affected-banner" style={{ marginBottom: 0 }}>更正原因：{damage.corrected_reason}</div>
      ) : null}

      {isRestorer ? (
        <div className="flow-actions">
          <FlowButton type="primary" disabledReason={createDisabledReason} onClick={() => setPlanOpen(true)}>
            编制修复方案
          </FlowButton>
          <FlowButton
            disabledReason={isCorrected ? "已更正的旧档不能再次更正" : null}
            onClick={() => setCorrectOpen(true)}
          >
            更正病害
          </FlowButton>
        </div>
      ) : null}

      {planOpen ? (
        <PlanFormModal
          mode="create"
          damageRecordId={damage.id}
          damageNo={damage.damage_no}
          open={planOpen}
          onCancel={() => setPlanOpen(false)}
          onSubmit={handleCreatePlan}
        />
      ) : null}
      {correctOpen ? (
        <DamageCorrectModal
          open={correctOpen}
          damage={damage}
          onCancel={() => setCorrectOpen(false)}
          onSubmit={handleCorrect}
        />
      ) : null}
    </article>
  );
}
