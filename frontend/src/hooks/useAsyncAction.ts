import { useCallback, useState } from "react";
import { ApiError } from "../api/client";

/**
 * 通用动作 hook：统一处理加载态与 ApiError。
 * 并发冲突（ALREADY_PROCESSED / PLAN_CONTENT_CHANGED / FLOW_CONFLICT）等错误
 * 由页面据此展示 message.error 并刷新档案。
 */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<{ ok: boolean; data?: T; error?: ApiError }> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fn();
      return { ok: true, data };
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, null);
      setError(apiError);
      return { ok: false, error: apiError };
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error };
}
