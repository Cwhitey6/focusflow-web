/**
 * TaskDetailModal.tsx
 *
 * Slide-in drawer that opens from the right when a task is clicked
 * Shows all editable fields for the task including title notes due date and priority
 * Changes are saved manually via the Save Changes button
 * The header shows a live saving indicator so the user knows when its working
 * Clicking the dark backdrop behind the drawer closes it
 */

import { useState } from 'react';
import { X, Calendar, Flag } from 'lucide-react';
import { Task } from '../types';
import { PRIORITIES } from '../types';
import { api } from '../lib/api';

interface Props {
  task: Task;
  onClose: () => void;
  onUpdate: (updated: Task) => void; // called after a successful save so the parent can update its list
}

export default function TaskDetailModal({ task, onClose, onUpdate }: Props) {
  // pre-fill all fields with the tasks current values
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(
    task.due_date ? task.due_date.split('T')[0] : '' // strip time so the date input works correctly
  );
  const [priority, setPriority] = useState(task.priority);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false); // briefly true after a successful save

  // accepts current values as params to avoid stale closure issues
  // defaults to the state values when called from the save button
  const handleSave = async (
    t = title,
    d = description,
    dd = dueDate,
    p = priority
  ) => {
    if (!t.trim()) return;
    setIsSaving(true);

    try {
      const res = await api.tasks.update({
        id: task.id,
        title: t.trim(),
        description: d,
        dueDate: dd ? new Date(dd).toISOString() : null,
        priority: p,
      });

      if (res.success) {
        // flash the saved indicator for 1.5 seconds
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);

        // tell the parent component about the updated values
        onUpdate({
          ...task,
          title: t.trim(),
          description: d,
          due_date: dd ? new Date(dd).toISOString() : null,
          priority: p,
        });
      }
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // clicking the backdrop closes the drawer
    <div
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* drawer panel slides in from the right */}
      <div className="w-full max-w-md h-full bg-surface-raised border-l
                      border-surface-border flex flex-col shadow-2xl animate-slide-in-right">

        {/* header shows save status and a close button */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-surface-border shrink-0">
          <span className="text-xs text-gray-500">
            {isSaving ? 'Saving...' : saved ? '✓ Saved' : 'Task Detail'}
          </span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* scrollable body with all the editable fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* task title as a large borderless input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full bg-transparent text-white text-xl font-semibold
                         outline-none placeholder-gray-600 border-b border-transparent
                         focus:border-surface-border pb-1 transition-colors"
            />
          </div>

          {/* notes textarea for longer descriptions */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes..."
              rows={4}
              className="w-full mt-2 bg-surface-base border border-surface-border
                         rounded-lg px-3.5 py-2.5 text-sm text-gray-300
                         placeholder-gray-600 outline-none focus:border-brand
                         transition-colors resize-none"
            />
          </div>

          {/* date picker for the due date */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider
                               font-medium flex items-center gap-1.5">
              <Calendar size={12} />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-2 bg-surface-base border border-surface-border
                         rounded-lg px-3.5 py-2.5 text-sm text-gray-300
                         outline-none focus:border-brand transition-colors
                         [scheme-dark]"
            />
          </div>

          {/* priority selector renders one button per priority level */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider
                               font-medium flex items-center gap-1.5">
              <Flag size={12} />
              Priority
            </label>
            <div className="flex gap-2 mt-2">
              {(Object.entries(PRIORITIES) as [Task['priority'], typeof PRIORITIES[keyof typeof PRIORITIES]][]).map(
                ([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPriority(key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium
                                border transition-colors
                                ${priority === key
                                  ? 'border-transparent text-white'
                                  : 'border-surface-border text-gray-500 hover:text-gray-300'
                                }`}
                    // active button gets a tinted background matching the priority color
                    style={priority === key
                      ? { backgroundColor: val.color + '33', borderColor: val.color, color: val.color }
                      : {}
                    }
                  >
                    {val.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* save button useful on mobile where there is no keyboard shortcut */}
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50
                       text-white font-semibold py-2.5 rounded-lg
                       transition-colors text-sm"
          >
            {isSaving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>

          {/* read only metadata shown at the bottom */}
          <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-surface-border">
            <p>Created: {new Date(task.created_at).toLocaleDateString()}</p>
            {task.completed_at && (
              <p>Completed: {new Date(task.completed_at).toLocaleDateString()}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}