import { message } from "antd";
import { ApiError } from "../api/client";

/**
 * 统一执行流程动作：成功提示、失败按错误码给出中文提示。
 * ALREADY_PROCESSED 表示并发中后到者，提示对方已先行处理并刷新。
 */
export async function notifyAction<T>(
  fn: () => Promise<T>,
  successText: string
): Promise<{ ok: boolean; data?: T; error?: ApiError }> {
  try {
    const data = await fn();
    message.success(successText);
    return { ok: true, data };
  } catch (err) {
    const error = err instanceof ApiError ? err : new ApiError(500, null);
    if (error.code === "ALREADY_PROCESSED") {
      message.warning("已被其他同事先行处理，页面已刷新为最新状态");
    } else if (error.code === "PLAN_CONTENT_CHANGED") {
      message.warning("方案内容在提交后被修改，已退回草稿，请重新提交");
    } else {
      message.error(error.message);
    }
    return { ok: false, error };
  }
}
