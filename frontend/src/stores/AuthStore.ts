import { create } from "zustand";
import { DEMO_USERS } from "../constants/demoUsers";
import type { Actor } from "../types/Actor";

interface AuthState {
  user: Actor;
  switchUser: (id: number) => void;
}

const STORAGE_KEY = "relic-restore-user-id";
const initialId = Number(localStorage.getItem(STORAGE_KEY)) || 1;
const initialUser = DEMO_USERS.find((item) => item.id === initialId) ?? DEMO_USERS[0];

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  switchUser: (id) => {
    const user = DEMO_USERS.find((item) => item.id === id) ?? DEMO_USERS[0];
    localStorage.setItem(STORAGE_KEY, String(user.id));
    set({ user });
  }
}));
