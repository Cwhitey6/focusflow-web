import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Flag } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useSearchStore } from '../store/searchStore';
import { Task } from '../types';
import { PRIORITIES } from '../types';
import { api } from '../lib/api';
import TaskDetailModal from '../components/TaskDetailModal';

type PriorityFilter = 'all' | 'urgent' | 'high' | 'normal' | 'low';
type StatusFilter = 'all' | 'active' | 'completed';
type DueDateFilter = 'all' | 'overdue' | 'today' | 'upcoming';

export default function SearchPage() {
  const { projects, setActiveProject } = useAppStore();
  const { query, clearSearch } = useSearchStore();

  const [results, setResults] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all');

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.tasks.search(q);
      if (res.success && res.data) setResults(res.data as Task[]);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const filteredResults = results.filter((task) => {
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (statusFilter === 'active' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;

    if (dueDateFilter !== 'all') {
      if (!task.due_date) return false;
      const due = new Date(task.due_date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (dueDateFilter === 'overdue' && due >= today) return false;
      if (dueDateFilter === 'today' && due.toDateString() !== today.toDateString()) return false;
      if (dueDateFilter === 'upcoming' && due < tomorrow) return false;
    }

    return true;
  });

  const getProjectName = (task: Task) => {
    const project = projects.find((p) => p.id === task.project_id);
    return project ? `${project.icon} ${project.name}` : 'Unknown';
  };

  const handleGoToProject = (task: Task) => {
    setActiveProject(task.project_id);
    clearSearch();
  };

  const handleUpdate = (updated: Task) => {
    setResults((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  return (
    <>
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-6 space-y-6">

        <div className="flex items-center gap-3">
          <Search size={18} className="text-gray-500" />
          <h2 className="text-white font-semibold">
            {isLoading
              ? 'Searching...'
              : `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${query}"`
            }
          </h2>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <Flag size={12} className="text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              className="bg-surface-raised border border-surface-border rounded-lg
                         px-2.5 py-1.5 text-xs text-gray-300 outline-none
                         focus:border-brand transition-colors [color-scheme:dark]"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-surface-raised border border-surface-border rounded-lg
                         px-2.5 py-1.5 text-xs text-gray-300 outline-none
                         focus:border-brand transition-colors [color-scheme:dark]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-500" />
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value as DueDateFilter)}
              className="bg-surface-raised border border-surface-border rounded-lg
                         px-2.5 py-1.5 text-xs text-gray-300 outline-none
                         focus:border-brand transition-colors [color-scheme:dark]"
            >
              <option value="all">Any Date</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {(priorityFilter !== 'all' || statusFilter !== 'all' || dueDateFilter !== 'all') && (
            <button
              onClick={() => {
                setPriorityFilter('all');
                setStatusFilter('all');
                setDueDateFilter('all');
              }}
              className="text-xs text-brand hover:text-brand-hover transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent
                            rounded-full animate-spin" />
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-4xl">🔍</p>
            <p className="text-gray-400 font-medium">No results found</p>
            <p className="text-gray-600 text-sm">
              Try a different search term or adjust your filters
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResults.map((task) => {
              const priority = PRIORITIES[task.priority] ?? PRIORITIES.normal;
              const isOverdue = task.due_date && !task.completed
                && new Date(task.due_date) < new Date();

              return (
                <div
                  key={task.id}
                  className="bg-surface-raised border border-surface-border
                             rounded-xl p-4 hover:border-brand/40 transition-all
                             cursor-pointer group"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: priority.color }}
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium
                                     ${task.completed
                                       ? 'line-through text-gray-600'
                                       : 'text-gray-200'
                                     }`}>
                        {task.title}
                      </p>

                      {task.description && (
                        <p className="text-xs text-gray-600 mt-0.5 truncate">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToProject(task);
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

                        {task.due_date && (
                          <span className={`text-xs flex items-center gap-1
                                           ${isOverdue ? 'text-red-400' : 'text-gray-600'}`}>
                            <Calendar size={10} />
                            {new Date(task.due_date).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric'
                            })}
                          </span>
                        )}

                        {task.completed && (
                          <span className="text-xs text-green-600">✓ Done</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

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