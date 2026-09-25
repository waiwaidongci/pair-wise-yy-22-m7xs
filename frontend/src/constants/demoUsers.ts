import type { Actor } from "../types/Actor";

/** 与后端 DEMO_USERS 保持一致，本地选择身份后以 x-user-id 透传。 */
export const DEMO_USERS: Actor[] = [
  { id: 1, name: "林砚之", role: "RESTORER" },
  { id: 2, name: "周慎", role: "EXPERT" },
  { id: 3, name: "吴归", role: "ARCHIVIST" },
  { id: 4, name: "访客", role: "VISITOR" }
];
