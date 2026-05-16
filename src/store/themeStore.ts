    // themeStore.ts — Manages dark/light mode.
// Persists the preference in localStorage and applies
// the 'dark' class to the <html> element.

import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_KEY = 'focusflow_theme';

// Apply theme to DOM immediately
function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
  }
}

// Load saved theme or default to dark
function loadTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY) as Theme;
  return saved === 'light' ? 'light' : 'dark';
}

// Apply on startup
applyTheme(loadTheme());

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: loadTheme(),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },

  setTheme: (theme: Theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
}));