import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Safe localStorage helper — won't crash on server
function getStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function setStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

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

function loadTheme(): Theme {
  const saved = getStorage('focusflow_theme');
  return saved === 'light' ? 'light' : 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    setStorage('focusflow_theme', next);
    applyTheme(next);
    set({ theme: next });
  },

  setTheme: (theme: Theme) => {
    setStorage('focusflow_theme', theme);
    applyTheme(theme);
    set({ theme });
  },
}));

// Call this on the client side only
export function initTheme() {
  if (typeof window === 'undefined') return;
  const theme = loadTheme();
  applyTheme(theme);
  useThemeStore.setState({ theme });
}