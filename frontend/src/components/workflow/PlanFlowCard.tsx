import { useState } from "react";
import { Popconfirm } from "antd";
import type { PlanDossier } from "../../types/Dossier";
import type { ImageUploadPayload } from "../../api/ImageVersion";
import type { StepCreatePayload } from "../../api/RestorationStep";
import type { RestorationStep } from "../../types/RestorationStep";
import { StatusBadge } from "../common/StatusBadge";
import { AffectedTag, AffectedBanner } from "../common/AffectedTag";
import { FlowButton } from "../common/FlowButton";
import { PlanFormModal } from "../common/PlanFormModal";
import { PlanReviewModal } from "../common/PlanReviewModal";
import { StepFormModal } from "../common/StepFormModal";
import { ImageUploadModal } from "../common/ImageUploadModal";
import { ImageCompare } from "../common/ImageCompare";
import { ApprovalTimeline } from "../common/ApprovalTimeline";
import { useRestorationPlanStore } from "../../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../../stores/RestorationStepStore";
import { useImageVersionStore } from "../../stores/ImageVersionStore";
import { usePermissions } from "../../hooks/usePermissions";
import { notifyAction } from "../../utils/notifyAction";
import { formatDate } from "../../utils/formatters";

interface Props {
  plan: PlanDossier;
  onChanged: () => Promise<void>;
}

type ModalKind = null | "edit" | "correct" | "review" | "step" | "image";

