import { useCallback, useState } from "react";
import { reviewPlan, submitPlan, type PlanReviewPayload } from "../api/RestorationPlan";
import { ApiError } from "../api/client";

/**
 * 方案审批动作 hook：
 * - 提交审批 / 通过 / 驳回；
 * - 审批时携带进入页面时的 expected_version，两人同时审批时，
 *   后到者收到 ALREADY_PROCESSED，由调用方提示“已被处理”并刷新。
 */
export function usePlanApproval() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const act = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setSubmitting(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(500, null));
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const submit = useCallback(
    (planId: number) => act(() => submitPlan(planId)),
    [act]
  );

  const review = useCallback(
    (planId: number, payload: PlanReviewPayload) => act(() => reviewPlan(planId, payload)),
    [act]
  );

  return { submit, review, submitting, error };
}
