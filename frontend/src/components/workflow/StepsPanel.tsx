import { useState } from "react";
import type { RestorationPlan } from "../../types/RestorationPlan";
import type { RestorationStep } from "../../types/RestorationStep";
import { StepList } from "../common/StepList";
import { Field } from "../common/Field";
import { ActionButton } from "../common/ActionButton";
import { Modal } from "../common/Modal";
import { Rbac } from "../common/Rbac";
import { createStep, completeStep } from "../../api/RestorationStep";
import { ApiError } from "../../api/client";
import { toast } from "../../utils/toast";

interface StepsPanelProps {
  plan: RestorationPlan;
  steps: RestorationStep[];
  onChanged: () => Promise<void>;
}

export function StepsPanel({ plan, steps, onChanged }: StepsPanelProps) {
  const [technique, setTechnique] = useState("");
  const [adding, setAdding] = useState(false);
  const [completing, setCompleting] = useState<RestorationStep | null>(null);
  const [material, setMaterial] = useState("");
  const [saving, setSaving] = useState(false);

  const planSteps = steps.filter((step) => step.plan_id === plan.id);
  const allDone = planSteps.length > 0 && planSteps.every((step) => step.step_status === "COMPLETED");

  const addStep = async () => {
    if (!technique.trim()) return;
    setSaving(true);
    try {
      await createStep(plan.id, technique.trim());
      toast.success(`已拆解第 ${planSteps.length + 1} 步`);
      setTechnique("");
      await onChanged();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "步骤拆解失败");
    } finally {
      setSaving(false);
    }
  };

  const finishStep = async () => {
    if (!completing || !material.trim()) return;
    setSaving(true);
    try {
      await completeStep(completing.id, material.trim());
      toast.success("步骤完成，材料与操作人已记录");
      setCompleting(null);
      setMaterial("");
      await onChanged();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "步骤提交失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel workflow-panel">
      <div className="panel-head">
        <h3>修复步骤（{planSteps.filter((step) => step.step_status === "COMPLETED").length}/{planSteps.length} 完成）</h3>
        <Rbac roles={["RESTORER"]}>
          {!plan.affected && (
            <ActionButton tone="primary" size="small" onClick={() => setAdding(true)}>
              拆解下一步
            </ActionButton>
          )}
        </Rbac>
      </div>
      <StepList steps={planSteps} onComplete={(step) => setCompleting(step)} completingId={completing?.id ?? null} />
      {allDone && <p className="flow-hint success">全部步骤已完成，可上传修复后影像并归档。</p>}

      <Modal
        open={adding}
        title={`拆解第 ${planSteps.length + 1} 步 · ${plan.plan_no}`}
        onClose={() => setAdding(false)}
        footer={
          <>
            <ActionButton onClick={() => setAdding(false)}>取消</ActionButton>
            <ActionButton tone="primary" disabled={saving || !technique.trim()} onClick={addStep}>保存步骤</ActionButton>
          </>
        }
      >
        <Field label="工艺做法" required hint="例如：断面清理、粘合加压、随色补釉">
          <textarea value={technique} rows={3} onChange={(event) => setTechnique(event.target.value)} placeholder="描述该步骤的修复工艺" />
        </Field>
      </Modal>

      <Modal
        open={!!completing}
        title={`完成第 ${completing?.step_order} 步：${completing?.technique ?? ""}`}
        onClose={() => setCompleting(null)}
        footer={
          <>
            <ActionButton onClick={() => setCompleting(null)}>取消</ActionButton>
            <ActionButton tone="primary" disabled={saving || !material.trim()} onClick={finishStep}>
              {saving ? "提交中…" : "确认完成"}
            </ActionButton>
          </>
        }
      >
        <Field label="实际使用材料" required hint="提交后材料、操作人和完成时间将固定记入档案">
          <textarea value={material} rows={3} onChange={(event) => setMaterial(event.target.value)} placeholder="例如：无水乙醇、环氧树脂、夹具" />
        </Field>
      </Modal>
    </section>
  );
}
