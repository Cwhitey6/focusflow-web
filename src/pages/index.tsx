/**
 * index.tsx
 *
 * App entry point that decides whether to show the login screen or the dashboard
 * On first load it checks for an existing session cookie via checkSession
 * While that check is running a centered spinner is shown to prevent a flash
 * of the wrong screen before the session status is known
 */

import { useEffect } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkSession = useAuthStore((state) => state.checkSession);

  // check for an existing session cookie when the app first loads
  useEffect(() => {
    async function check() {
      await checkSession();
    }
    check();
  }, [checkSession]);

  // show a spinner while the session check is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>FocusFlow</title>
      </Head>
      {/* show the dashboard if logged in otherwise show the login screen */}
      {user ? <DashboardPage /> : <LoginPage />}
    </>
  );
}