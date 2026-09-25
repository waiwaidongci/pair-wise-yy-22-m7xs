import type { UserRole } from "../constants/UserRole";

/** authMiddleware 解析出的当前操作人，挂在 req.user 上 */
export interface AuthUser {
  id: number;
  name: string;
  role: UserRole | string;
}
