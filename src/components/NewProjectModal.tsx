/**
 * NewProjectModal.tsx
 *
 * Modal dialog for creating a brand new project
 * The user picks a name color and emoji icon then hits Create
 * On success the project is added to the global store so it
 * appears in the sidebar immediately without a page reload
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Project } from '../types';
import { api } from '../lib/api';

// preset color swatches the user can choose from
const COLORS = [
  '#7c6af7', '#3b82f6', '#22c55e', '#f97316',
  '#ef4444', '#ec4899', '#a855f7', '#14b8a6',
];

// preset emoji icons the user can choose from
const ICONS = ['📋', '🚀', '💡', '🎯', '📚', '🛠️', '🎨', '💼', '🌟', '🔥'];

interface Props {
  onClose: () => void;
}

export default function NewProjectModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);  // default to purple
  const [icon, setIcon] = useState(ICONS[0]);      // default to clipboard
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const user = useAuthStore((state) => state.user);
  const addProject = useAppStore((state) => state.addProject);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.projects.create(name.trim(), color, icon);

      if (res.success && res.data) {
        // build the full project object so it can be added to local state right away
        const newProject: Project = {
          id: res.data as string,
          user_id: user!.id,
          name: name.trim(),
          color,
          icon,
          created_at: new Date().toISOString(),
          archived: false,
        };

        // push to the store so the sidebar updates without a reload
        addProject(newProject);
        onClose();
      } else {
        setError(res.error || 'Failed to create project');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // clicking the backdrop closes the modal
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center
                 justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-raised border border-surface-border rounded-2xl
                      w-full max-w-md shadow-2xl animate-slide-in-up">

        {/* header with title and close button */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-surface-border">
          <h3 className="text-white font-semibold">New Project</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* form body */}
        <div className="p-6 space-y-5">

          {/* project name input - autofocused when the modal opens */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Work Tasks, Personal Goals..."
              autoFocus
              className="w-full bg-surface-base border border-surface-border rounded-lg
                         px-3.5 py-2.5 text-white placeholder-gray-600 text-sm
                         focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                         transition-colors"
            />
          </div>

          {/* color swatch picker - selected swatch gets a white ring */}
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

          {/* emoji icon picker - selected icon gets a brand colored ring */}
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

          {/* live preview of how the project will appear in the sidebar */}
          <div className="flex items-center gap-3 bg-surface-base rounded-lg px-4 py-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-white text-sm font-medium">
              {icon} {name || 'Project Name'}
            </span>
          </div>

          {/* error message shown if the api call fails */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

        </div>

        {/* footer with cancel and create buttons */}
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
            onClick={handleCreate}
            disabled={isLoading}
            className="flex-1 bg-brand hover:bg-brand-hover disabled:opacity-50
                       text-white font-semibold py-2.5 rounded-lg
                       transition-colors text-sm"
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>

      </div>
    </div>
  );
}