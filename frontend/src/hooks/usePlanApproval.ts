import { useState } from "react";
import { approvePlan, rejectPlan, submitPlan, type RestorationPlanPayload } from "../api/RestorationPlan";
import type { RestorationPlan } from "../types/RestorationPlan";
import { ApiError } from "../api/client";
import { toast } from "../utils/toast";

/**
 * 方案审批动作：提交 / 通过 / 退回 / 退回后重新提交。
 * 并发由后端串行锁裁决，后到者收到 409 时明确提示"已被处理"。
 */
export function usePlanApproval(onChanged: () => Promise<void> | void) {
  const [busyId, setBusyId] = useState<number | null>(null);

  const run = async (id: number, action: () => Promise<RestorationPlan>, successText: string) => {
    setBusyId(id);
    try {
      await action();
      toast.success(successText);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "操作失败，请稍后再试");
    } finally {
      setBusyId(null);
    }
  };

  return {
    busyId,
    submit: (id: number) => run(id, () => submitPlan(id), "方案已提交专家审批"),
    approve: (id: number) => run(id, () => approvePlan(id), "审批通过，可以拆解修复步骤"),
    reject: (id: number, comment: string) =>
      run(id, () => rejectPlan(id, comment || "未填写退回意见"), "方案已退回编制人"),
    resubmit: (_id: number, _payload: RestorationPlanPayload) => undefined
  };
}
