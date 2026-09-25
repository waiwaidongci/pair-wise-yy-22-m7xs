import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DIRECTORY_USERS } from "../types/UserRole";
import type { SessionUser } from "../types/SessionUser";
import { setCurrentUserId } from "../api/client";

interface SessionState {
  user: SessionUser;
  switchUser: (id: number) => void;
}

const defaultUser: SessionUser = DIRECTORY_USERS[0];
setCurrentUserId(defaultUser.id);

/** 当前操作人会话：切换后请求头 x-user-id 改变，后端 RBAC 随之生效 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: defaultUser,
      switchUser: (id) => {
        const next = DIRECTORY_USERS.find((item) => item.id === id) ?? defaultUser;
        setCurrentUserId(next.id);
        set({ user: next });
      }
    }),
    {
      name: "relic-restore-session",
      onRehydrateStorage: () => (state) => {
        if (state) setCurrentUserId(state.user.id);
      }
    }
  )
);
