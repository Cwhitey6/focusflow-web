/**
 * appStore.ts
 *
 * Global store for app navigation and project list state
 * Tracks which view is active in the sidebar and which project is selected
 * Also holds the full list of projects so the sidebar and pages share the same data
 * All project mutations update the list in place so the sidebar stays in sync
 */

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
  activeView: 'my-day',    // default landing view after login
  activeProjectId: null,   // null means no project is selected
  projects: [],            // populated by DashboardPage on mount

  // switching views always clears the active project
  setActiveView: (view) => set({ activeView: view, activeProjectId: null }),

  // switching to a project sets the view to project and stores the id
  setActiveProject: (id) => set({ activeView: 'project', activeProjectId: id }),

  // replaces the full project list used on initial load
  setProjects: (projects) => set({ projects }),

  // appends a newly created project to the end of the list
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  // updates the name color and icon of a specific project in place
  updateProject: (id, name, color, icon) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, name, color, icon } : p
      ),
    })),

  // removes the project and navigates away if it was currently active
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
      activeView: state.activeProjectId === id ? 'my-day' : state.activeView,
    })),
}));