import { create } from 'zustand';
import { Project } from '../types';

type ActiveView = 'inbox' | 'my-day' | 'project' | 'settings';

interface AppState {
  activeView: ActiveView;
  activeProjectId: string | null;
  projects: Project[];
  setActiveView: (view: ActiveView) => void;
  setActiveProject: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, name: string, color: string, icon: string) => void;
  removeProject: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeView: 'my-day',
  activeProjectId: null,
  projects: [],

  setActiveView: (view) => set({ activeView: view, activeProjectId: null }),

  setActiveProject: (id) => set({ activeView: 'project', activeProjectId: id }),

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, name, color, icon) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, name, color, icon } : p
      ),
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
      activeView: state.activeProjectId === id ? 'my-day' : state.activeView,
    })),
}));