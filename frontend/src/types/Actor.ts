import type { UserRole } from "../constants/UserRole";

export interface Actor {
  id: number;
  name: string;
  role: UserRole;
}
