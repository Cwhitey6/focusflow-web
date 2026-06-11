/**
 * authStore.ts
 *
 * Global store for the logged in user and session state
 * isLoading stays true until checkSession resolves so the app
 * can show a spinner instead of flashing the wrong screen on load
 * The session is stored in an HTTP only cookie managed by the server
 * so we just ask the API if we have a valid session on startup
 */

import { create } from 'zustand';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;                  // true while the initial session check is running
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // start as true so the spinner shows before the session check resolves

  // stores the user object after a successful login or registration
  login: (user: User) => set({ user }),

  // calls the logout API to clear the cookie then removes the user from state
  logout: async () => {
    await api.auth.logout();
    set({ user: null });
  },

  // manual loading setter used in edge cases
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // checks for an existing session cookie on app load
  // skips the check on the server since cookies are only available in the browser
  checkSession: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await api.auth.me();
      if (res.success && res.data) {
        set({ user: res.data as User }); // restore the session without asking the user to log in again
      }
    } catch {
      // no valid session cookie found - user will see the login screen
    } finally {
      set({ isLoading: false });
    }
  },
}));