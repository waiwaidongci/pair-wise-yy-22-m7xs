import { useEffect, useState } from "react";
import type { RestorationPlan } from "../../types/RestorationPlan";
import { StatusBadge } from "../common/StatusBadge";
import { AffectedTag } from "../common/AffectedTag";
import { ActionButton } from "../common/ActionButton";
import { Field } from "../common/Field";
import { Modal } from "../common/Modal";
import { Rbac } from "../common/Rbac";
import { usePlanApproval } from "../../hooks/usePlanApproval";
import { useAuthStore } from "../../stores/AuthStore";
import { updateRestorationPlan, correctPlan } from "../../api/RestorationPlan";
import { ApiError } from "../../api/client";
import { toast } from "../../utils/toast";
import { formatDateTime } from "../../utils/formatters";

interface PlanWorkflowCardProps {
  plan: RestorationPlan;
  onChanged: () => Promise<void>;
}

export function PlanWorkflowCard({ plan, onChanged }: PlanWorkflowCardProps) {
  const approval = usePlanApproval(onChanged);
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [form, setForm] = useState({ plan_title: plan.plan_title, method: plan.method, risk_assessment: plan.risk_assessment });
  const [correctForm, setCorrectForm] = useState({ plan_title: plan.plan_title, method: plan.method, risk_assessment: plan.risk_assessment });

  useEffect(() => {
    setForm({ plan_title: plan.plan_title, method: plan.method, risk_assessment: plan.risk_assessment });
    setCorrectForm({ plan_title: plan.plan_title, method: plan.method, risk_assessment: plan.risk_assessment });
  }, [plan.plan_title, plan.method, plan.risk_assessment]);

  const isOwner = useOwnerFlag(plan.owner_id);
  const contentChangedWhileSubmitted =
    plan.approval_status === "SUBMITTED" &&
    plan.submitted_content_version !== null &&
    plan.submitted_content_version !== plan.content_version;

  const saveContent = async () => {
    if (!form.plan_title.trim() || !form.method.trim() || !form.risk_assessment.trim()) {
      toast.error("请完整填写标题、修复方法和风险评估");
      return;
    }
    setSaving(true);
    try {
      await updateRestorationPlan(plan.id, form);
      toast.success(plan.approval_status === "SUBMITTED" ? "内容已修改，方案退回编制人重新提交" : "方案内容已保存");
      setEditing(false);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const submitCorrect = async () => {
    setSaving(true);
    try {
      await correctPlan(plan.id, correctForm);
      toast.success("已按原病害编号生成更正方案，原方案及步骤影像保留旧档");
      setCorrecting(false);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "更正失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className={"panel plan-card " + (plan.affected ? "is-affected" : "")}>
      <div className="panel-head">
        <div>
          <h3>
            {plan.plan_title}
            <span className="plan-no">（{plan.plan_no} · R{plan.revision_no}）</span>
          </h3>
          <small className="muted">编制人：{plan.owner_name} · 沿用病害编号 {plan.damage_no}</small>
        </div>
        <span className="row-gap">
          <AffectedTag affected={plan.affected} />
          <StatusBadge value={plan.approval_status} group="PlanApprovalStatus" />
        </span>
      </div>

      <dl className="plan-body">
        <div><dt>修复方法</dt><dd>{plan.method}</dd></div>
        <div><dt>风险评估</dt><dd>{plan.risk_assessment}</dd></div>
      </dl>

      {plan.approval_status === "REJECTED" && plan.reject_reason && (
        <p className="flow-hint danger">专家退回意见：{plan.reject_reason}</p>
      )}
      {contentChangedWhileSubmitted && (
        <p className="flow-hint danger">方案内容在审批前被修改，已退回草稿，请重新提交。</p>
      )}
      <p className="muted meta-line">
        提交时间：{formatDateTime(plan.submitted_at)}
        {plan.approved_at ? ` · 审批专家：${plan.approved_by_name}（${formatDateTime(plan.approved_at)}）` : ""}
      </p>

      <div className="action-row">
        <Rbac roles={["RESTORER"]}>
          {isOwner && (plan.approval_status === "DRAFT" || plan.approval_status === "REJECTED") && (
            <>
              <ActionButton tone="primary" size="small" onClick={() => setEditing(true)}>修改内容</ActionButton>
              <ActionButton size="small" disabled={approval.busyId === plan.id} onClick={() => void approval.submit(plan.id)}>
                {plan.approval_status === "REJECTED" ? "修改后重新提交" : "提交审批"}
              </ActionButton>
            </>
          )}
          {isOwner && plan.approval_status === "SUBMITTED" && (
            <ActionButton size="small" onClick={() => setEditing(true)}>撤回修改（将退回草稿）</ActionButton>
          )}
          {plan.approval_status === "APPROVED" && !plan.affected && (
            <ActionButton size="small" onClick={() => setCorrecting(true)}>方案更正</ActionButton>
          )}
        </Rbac>
        <Rbac roles={["EXPERT"]}>
          {plan.approval_status === "SUBMITTED" && (
            <>
              <ActionButton
                tone="primary"
                size="small"
                disabled={approval.busyId === plan.id}
                onClick={() => void approval.approve(plan.id)}
              >
                审批通过
              </ActionButton>
              <ActionButton tone="danger" size="small" onClick={() => setRejecting(true)}>退回</ActionButton>
            </>
          )}
        </Rbac>
      </div>

      <Modal
        open={editing}
        title="修改方案内容"
        onClose={() => setEditing(false)}
        footer={
          <>
            <ActionButton onClick={() => setEditing(false)}>取消</ActionButton>
            <ActionButton tone="primary" disabled={saving} onClick={() => void saveContent()}>保存</ActionButton>
          </>
        }
      >
        <PlanForm form={form} setForm={setForm} />
        {plan.approval_status === "SUBMITTED" && (
          <p className="flow-hint danger">当前方案正在审批中，保存后会立即退回草稿，专家需重新审批。</p>
        )}
      </Modal>

      <Modal
        open={correcting}
        title="发起方案更正"
        onClose={() => setCorrecting(false)}
        footer={
          <>
            <ActionButton onClick={() => setCorrecting(false)}>取消</ActionButton>
            <ActionButton tone="primary" disabled={saving} onClick={() => void submitCorrect()}>生成更正方案</ActionButton>
          </>
        }
      >
        <p className="flow-hint">更正方案沿用 {plan.damage_no}，版本号递增；原方案、步骤与影像保留旧档并标记"受影响"。</p>
        <PlanForm form={correctForm} setForm={setCorrectForm} />
      </Modal>

      <Modal
        open={rejecting}
        title="退回方案"
        onClose={() => setRejecting(false)}
        footer={
          <>
            <ActionButton onClick={() => setRejecting(false)}>取消</ActionButton>
            <ActionButton
              tone="danger"
              disabled={approval.busyId === plan.id || !comment.trim()}
              onClick={async () => {
                await approval.reject(plan.id, comment.trim());
                setRejecting(false);
                setComment("");
              }}
            >
              确认退回
            </ActionButton>
          </>
        }
      >
        <Field label="退回意见" required>
          <textarea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="说明需要补充或调整的内容" />
        </Field>
      </Modal>
    </article>
  );
}

function useOwnerFlag(ownerId: number) {
  const userId = useAuthStore((state) => state.user.id);
  return userId === ownerId;
}

interface PlanFormState {
  plan_title: string;
  method: string;
  risk_assessment: string;
}

function PlanForm({ form, setForm }: { form: PlanFormState; setForm: (next: PlanFormState) => void }) {
  const patch = (key: keyof PlanFormState, value: string) => setForm({ ...form, [key]: value });
  return (
    <div className="form-stack">
      <Field label="方案标题" required>
        <input value={form.plan_title} onChange={(event) => patch("plan_title", event.target.value)} />
      </Field>
      <Field label="修复方法" required>
        <textarea rows={3} value={form.method} onChange={(event) => patch("method", event.target.value)} />
      </Field>
      <Field label="风险评估" required>
        <textarea rows={2} value={form.risk_assessment} onChange={(event) => patch("risk_assessment", event.target.value)} />
      </Field>
    </div>
  );
}
