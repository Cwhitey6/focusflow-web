/**
 * Sidebar.tsx
 *
 * Left navigation panel for the app
 * On desktop it sits as a fixed column on the left side of the screen
 * On mobile it hides behind a hamburger button and slides in as a drawer
 * Contains nav links for My Day and Inbox plus the full project list
 * Projects can be created edited and deleted from here
 */

import { useState } from 'react';
import {
  Sun, Inbox, Plus, Settings,
  LogOut, ChevronDown, ChevronRight, Trash2, Pencil, Menu, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Project } from '../types';
import { api } from '../lib/api';
import NewProjectModal from './NewProjectModal';
import EditProjectModal from './EditProjectModal';

export default function Sidebar() {
  const [projectsExpanded, setProjectsExpanded] = useState(true); // controls the projects section collapse
  const [showNewProject, setShowNewProject] = useState(false);    // toggles the new project modal
  const [mobileOpen, setMobileOpen] = useState(false);            // toggles the mobile drawer

  const { user, logout } = useAuthStore();
  const { activeView, activeProjectId, projects, setActiveView, setActiveProject } = useAppStore();

  // returns true if the given view or project is the currently active one
  const isActive = (view: string, projectId?: string) => {
    if (projectId) return activeProjectId === projectId;
    return activeView === view && !activeProjectId;
  };

  // runs any nav action then closes the mobile drawer
  const handleNavClick = (fn: () => void) => {
    fn();
    setMobileOpen(false);
  };

  // the actual sidebar content shared between desktop and mobile drawer
  const sidebarContent = (
    <>
      {/* app logo and name at the top */}
      <div className="px-4 py-4 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <span className="text-white font-semibold text-sm">FocusFlow</span>
          </div>

          {/* close button only visible on mobile inside the drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-500 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* main navigation links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <NavItem
          icon={<Sun size={16} />}
          label="My Day"
          active={isActive('my-day')}
          onClick={() => handleNavClick(() => setActiveView('my-day'))}
        />
        <NavItem
          icon={<Inbox size={16} />}
          label="Inbox"
          active={isActive('inbox')}
          onClick={() => handleNavClick(() => setActiveView('inbox'))}
        />

        {/* projects section with a collapsible toggle */}
        <div className="pt-4">
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="w-full flex items-center justify-between px-2 py-1
                       text-xs font-semibold text-gray-500 uppercase tracking-wider
                       hover:text-gray-300 transition-colors rounded"
          >
            <span>Projects</span>
            {projectsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>

          {projectsExpanded && (
            <div className="mt-1 space-y-0.5">

              {/* filter out the inbox project since it has its own nav item above */}
              {projects
                .filter((p) => p.name !== 'Inbox')
                .map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    active={isActive('project', project.id)}
                    onClick={() => handleNavClick(() => setActiveProject(project.id))}
                  />
                ))}

              {/* button to open the new project modal */}
              <button
                onClick={() => {
                  setShowNewProject(true);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                           text-gray-500 hover:text-gray-300 hover:bg-surface-border
                           transition-colors text-sm"
              >
                <Plus size={14} />
                <span>New Project</span>
              </button>

            </div>
          )}
        </div>
      </nav>

      {/* settings link and user row pinned to the bottom */}
      <div className="px-2 py-3 border-t border-surface-border space-y-0.5">
        <NavItem
          icon={<Settings size={16} />}
          label="Settings"
          active={isActive('settings')}
          onClick={() => handleNavClick(() => setActiveView('settings'))}
        />

        {/* user row shows avatar and username with a hidden logout button on hover */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg
                        hover:bg-surface-border transition-colors group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 bg-brand rounded-full flex items-center
                            justify-center shrink-0">
              <span className="text-white text-xs font-semibold">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-300 truncate">{user?.username}</span>
          </div>

          {/* logout button only appears on hover */}
          <button
            onClick={logout}
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 text-gray-500
                       hover:text-red-400 transition-all"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* desktop sidebar - hidden on mobile */}
      <aside className="hidden md:flex w-60 min-w-60 h-screen bg-surface-raised
                        border-r border-surface-border flex-col select-none">
        {sidebarContent}
      </aside>

      {/* mobile top bar with hamburger button - hidden on desktop */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-12
                      bg-surface-raised border-b border-surface-border
                      flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-brand rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className="text-white font-semibold text-sm">FocusFlow</span>
        </div>
      </div>

      {/* mobile drawer overlay - only renders when open */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={(e) => e.target === e.currentTarget && setMobileOpen(false)}
        >
          {/* dark backdrop behind the drawer */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />

          {/* the drawer itself slides in from the left */}
          <aside className="relative w-72 h-full bg-surface-raised border-r
                            border-surface-border flex flex-col select-none
                            animate-slide-in-right z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* new project modal rendered outside the sidebar so it overlays everything */}
      {showNewProject && (
        <NewProjectModal onClose={() => setShowNewProject(false)} />
      )}
    </>
  );
}

// reusable nav button used for My Day Inbox and Settings
function NavItem({
  icon, label, active, onClick
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                  text-sm transition-colors duration-100 text-left
                  ${active
                    ? 'bg-brand/20 text-brand font-medium'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-border'
                  }`}
    >
      {icon}
      {label}
    </button>
  );
}

// individual project row with edit and delete actions that appear on hover
function ProjectItem({
  project, active, onClick
}: {
  project: Project;
  active: boolean;
  onClick: () => void;
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // two-click delete protection
  const [showEditModal, setShowEditModal] = useState(false);
  const removeProject = useAppStore((state) => state.removeProject);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent the project from being selected while deleting

    // first click arms the delete button then it auto resets after 3 seconds
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
      return;
    }

    // second click confirms and deletes
    try {
      await api.projects.delete(project.id);
      removeProject(project.id);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent the project from being selected while editing
    setShowEditModal(true);
  };

  return (
    <>
      <div className="group flex items-center gap-1">

        {/* project name button that navigates to the project */}
        <button
          onClick={onClick}
          className={`flex-1 flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                      text-sm transition-colors duration-100 text-left min-w-0
                      ${active
                        ? 'bg-brand/20 text-brand font-medium'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-surface-border'
                      }`}
        >
          {/* colored dot uses the projects chosen color */}
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <span className="truncate">{project.icon} {project.name}</span>
        </button>

        {/* edit button appears on hover */}
        <button
          onClick={handleEdit}
          title="Edit project"
          className="opacity-0 group-hover:opacity-100 shrink-0
                     text-gray-600 hover:text-brand transition-all p-1 rounded"
        >
          <Pencil size={11} />
        </button>

        {/* delete button appears on hover and turns red after the first click */}
        <button
          onClick={handleDelete}
          title={showConfirmDelete ? 'Click again to confirm' : 'Delete project'}
          className={`opacity-0 group-hover:opacity-100 shrink-0
                      text-xs p-1 rounded transition-all
                      ${showConfirmDelete
                        ? 'text-red-400 opacity-100 bg-red-400/10'
                        : 'text-gray-600 hover:text-red-400'
                      }`}
        >
          {showConfirmDelete ? '✓?' : <Trash2 size={11} />}
        </button>

      </div>

      {/* edit modal rendered inline so it can access the project data */}
      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}