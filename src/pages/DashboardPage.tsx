/**
 * DashboardPage.tsx
 *
 * Main app shell that renders after the user logs in
 * Contains the sidebar on the left and the active page content on the right
 * Decides which page to show based on the active view in the app store
 * Search takes priority over everything and overlays the current page
 * The pt-12 top padding on mobile accounts for the fixed top bar
 */

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Project } from '../types';
import { api } from '../lib/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import InboxPage from './InboxPage';
import ProjectPage from './ProjectPage';
import { useSearchStore } from '../store/searchStore';
import SearchPage from './SearchPage';
import MyDayPage from './MyDayPage';
import SettingsPage from './SettingsPage';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { activeView, activeProjectId, setProjects } = useAppStore();
  const isSearching = useSearchStore((state) => state.isSearching);

  // wrapped in useCallback so it can be safely listed as a useEffect dependency
  const loadProjects = useCallback(async () => {
    try {
      const res = await api.projects.get();
      if (res.success && res.data) {
        setProjects(res.data as Project[]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }, [setProjects]);

  // load projects once when the user session is available
  useEffect(() => {
    if (!user) return;
    loadProjects();
  }, [user, loadProjects]);

  // returns the correct page component based on what is active in the sidebar
  const renderContent = () => {
    if (isSearching) return <SearchPage />;                          // search overlays everything
    if (activeView === 'settings') return <SettingsPage />;
    if (activeView === 'inbox') return <InboxPage />;
    if (activeView === 'project' && activeProjectId) {
      return <ProjectPage projectId={activeProjectId} />;
    }
    return <MyDayPage />;                                            // default landing view
  };

  return (
    <div className="flex h-screen bg-surface-base font-sans overflow-hidden">
      <Sidebar />

      {/* right side contains the top bar and the scrollable page content */}
      <div className="flex flex-col flex-1 min-w-0 pt-12 md:pt-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}