/** 方案流程卡：编制→提交→审批→拆步骤→步骤完成→前后影像→归档；更正则旧档标受影响 */
export function PlanFlowCard({ plan, onChanged }: Props) {
  const { isRestorer, isExpert, isArchivist } = usePermissions();
  const planStore = useRestorationPlanStore();
  const stepStore = useRestorationStepStore();
  const imageStore = useImageVersionStore();
  const [modal, setModal] = useState<ModalKind>(null);
  const [imageType, setImageType] = useState<"BEFORE" | "AFTER">("BEFORE");
  const [finishTarget, setFinishTarget] = useState<RestorationStep | null>(null);

  const status = plan.approval_status;
  const affected = plan.affected;
  const total = plan.steps.length;
  const finished = plan.steps.filter((step) => step.step_status === "FINISHED").length;
  const allFinished = total > 0 && finished === total;

  const refresh = async () => {
    await onChanged();
  };

  // 动作门控（含禁用原因）
  const editReason = affected
    ? "受影响旧档不可修改，请在修订版上操作"
    : !isRestorer
    ? "仅修复师可编辑方案"
    : status === "APPROVED" || status === "ARCHIVED"
    ? "已通过/归档方案不能直接修改，请使用“更正”"
    : null;
  const submitReason =
    affected || !isRestorer
      ? affected
        ? "受影响旧档不可操作"
        : "仅修复师可提交方案"
      : status !== "DRAFT" && status !== "REJECTED"
      ? "只有草稿或被驳回的方案可提交"
      : null;
  const reviewReason = !isExpert
    ? "仅专家可审批"
    : status !== "SUBMITTED"
    ? status === "DRAFT"
      ? "方案尚未提交"
      : `方案当前为「${status}」，已被处理`
    : null;
  const breakReason = !isRestorer
    ? "仅修复师可拆步骤"
    : !plan.can_break_steps
    ? "方案审批通过后才能拆步骤"
    : affected
    ? "受影响旧档不可操作"
    : null;
  const imageReason = !isRestorer
    ? "仅修复师可上传影像"
    : status !== "APPROVED"
    ? "方案通过后才能上传影像"
    : affected
    ? "受影响旧档不可操作"
    : null;
  const archiveReason = !isArchivist
    ? "仅档案员可执行归档"
    : !plan.archive_ready
    ? "需全部步骤完成且修复前、修复后影像齐全"
    : null;

  const handleEdit = async (values: { plan_title?: string; method?: string; risk_assessment?: string; corrected_reason?: string }) => {
    const result = await notifyAction(
      () => planStore.update(plan.id, values),
      status === "SUBMITTED" ? "内容已修改，方案退回草稿，请重新提交" : "方案内容已保存"
    );
    if (result.ok) {
      setModal(null);
      await refresh();
    }
  };

  const handleCorrect = async (values: { plan_title?: string; method?: string; risk_assessment?: string; corrected_reason?: string }) => {
    const result = await notifyAction(
      () => planStore.correct(plan.id, values as { corrected_reason: string }),
      "已生成修订方案，原方案及步骤/影像保留并标记受影响"
    );
    if (result.ok) {
      setModal(null);
      await refresh();
    }
  };

  const handleSubmit = async () => {
    const result = await notifyAction(() => planStore.submit(plan.id), "方案已提交，等待专家审批");
    if (result.ok) await refresh();
  };

  const handleReview = async (values: { approved: boolean; comment?: string }) => {
    const result = await notifyAction(
      () => planStore.review(plan.id, { ...values, expected_version: plan.version }),
      values.approved ? "审批通过，可拆解修复步骤" : "已驳回方案"
    );
    if (result.ok) {
      setModal(null);
      await refresh();
    } else if (result.error?.code === "PLAN_CONTENT_CHANGED") {
      setModal(null);
      await refresh();
    }
  };

  const handleCreateStep = async (values: StepCreatePayload) => {
    const result = await notifyAction(() => stepStore.create(plan.id, values), "步骤已拆解");
    if (result.ok) {
      setModal(null);
      await refresh();
    }
  };

  const handleFinishStep = async (values: { material_used: string }) => {
    if (!finishTarget) return;
    const result = await notifyAction(
      () => stepStore.finish(finishTarget.id, { material_used: values.material_used, expected_version: finishTarget.version }),
      "步骤已完成，材料/操作人/完成时间已记录"
    );
    if (result.ok) {
      setFinishTarget(null);
      await refresh();
    }
  };

  const handleUpload = async (values: ImageUploadPayload) => {
    const result = await notifyAction(() => imageStore.upload(plan.id, values), "影像已上传");
    if (result.ok) {
      setModal(null);
      await refresh();
    }
  };

  const handleArchive = async () => {
    const result = await notifyAction(() => planStore.archive(plan.id), "全部步骤完成、前后影像齐全，方案已归档");
    if (result.ok) await refresh();
  };

  return (
    <article className={"flow-card" + (affected ? " is-affected" : "")}>
      <div className="flow-head">
        <div>
          <span className="no">{plan.plan_no} · 修订 R{plan.plan_revision} · 病害 {plan.damage_no}</span>
          {plan.revised_from_id ? <span className="meta-line" style={{ display: "inline", marginLeft: 8 }}>（更正自 #{plan.revised_from_id}）</span> : null}
          <h3 style={{ marginTop: 4 }}>{plan.plan_title}</h3>
        </div>
        <div className="flow-actions">
          <StatusBadge value={status} />
          {affected ? <AffectedTag /> : null}
        </div>
      </div>

      {affected && plan.affected_reason ? <AffectedBanner reason={plan.affected_reason} /> : null}
      {status === "DRAFT" && plan.review_comment ? (
        <div className="affected-banner" style={{ background: "#fdf6e9", borderColor: "#e5c88a", color: "#8a6410" }}>
          {plan.review_comment}
        </div>
      ) : null}

      <dl className="kv">
        <dt>编制人</dt><dd>{plan.author}（{formatDate(plan.created_at)}）</dd>
        <dt>修复方法</dt><dd style={{ whiteSpace: "pre-wrap" }}>{plan.method}</dd>
        <dt>风险评估</dt><dd style={{ whiteSpace: "pre-wrap" }}>{plan.risk_assessment}</dd>
        <dt>审批信息</dt>
        <dd>
          {plan.reviewer ? `${plan.reviewer} · ${formatDate(plan.reviewed_at)}${plan.review_comment ? `（${plan.review_comment}）` : ""}` : "—"}
        </dd>
      </dl>

      <div className="flow-actions">
        <FlowButton onClick={() => setModal("edit")} disabledReason={editReason}>修改内容</FlowButton>
        {isRestorer && (status === "APPROVED" || status === "ARCHIVED") && !affected ? (
          <FlowButton onClick={() => setModal("correct")}>更正方案</FlowButton>
        ) : null}
        <FlowButton type="primary" onClick={handleSubmit} disabledReason={submitReason}>提交审批</FlowButton>
        <FlowButton type="primary" ghost onClick={() => setModal("review")} disabledReason={reviewReason}>专家审批</FlowButton>
        <FlowButton onClick={() => setModal("step")} disabledReason={breakReason}>拆步骤</FlowButton>
        <FlowButton
          onClick={() => {
            setImageType("BEFORE");
            setModal("image");
          }}
          disabledReason={imageReason}
        >
          传修复前影像
        </FlowButton>
        <FlowButton
          onClick={() => {
            setImageType("AFTER");
            setModal("image");
          }}
          disabledReason={
            imageReason ?? (allFinished ? null : "全部步骤完成后才能上传修复后影像")
          }
        >
          传修复后影像
        </FlowButton>
        <Popconfirm
          title="确认归档该方案？"
          description="归档后方案不可再改，影像一并归档，病害关闭。"
          onConfirm={handleArchive}
          disabled={archiveReason !== null}
        >
          <FlowButton type="primary" danger disabledReason={archiveReason}>归档</FlowButton>
        </Popconfirm>
      </div>

      <div>
        <h3>修复步骤（{finished}/{total} 完成）</h3>
        {total === 0 ? (
          <p className="meta-line">方案通过后拆解步骤；步骤记录材料，完成时记录操作人与完成时间。</p>
        ) : (
          <table className="steps-table">
            <thead>
              <tr><th style={{ width: 48 }}>序</th><th>工序</th><th>材料</th><th>操作人/完成时间</th><th style={{ width: 110 }}>状态</th><th style={{ width: 100 }}></th></tr>
            </thead>
            <tbody>
              {plan.steps.map((step) => (
                <tr key={step.id}>
                  <td>{step.step_order}</td>
                  <td>{step.technique}{step.affected ? <AffectedTag /> : null}</td>
                  <td>{step.material_used}</td>
                  <td>
                    {step.step_status === "FINISHED"
                      ? `${step.operator} · ${formatDate(step.finished_at)}`
                      : "待完成"}
                  </td>
                  <td><StatusBadge value={step.step_status} /></td>
                  <td>
                    {step.step_status === "PENDING" && !affected && isRestorer ? (
                      <FlowButton size="small" type="link" onClick={() => setFinishTarget(step)}>
                        完成
                      </FlowButton>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {total > 0 && plan.steps.some((s) => s.step_status === "PENDING") && isRestorer && !affected ? (
          <p className="meta-line" style={{ marginTop: 6 }}>
            提示：两位修复师同时点击「完成」时先到者生效，后到者会看到该步骤已被处理。
          </p>
        ) : null}
      </div>

      <div>
        <h3>修复前后影像</h3>
        <ImageCompare images={plan.images} />
      </div>

      <ApprovalTimeline plan={plan} />

      {modal === "edit" ? (
        <PlanFormModal
          mode="edit"
          planId={plan.id}
          initial={{ plan_title: plan.plan_title, method: plan.method, risk_assessment: plan.risk_assessment }}
          open
          onCancel={() => setModal(null)}
          onSubmit={handleEdit as never}
        />
      ) : null}
      {modal === "correct" ? (
        <PlanFormModal
          mode="correct"
          planId={plan.id}
          initial={{ plan_title: plan.plan_title, method: plan.method, risk_assessment: plan.risk_assessment }}
          open
          onCancel={() => setModal(null)}
          onSubmit={handleCorrect as never}
        />
      ) : null}
      {modal === "review" ? (
        <PlanReviewModal open planNo={plan.plan_no} onCancel={() => setModal(null)} onSubmit={handleReview} />
      ) : null}
      {modal === "step" ? (
        <StepFormModal mode="create" open planNo={plan.plan_no} onCancel={() => setModal(null)} onSubmit={handleCreateStep} />
      ) : null}
      {modal === "image" ? (
        <ImageUploadModal
          open
          planNo={plan.plan_no}
          afterAllowed={allFinished}
          defaultType={imageType}
          onCancel={() => setModal(null)}
          onSubmit={handleUpload}
        />
      ) : null}
      {finishTarget ? (
        <StepFormModal
          mode="finish"
          open
          stepOrder={finishTarget.step_order}
          initialMaterial={finishTarget.material_used}
          onCancel={() => setFinishTarget(null)}
          onSubmit={handleFinishStep}
        />
      ) : null}
    </article>
  );
}
