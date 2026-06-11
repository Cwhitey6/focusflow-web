/**
 * SearchPage.tsx
 *
 * Displays live search results as the user types in the top bar
 * Results are debounced by 300ms so we dont fire a request on every keystroke
 * Three filter dropdowns let the user narrow results by priority status and due date
 * Clicking a result opens the task detail drawer
 * Clicking a project name navigates to that project and closes the search
 */

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

  // filter state for the three dropdowns
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all');

  // wrapped in useCallback so it can be listed as a useEffect dependency safely
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

  // debounce the search so it only fires 300ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // apply all three filters to the raw results on the client side
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

  // looks up the project name and icon for a given task
  const getProjectName = (task: Task) => {
    const project = projects.find((p) => p.id === task.project_id);
    return project ? `${project.icon} ${project.name}` : 'Unknown';
  };

  // navigates to the project and closes the search overlay
  const handleGoToProject = (task: Task) => {
    setActiveProject(task.project_id);
    clearSearch();
  };

  // syncs the updated task back into results after saving in the detail drawer
  const handleUpdate = (updated: Task) => {
    setResults((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  return (
    <>
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-6 space-y-6">

        {/* header shows result count or loading state */}
        <div className="flex items-center gap-3">
          <Search size={18} className="text-gray-500" />
          <h2 className="text-white font-semibold">
            {isLoading
              ? 'Searching...'
              : `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${query}"`
            }
          </h2>
        </div>

        {/* filter dropdowns */}
        <div className="flex flex-wrap gap-3">

          {/* priority filter */}
          <div className="flex items-center gap-1.5">
            <Flag size={12} className="text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              className="bg-surface-raised border border-surface-border rounded-lg
                         px-2.5 py-1.5 text-xs text-gray-300 outline-none
                         focus:border-brand transition-colors [scheme-dark]"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* status filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-surface-raised border border-surface-border rounded-lg
                         px-2.5 py-1.5 text-xs text-gray-300 outline-none
                         focus:border-brand transition-colors [scheme-dark]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* due date filter */}
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-500" />
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value as DueDateFilter)}
              className="bg-surface-raised border border-surface-border rounded-lg
                         px-2.5 py-1.5 text-xs text-gray-300 outline-none
                         focus:border-brand transition-colors [scheme-dark]"
            >
              <option value="all">Any Date</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* clear filters button only shown when at least one filter is active */}
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

        {/* results area */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent
                            rounded-full animate-spin" />
          </div>
        ) : filteredResults.length === 0 ? (
          /* empty state when no results match the query and filters */
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

                    {/* priority dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: priority.color }}
                    />

                    <div className="flex-1 min-w-0">

                      {/* task title with strikethrough if completed */}
                      <p className={`text-sm font-medium
                                     ${task.completed
                                       ? 'line-through text-gray-600'
                                       : 'text-gray-200'
                                     }`}>
                        {task.title}
                      </p>

                      {/* description snippet truncated to one line */}
                      {task.description && (
                        <p className="text-xs text-gray-600 mt-0.5 truncate">
                          {task.description}
                        </p>
                      )}

                      {/* meta row with project link priority badge and due date */}
                      <div className="flex items-center gap-3 mt-2">

                        {/* clicking the project name navigates there and closes search */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToProject(task);
                          }}
                          className="text-xs text-brand hover:text-brand-hover transition-colors"
                        >
                          {getProjectName(task)}
                        </button>

                        {/* priority badge */}
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: priority.color + '20',
                            color: priority.color,
                          }}
                        >
                          {priority.label}
                        </span>

                        {/* due date turns red if overdue */}
                        {task.due_date && (
                          <span className={`text-xs flex items-center gap-1
                                           ${isOverdue ? 'text-red-400' : 'text-gray-600'}`}>
                            <Calendar size={10} />
                            {new Date(task.due_date).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric'
                            })}
                          </span>
                        )}

                        {/* green done badge for completed tasks */}
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