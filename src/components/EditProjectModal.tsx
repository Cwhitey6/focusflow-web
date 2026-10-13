/**
 * EditProjectModal.tsx
 *
 * Modal dialog for editing an existing project's name color and icon
 * Also lets the user move the project into or out of another project
 * Opens when the user clicks the pencil icon next to a project in the sidebar
 * Saves changes to the database and updates the global store on success
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Project } from '../types';
import { api } from '../lib/api';

const COLORS = [
  '#7c6af7', '#3b82f6', '#22c55e', '#f97316',
  '#ef4444', '#ec4899', '#a855f7', '#14b8a6',
  '#6b7280', '#eab308',
];

const ICONS = ['📋', '🚀', '💡', '🎯', '📚', '🛠️', '🎨', '💼', '🌟', '🔥', '📥', '🗂️'];

interface Props {
  project: Project;
  onClose: () => void;
}

export default function EditProjectModal({ project, onClose }: Props) {
  const [name, setName] = useState(project.name);
  const [color, setColor] = useState(project.color);
  const [icon, setIcon] = useState(project.icon);
  const [parentId, setParentId] = useState<string | null>(project.parent_id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { projects, updateProject } = useAppStore();

  // only top level projects can be parents and a project cant be its own parent
  const parentOptions = projects.filter(
    (p) => p.name !== 'Inbox' && p.parent_id === null && p.id !== project.id
  );

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // save name color and icon
      const res = await api.projects.update(project.id, name.trim(), color, icon);

      if (!res.success) {
        setError(res.error || 'Failed to update project');
        return;
      }

      // save parent change if it changed
      if (parentId !== project.parent_id) {
        await api.projects.moveToParent(project.id, parentId);
      }

      // update the sidebar immediately
      updateProject(project.id, name.trim(), color, icon);
      onClose();

      // reload the page so the tree restructures correctly after a parent change
      if (parentId !== project.parent_id) {
        window.location.reload();
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center
                 justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-raised border border-surface-border rounded-2xl
                      w-full max-w-md shadow-2xl animate-slide-in-up">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-surface-border">
          <h3 className="text-white font-semibold">Edit Project</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* project name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className="w-full bg-surface-base border border-surface-border rounded-lg
                         px-3.5 py-2.5 text-white placeholder-gray-600 text-sm
                         focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                         transition-colors"
            />
          </div>

          {/* parent project picker - lets the user move this project */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Nest Inside Project
            </label>
            <select
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full bg-surface-base border border-surface-border rounded-lg
                         px-3.5 py-2.5 text-sm text-gray-300 outline-none
                         focus:border-brand transition-colors [color-scheme:dark]"
            >
              <option value="">None (top level)</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* color picker */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform
                              ${color === c
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-raised scale-110'
                                : 'hover:scale-110'
                              }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* icon picker */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center
                              transition-colors
                              ${icon === i
                                ? 'bg-brand/30 ring-1 ring-brand'
                                : 'bg-surface-base hover:bg-surface-border'
                              }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* live preview */}
          <div className="flex items-center gap-3 bg-surface-base rounded-lg px-4 py-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-white text-sm font-medium">
              {icon} {name || 'Project Name'}
            </span>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

        </div>

        {/* footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-surface-border">
          <button
            onClick={onClose}
            className="flex-1 bg-surface-base hover:bg-surface-border border
                       border-surface-border text-gray-300 font-medium py-2.5
                       rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-brand hover:bg-brand-hover disabled:opacity-50
                       text-white font-semibold py-2.5 rounded-lg
                       transition-colors text-sm"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}