import { useState } from "react";
import type { DamageRecord } from "../../types/DamageRecord";
import type { RestorationPlan } from "../../types/RestorationPlan";
import { SeverityBadge } from "../common/SeverityBadge";
import { StatusBadge } from "../common/StatusBadge";
import { AffectedTag } from "../common/AffectedTag";
import { ActionButton } from "../common/ActionButton";
import { Modal } from "../common/Modal";
import { Field } from "../common/Field";
import { Rbac } from "../common/Rbac";
import { createRestorationPlan } from "../../api/RestorationPlan";
import { correctDamage } from "../../api/DamageRecord";
import { ApiError } from "../../api/client";
import { toast } from "../../utils/toast";
import { DamageSeverity } from "../../constants/DamageSeverity";
import { formatDateTime } from "../../utils/formatters";

interface DamageRecordItemProps {
  damage: DamageRecord;
  plans: RestorationPlan[];
  onChanged: () => Promise<void>;
}

export function DamageRecordItem({ damage, plans, onChanged }: DamageRecordItemProps) {
  const [planOpen, setPlanOpen] = useState(false);
  const [correctOpen, setCorrectOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [planForm, setPlanForm] = useState({ plan_title: "", method: "", risk_assessment: "" });
  const [correctForm, setCorrectForm] = useState({
    damage_type: damage.damage_type,
    position_desc: damage.position_desc,
    severity: damage.severity,
    correct_reason: ""
  });

  const linkedPlans = plans.filter((plan) => plan.damage_record_id === damage.id);
  const openPlan = linkedPlans.find((plan) => plan.approval_status === "DRAFT" || plan.approval_status === "SUBMITTED");
  // 病害登记后才能编方案；同一病害存在任何方案（含已结束/已更正）时改走"方案更正"。
  const canCreatePlan =
    linkedPlans.length === 0 && damage.status === "REGISTERED";

  const createPlan = async () => {
    if (!planForm.plan_title.trim() || !planForm.method.trim() || !planForm.risk_assessment.trim()) {
      toast.error("请完整填写方案标题、修复方法和风险评估");
      return;
    }
    setSaving(true);
    try {
      await createRestorationPlan({ damage_record_id: damage.id, ...planForm });
      toast.success(`已按 ${damage.damage_no} 编制方案`);
      setPlanOpen(false);
      setPlanForm({ plan_title: "", method: "", risk_assessment: "" });
      await onChanged();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "方案编制失败");
    } finally {
      setSaving(false);
    }
  };

  const submitCorrect = async () => {
    setSaving(true);
    try {
      await correctDamage(damage.id, { ...correctForm, correct_reason: correctForm.correct_reason.trim() || undefined });
      toast.success("病害已更正，原方案链保留旧档并标记受影响");
      setCorrectOpen(false);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "病害更正失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className={"panel damage-item " + (damage.affected ? "is-affected" : "")}>
      <div className="panel-head">
        <div>
          <h3>
            {damage.damage_type}
            <span className="plan-no">（{damage.damage_no} · R{damage.revision_no}）</span>
          </h3>
          <small className="muted">发现人：{damage.discovered_by} · {formatDateTime(damage.discovered_at)}</small>
        </div>
        <span className="row-gap">
          <AffectedTag affected={damage.affected} />
          <SeverityBadge value={damage.severity} />
          <StatusBadge value={damage.status} group="DamageStatus" />
        </span>
      </div>
      <p className="damage-position">{damage.position_desc}</p>
      <p className="muted meta-line">关联方案：{linkedPlans.length ? linkedPlans.map((plan) => plan.plan_no).join("、") : "尚未编制"}</p>

      <div className="action-row">
        <Rbac roles={["RESTORER"]}>
          {canCreatePlan && (
            <ActionButton tone="primary" size="small" onClick={() => setPlanOpen(true)}>编制修复方案</ActionButton>
          )}
          {openPlan && (
            <span className="flow-hint inline">已有{openPlan.approval_status === "SUBMITTED" ? "审批中" : "草稿"}方案 {openPlan.plan_no}</span>
          )}
          {damage.status !== "CLOSED" && damage.status !== "SUPERSEDED" && (
            <ActionButton size="small" onClick={() => setCorrectOpen(true)}>病害更正</ActionButton>
          )}
        </Rbac>
      </div>

      <Modal
        open={planOpen}
        title={`编制修复方案 · 沿用病害 ${damage.damage_no}`}
        onClose={() => setPlanOpen(false)}
        footer={
          <>
            <ActionButton onClick={() => setPlanOpen(false)}>取消</ActionButton>
            <ActionButton tone="primary" disabled={saving} onClick={() => void createPlan()}>建立方案</ActionButton>
          </>
        }
      >
        <div className="form-stack">
          <Field label="方案标题" required>
            <input value={planForm.plan_title} onChange={(event) => setPlanForm({ ...planForm, plan_title: event.target.value })} />
          </Field>
          <Field label="修复方法" required>
            <textarea rows={3} value={planForm.method} onChange={(event) => setPlanForm({ ...planForm, method: event.target.value })} />
          </Field>
          <Field label="风险评估" required>
            <textarea rows={2} value={planForm.risk_assessment} onChange={(event) => setPlanForm({ ...planForm, risk_assessment: event.target.value })} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={correctOpen}
        title={`病害更正 · ${damage.damage_no}`}
        onClose={() => setCorrectOpen(false)}
        footer={
          <>
            <ActionButton onClick={() => setCorrectOpen(false)}>取消</ActionButton>
            <ActionButton tone="primary" disabled={saving} onClick={() => void submitCorrect()}>生成更正登记</ActionButton>
          </>
        }
      >
        <p className="flow-hint">更正后生成同编号 R{damage.revision_no + 1} 新记录；后续方案、步骤与影像保留旧档并标记受影响。</p>
        <div className="form-stack">
          <Field label="病害类型" required>
            <input value={correctForm.damage_type} onChange={(event) => setCorrectForm({ ...correctForm, damage_type: event.target.value })} />
          </Field>
          <Field label="位置描述" required>
            <textarea rows={2} value={correctForm.position_desc} onChange={(event) => setCorrectForm({ ...correctForm, position_desc: event.target.value })} />
          </Field>
          <Field label="严重程度" required>
            <select value={correctForm.severity} onChange={(event) => setCorrectForm({ ...correctForm, severity: event.target.value })}>
              {DamageSeverity.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="更正原因">
            <input value={correctForm.correct_reason} onChange={(event) => setCorrectForm({ ...correctForm, correct_reason: event.target.value })} />
          </Field>
        </div>
      </Modal>
    </article>
  );
}
