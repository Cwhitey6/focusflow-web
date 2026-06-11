/**
 * _app.tsx
 *
 * Root Next.js app wrapper that wraps every page
 * Imports global styles including Tailwind so they apply everywhere
 * Calls initTheme on mount to restore the saved dark/light preference
 */

import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { initTheme } from '../store/themeStore';

export default function App({ Component, pageProps }: AppProps) {
  // restore the saved theme from localStorage on first load
  useEffect(() => {
    initTheme();
  }, []);

  return <Component {...pageProps} />;
}