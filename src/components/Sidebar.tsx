/**
 * Sidebar.tsx
 *
 * Left navigation panel for the app
 * On desktop it sits as a fixed column on the left side of the screen
 * On mobile it hides behind a hamburger button and slides in as a drawer
 * Projects render as a nested tree - a project with children shows a toggle
 * Task count badges only appear on top level projects
 * Projects are draggable to reorder within the same level
 */

import { useState, useRef } from 'react';
import {
  Sun, Inbox, Plus, Settings,
  LogOut, ChevronDown, ChevronRight, Trash2, Pencil, Menu, X, FolderPlus
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Project } from '../types';
import { api } from '../lib/api';
import NewProjectModal from './NewProjectModal';
import EditProjectModal from './EditProjectModal';

export default function Sidebar() {
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectParentId, setNewProjectParentId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const { user, logout } = useAuthStore();
  const { activeView, activeProjectId, projects, setActiveView, setActiveProject, setProjects, taskCounts } = useAppStore();

  const isActive = (view: string, projectId?: string) => {
    if (projectId) return activeProjectId === projectId;
    return activeView === view && !activeProjectId;
  };

  const handleNavClick = (fn: () => void) => {
    fn();
    setMobileOpen(false);
  };

  // open the new project modal with an optional pre-selected parent
  const openNewProject = (parentId: string | null = null) => {
    setNewProjectParentId(parentId);
    setShowNewProject(true);
    setMobileOpen(false);
  };

  // get direct children of a given parent id
  const getChildren = (parentId: string | null) =>
    projects.filter((p) => p.parent_id === parentId && p.name !== 'Inbox');

  // reorder projects at the same level after a drag
  const handleDrop = async (targetId: string, parentId: string | null) => {
    if (!draggingId || draggingId === targetId) return;

    const siblings = getChildren(parentId);
    const from = siblings.findIndex((p) => p.id === draggingId);
    const to = siblings.findIndex((p) => p.id === targetId);
    if (from === -1 || to === -1) return;

    const reordered = [...siblings];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    const inbox = projects.find((p) => p.name === 'Inbox');
    const others = projects.filter((p) => p.parent_id !== parentId && p.name !== 'Inbox');
    const newList = inbox ? [inbox, ...others, ...reordered] : [...others, ...reordered];
    setProjects(newList);

    await api.projects.reorder(reordered.map((p) => p.id));

    setDraggingId(null);
    setDragOverId(null);
  };

  const sidebarContent = (
    <>
      {/* app logo */}
      <div className="px-4 py-4 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <span className="text-white font-semibold text-sm">FocusFlow</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-500 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* main nav links */}
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

        {/* projects tree */}
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
              {/* render top level projects recursively */}
              {getChildren(null).map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  depth={0}
                  active={isActive('project', project.id)}
                  taskCount={taskCounts[project.id] ?? null}
                  isDragging={draggingId === project.id}
                  isDragOver={dragOverId === project.id}
                  childProjects={getChildren(project.id)}
                  allProjects={projects}
                  taskCounts={taskCounts}
                  activeProjectId={activeProjectId}
                  onClick={() => handleNavClick(() => setActiveProject(project.id))}
                  onAddChild={() => openNewProject(project.id)}
                  onDragStart={() => setDraggingId(project.id)}
                  onDragOver={() => setDragOverId(project.id)}
                  onDrop={() => handleDrop(project.id, null)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                  onChildClick={(id) => handleNavClick(() => setActiveProject(id))}
                  draggingId={draggingId}
                  dragOverId={dragOverId}
                  onChildDragStart={(id) => setDraggingId(id)}
                  onChildDragOver={(id) => setDragOverId(id)}
                  onChildDrop={(targetId) => handleDrop(targetId, project.id)}
                  onChildDragEnd={() => {
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                />
              ))}

              {/* new top level project button */}
              <button
                onClick={() => openNewProject(null)}
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

      {/* settings and user row */}
      <div className="px-2 py-3 border-t border-surface-border space-y-0.5">
        <NavItem
          icon={<Settings size={16} />}
          label="Settings"
          active={isActive('settings')}
          onClick={() => handleNavClick(() => setActiveView('settings'))}
        />
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg
                        hover:bg-surface-border transition-colors group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 bg-brand rounded-full flex items-center
                            justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-300 truncate">{user?.username}</span>
          </div>
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
      {/* desktop sidebar */}
      <aside className="hidden md:flex w-60 min-w-60 h-screen bg-surface-raised
                        border-r border-surface-border flex-col select-none">
        {sidebarContent}
      </aside>

      {/* mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-12
                      bg-surface-raised border-b border-surface-border
                      flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-brand rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className="text-white font-semibold text-sm">FocusFlow</span>
        </div>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={(e) => e.target === e.currentTarget && setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full bg-surface-raised border-r
                            border-surface-border flex flex-col select-none
                            animate-slide-in-right z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {showNewProject && (
        <NewProjectModal
          defaultParentId={newProjectParentId}
          onClose={() => setShowNewProject(false)}
        />
      )}
    </>
  );
}

// reusable nav button
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

// recursive project item that renders its own children indented below it
function ProjectItem({
  project, depth, active, taskCount, isDragging, isDragOver,
  childProjects, allProjects, taskCounts, activeProjectId,
  onClick, onAddChild, onDragStart, onDragOver, onDrop, onDragEnd,
  onChildClick, draggingId, dragOverId,
  onChildDragStart, onChildDragOver, onChildDrop, onChildDragEnd,
}: {
  project: Project;
  depth: number;
  active: boolean;
  taskCount: number | null;
  isDragging: boolean;
  isDragOver: boolean;
  childProjects: Project[];
  allProjects: Project[];
  taskCounts: Record<string, number>;
  activeProjectId: string | null;
  onClick: () => void;
  onAddChild: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onChildClick: (id: string) => void;
  draggingId: string | null;
  dragOverId: string | null;
  onChildDragStart: (id: string) => void;
  onChildDragOver: (id: string) => void;
  onChildDrop: (targetId: string) => void;
  onChildDragEnd: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const removeProject = useAppStore((state) => state.removeProject);
  const hasChildren = childProjects.length > 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
      return;
    }
    try {
      await api.projects.delete(project.id);
      removeProject(project.id);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <>
      <div
        onMouseEnter={(e) => (e.currentTarget.draggable = true)}
        onMouseLeave={(e) => (e.currentTarget.draggable = false)}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          setTimeout(() => onDragStart(), 0);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver();
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDrop();
        }}
        onDragEnd={onDragEnd}
        className={`group flex items-center gap-1 rounded-lg transition-all
                    ${isDragOver ? 'bg-brand/10 border border-brand/30' : ''}
                    ${isDragging ? 'opacity-40' : ''}`}
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        {/* expand/collapse toggle for projects with children */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded(!expanded);
          }}
          className={`shrink-0 w-4 h-4 flex items-center justify-center
                      text-gray-600 transition-colors
                      ${hasChildren ? 'hover:text-gray-300' : 'opacity-0 pointer-events-none'}`}
        >
          {hasChildren && (expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />)}
        </button>

        {/* project name button */}
        <button
          onClick={onClick}
          className={`flex-1 flex items-center gap-2 px-1 py-1.5 rounded-lg
                      text-sm transition-colors duration-100 text-left min-w-0
                      ${active
                        ? 'text-brand font-medium'
                        : 'text-gray-400 hover:text-gray-200'
                      }`}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <span className="truncate">{project.icon} {project.name}</span>

          {/* task count badge only shown on top level projects */}
          {depth === 0 && taskCount !== null && taskCount > 0 && (
            <span className="ml-auto shrink-0 text-xs bg-brand/20
                             text-brand px-1.5 py-0.5 rounded-full font-medium">
              {taskCount}
            </span>
          )}
        </button>

        {/* add subproject button */}
        {depth === 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild();
            }}
            title="Add subproject"
            className="opacity-0 group-hover:opacity-100 shrink-0
                       text-gray-600 hover:text-brand transition-all p-1 rounded"
          >
            <FolderPlus size={11} />
          </button>
        )}

        {/* edit button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEditModal(true);
          }}
          title="Edit project"
          className="opacity-0 group-hover:opacity-100 shrink-0
                     text-gray-600 hover:text-brand transition-all p-1 rounded"
        >
          <Pencil size={11} />
        </button>

        {/* delete button with two click confirmation */}
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

      {/* render children indented below when expanded */}
      {hasChildren && expanded && (
        <div className="space-y-0.5">
          {childProjects.map((child) => (
            <div
              key={child.id}
              onMouseEnter={(e) => (e.currentTarget.draggable = true)}
              onMouseLeave={(e) => (e.currentTarget.draggable = false)}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => onChildDragStart(child.id), 0);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                onChildDragOver(child.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                onChildDrop(child.id);
              }}
              onDragEnd={onChildDragEnd}
              className={`group flex items-center gap-1 rounded-lg transition-all
                          ${dragOverId === child.id ? 'bg-brand/10 border border-brand/30' : ''}
                          ${draggingId === child.id ? 'opacity-40' : ''}`}
              style={{ paddingLeft: '20px' }}
            >
              {/* spacer to align with parent toggle area */}
              <span className="w-4 shrink-0" />

              {/* child project button - no task count badge */}
              <button
                onClick={() => onChildClick(child.id)}
                className={`flex-1 flex items-center gap-2 px-1 py-1.5 rounded-lg
                            text-sm transition-colors duration-100 text-left min-w-0
                            ${activeProjectId === child.id
                              ? 'text-brand font-medium'
                              : 'text-gray-400 hover:text-gray-200'
                            }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: child.color }}
                />
                <span className="truncate">{child.icon} {child.name}</span>
              </button>

              {/* edit child */}
              <ChildEditButton project={child} />

              {/* delete child */}
              <ChildDeleteButton project={child} />
            </div>
          ))}
        </div>
      )}

      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}

// separate component for child delete so it can have its own confirm state
function ChildDeleteButton({ project }: { project: Project }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const removeProject = useAppStore((state) => state.removeProject);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
      return;
    }
    try {
      await api.projects.delete(project.id);
      removeProject(project.id);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <button
      onClick={handleDelete}
      title={showConfirm ? 'Click again to confirm' : 'Delete project'}
      className={`opacity-0 group-hover:opacity-100 shrink-0
                  text-xs p-1 rounded transition-all
                  ${showConfirm
                    ? 'text-red-400 opacity-100 bg-red-400/10'
                    : 'text-gray-600 hover:text-red-400'
                  }`}
    >
      {showConfirm ? '✓?' : <Trash2 size={11} />}
    </button>
  );
}

function ChildEditButton({ project }: { project: Project }) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowEditModal(true);
        }}
        title="Edit project"
        className="opacity-0 group-hover:opacity-100 shrink-0
                   text-gray-600 hover:text-brand transition-all p-1 rounded"
      >
        <Pencil size={11} />
      </button>

      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}