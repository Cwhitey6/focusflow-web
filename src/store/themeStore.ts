/**
 * themeStore.ts
 *
 * Global store for the dark/light mode preference
 * The chosen theme is saved to localStorage so it persists across sessions
 * All localStorage and DOM access is guarded with typeof window checks
 * so the store is safe to import in server side rendered pages
 * Call initTheme() once on the client to restore the saved preference on load
 */

import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// safely reads from localStorage without crashing during SSR
function getStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

// safely writes to localStorage without crashing during SSR
function setStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

// adds or removes the dark/light class on the html element so Tailwind picks it up
function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
  }
}

// reads the saved theme from localStorage and defaults to dark if nothing is saved
function loadTheme(): Theme {
  const saved = getStorage('focusflow_theme');
  return saved === 'light' ? 'light' : 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark', // default before localStorage is read

  // flips between dark and light and saves the new value
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    setStorage('focusflow_theme', next);
    applyTheme(next);
    set({ theme: next });
  },

  // sets a specific theme directly used by initTheme on startup
  setTheme: (theme: Theme) => {
    setStorage('focusflow_theme', theme);
    applyTheme(theme);
    set({ theme });
  },
}));

// call once on the client after the page loads to restore the saved theme
// this prevents a flash of the wrong theme on first render
export function initTheme() {
  if (typeof window === 'undefined') return;
  const theme = loadTheme();
  applyTheme(theme);
  useThemeStore.setState({ theme });
}