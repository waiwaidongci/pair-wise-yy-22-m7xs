import type { Actor } from "../models/Actor";

/** 本地演示账号：前端登录切换后通过 x-user-id 透传，无第三方身份服务。 */
export const DEMO_USERS: Actor[] = [
  { id: 1, name: "林砚之", role: "RESTORER" },
  { id: 2, name: "周慎", role: "EXPERT" },
  { id: 3, name: "吴归", role: "ARCHIVIST" },
  { id: 4, name: "访客", role: "VISITOR" }
];

export const findUserById = (id: number): Actor | undefined =>
  DEMO_USERS.find((user) => user.id === id);
