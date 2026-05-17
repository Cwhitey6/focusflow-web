import { useEffect } from 'react';
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

  const loadProjects = async () => {
    try {
      const res = await api.projects.get();
      if (res.success && res.data) {
        setProjects(res.data as Project[]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadProjects();
  }, [user]);

  const renderContent = () => {
    if (isSearching) return <SearchPage />;
    if (activeView === 'settings') return <SettingsPage />;
    if (activeView === 'inbox') return <InboxPage />;
    if (activeView === 'project' && activeProjectId) {
      return <ProjectPage projectId={activeProjectId} />;
    }
    return <MyDayPage />;
  };

  return (
    <div className="flex h-screen bg-surface-base font-sans overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 pt-12 md:pt-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}