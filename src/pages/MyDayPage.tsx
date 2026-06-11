/**
 * MyDayPage.tsx
 *
 * Shows all incomplete tasks due today across every project
 * Each card shows the task title its project and its priority level
 * Clicking a project name navigates to that project in the sidebar
 * Clicking anywhere on the card opens the task detail drawer
 */

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Task } from '../types';
import { PRIORITIES } from '../types';
import { api } from '../lib/api';
import TaskDetailModal from '../components/TaskDetailModal';

export default function MyDayPage() {
  const { projects, setActiveProject } = useAppStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.tasks.today();
        if (res.success && res.data) setTasks(res.data as Task[]);
      } catch (err) {
        console.error('Failed to load today tasks:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // looks up the project name and icon for a given task
  const getProjectName = (task: Task) => {
    const project = projects.find((p) => p.id === task.project_id);
    return project ? `${project.icon} ${project.name}` : '';
  };

  // syncs the updated task back into the list after saving in the detail drawer
  const handleUpdate = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  // formatted date string shown below the page title
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

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

        {/* page header with current date */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">My Day</h2>
          <p className="text-gray-500 text-sm mt-1">{today}</p>
        </div>

        {/* task count shown when there are tasks due today */}
        {tasks.length > 0 && (
          <p className="text-sm text-gray-500">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} due today
          </p>
        )}

        {/* empty state when nothing is due today */}
        {tasks.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-5xl">☀️</p>
            <p className="text-white font-semibold">You&apos;re all caught up!</p>
            <p className="text-gray-500 text-sm">
              No tasks due today. Enjoy your day or plan ahead.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const priority = PRIORITIES[task.priority] ?? PRIORITIES.normal;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-surface-raised border border-surface-border
                             rounded-xl p-4 hover:border-brand/40
                             transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">

                    {/* priority dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: priority.color }}
                    />

                    <div className="flex-1 min-w-0">
                      {/* task title */}
                      <p className="text-sm font-medium text-gray-200">
                        {task.title}
                      </p>

                      {/* project link and priority badge */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent opening the detail drawer
                            setActiveProject(task.project_id);
                          }}
                          className="text-xs text-brand hover:text-brand-hover transition-colors"
                        >
                          {getProjectName(task)}
                        </button>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: priority.color + '20',
                            color: priority.color,
                          }}
                        >
                          {priority.label}
                        </span>
                      </div>
                    </div>

                    {/* due date badge always shows Today on this page */}
                    <div className="flex items-center gap-1 text-xs text-red-400 shrink-0">
                      <Calendar size={11} />
                      <span>Today</span>
                    </div>

                  </div>
                </div>
              );
            })}
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