import { useAuthStore } from "../stores/AuthStore";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export interface ApiErrorBody {
  code: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? ERROR_MESSAGES.INVALID_STATE);
    this.status = status;
    this.code = body?.code ?? "INVALID_STATE";
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const user = useAuthStore.getState().user;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (user) headers.set("x-user-id", String(user.id));
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
