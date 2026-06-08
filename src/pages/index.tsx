import { useEffect } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, []);

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
      {user ? <DashboardPage /> : <LoginPage />}
    </>
  );
}