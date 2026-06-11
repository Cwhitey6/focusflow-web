/**
 * InboxPage.tsx
 *
 * Quick task capture page for tasks that dont belong to a specific project
 * Loads the special Inbox project that is auto created when the user registers
 * Active tasks are shown at the top and completed tasks are shown below at reduced opacity
 * If the inbox project is missing for some reason an error message is shown instead
 */

import { useState, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Task, Project, List } from '../types';
import { api } from '../lib/api';
import TaskRow from '../components/TaskRow';
import AddTaskBar from '../components/AddTaskBar';
import TaskDetailModal from '../components/TaskDetailModal';

export default function InboxPage() {
  const user = useAuthStore((state) => state.user);

  const [inboxProject, setInboxProject] = useState<Project | null>(null);
  const [inboxList, setInboxList] = useState<List | null>(null);   // the single list inside the inbox project
  const [lists, setLists] = useState<List[]>([]);                  // passed to TaskRow for the status dropdown
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  async function load() {
    setIsLoading(true);
    try {
      const projectRes = await api.projects.inbox();

      if (projectRes.success && projectRes.data) {
        const project = projectRes.data as Project;
        setInboxProject(project);

        const listsRes = await api.lists.get(project.id);
        const listsData = (listsRes.data ?? []) as List[];

        if (listsData.length > 0) {
          setLists(listsData);
          setInboxList(listsData[0]);

          const tasksRes = await api.tasks.get(project.id);
          setTasks((tasksRes.data ?? []) as Task[]);
        }
      }
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setIsLoading(false);
    }
  }
  load();
}, []);

  // adds a new task to the inbox list and updates local state immediately
  const handleAddTask = async (title: string) => {
    if (!inboxList || !inboxProject) return;
    try {
      const res = await api.tasks.create({
        listId: inboxList.id,
        projectId: inboxProject.id,
        title,
        description: '',
        dueDate: null,
        priority: 'normal',
      });
      if (res.success && res.data) {
        const newTask: Task = {
          id: res.data as string,
          list_id: inboxList.id,
          project_id: inboxProject.id,
          user_id: user!.id,
          title,
          description: '',
          due_date: null,
          priority: 'normal',
          completed: false,
          completed_at: null,
          position: 0,
          created_at: new Date().toISOString(),
        };
        setTasks((prev) => [...prev, newTask]);
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  // toggles completion and sets or clears the completed_at timestamp
  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await api.tasks.toggle(id, completed);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // removes the task and closes the detail drawer if it was open
  const handleDelete = async (id: string) => {
    try {
      await api.tasks.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (selectedTask?.id === id) setSelectedTask(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // moves a task to a different list and updates local state
  const handleMove = async (taskId: string, newListId: string) => {
    try {
      await api.tasks.move(taskId, newListId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, list_id: newListId } : t))
      );
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  // syncs the updated task back into the list after saving in the detail drawer
  const handleUpdate = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 space-y-6">

        {/* page header */}
        <div className="flex items-center gap-3">
          <Inbox size={22} className="text-gray-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Inbox</h2>
            <p className="text-gray-500 text-sm">Quick capture - tasks without a project</p>
          </div>
        </div>

        {/* add task input or error if inbox is missing */}
        {inboxList ? (
          <div className="bg-surface-raised border border-surface-border rounded-xl p-3">
            <AddTaskBar
              onAdd={handleAddTask}
              placeholder="Capture a task quickly..."
            />
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">
              Inbox not found. Try signing out and back in to recreate it.
            </p>
          </div>
        )}

        {/* active task list */}
        {activeTasks.length > 0 && (
          <div className="space-y-0.5">
            {activeTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                lists={lists}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onClick={setSelectedTask}
                onMove={handleMove}
              />
            ))}
          </div>
        )}

        {/* empty state shown when there are no active tasks */}
        {activeTasks.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <p className="text-4xl">📥</p>
            <p className="text-gray-400 font-medium">Inbox is empty</p>
            <p className="text-gray-600 text-sm">Add tasks above to capture them quickly</p>
          </div>
        )}

        {/* completed tasks shown at reduced opacity below the active ones */}
        {completedTasks.length > 0 && (
          <div className="space-y-0.5 opacity-60">
            <p className="text-xs text-gray-600 uppercase tracking-wider px-4 mb-2">
              Completed ({completedTasks.length})
            </p>
            {completedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                lists={lists}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onClick={setSelectedTask}
                onMove={handleMove}
              />
            ))}
          </div>
        )}

      </div>

      {/* task detail drawer rendered outside the scroll container */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}