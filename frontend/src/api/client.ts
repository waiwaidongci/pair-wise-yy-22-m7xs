import type { ApiErrorBody } from "../types/Dossier";

/** 业务异常：与后端 errorCodes/errorMessages 对应，页面据此提示“已被处理/退回/冲突” */
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? `请求失败（${status}）`);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code ?? "INTERNAL_ERROR";
  }
}

/** 当前操作人 id，由 sessionStore 设置；后端本地演示通过 x-user-id 识别角色 */
let currentUserId: number = 1;

export const setCurrentUserId = (id: number) => {
  currentUserId = id;
};

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": String(currentUserId)
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    throw new ApiError(res.status, body);
  }
  return (await res.json()) as T;
}
