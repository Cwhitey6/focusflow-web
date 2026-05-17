import { create } from 'zustand';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: (user: User) => set({ user }),

  logout: async () => {
    await api.auth.logout();
    set({ user: null });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  checkSession: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await api.auth.me();
      if (res.success && res.data) {
        set({ user: res.data as User });
      }
    } catch {
      // no session
    } finally {
      set({ isLoading: false });
    }
  },
}));