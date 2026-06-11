/**
 * ProjectPage.tsx
 *
 * Shows all tasks for a single project in either list view or board view
 * List view groups tasks by their kanban column with an add task bar under each
 * Board view renders the full drag and drop kanban board
 * Completed tasks are hidden by default and can be revealed with a toggle
 * Reloads whenever the projectId prop changes so switching projects works correctly
 */

import { useState, useEffect } from 'react';
import { List, LayoutGrid, CheckSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Task, List as ListType } from '../types';
import { api } from '../lib/api';
import TaskRow from '../components/TaskRow';
import AddTaskBar from '../components/AddTaskBar';
import TaskDetailModal from '../components/TaskDetailModal';
import KanbanBoard from '../components/KanbanBoard';

interface Props {
  projectId: string;
}

type ViewMode = 'list' | 'board';

export default function ProjectPage({ projectId }: Props) {
  const user = useAuthStore((state) => state.user);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<ListType[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(false); // controls the completed section visibility
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // reload tasks and lists whenever the active project changes
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        // fetch tasks and lists in parallel to save time
        const [tasksRes, listsRes] = await Promise.all([
          api.tasks.get(projectId),
          api.lists.get(projectId),
        ]);
        if (tasksRes.success && tasksRes.data) setTasks(tasksRes.data as Task[]);
        if (listsRes.success && listsRes.data) setLists(listsRes.data as ListType[]);
      } catch (err) {
        console.error('Failed to load project data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [projectId]);

  // creates a new task in the given list and adds it to local state immediately
  const handleAddTask = async (listId: string, title: string) => {
    try {
      const res = await api.tasks.create({
        listId,
        projectId,
        title,
        description: '',
        dueDate: null,
        priority: 'normal',
      });
      if (res.success && res.data) {
        const newTask: Task = {
          id: res.data as string,
          list_id: listId,
          project_id: projectId,
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
      console.error('Failed to create task:', err);
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

  // syncs the updated task back into the list after saving in the detail drawer
  const handleUpdate = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  // moves a task to a different list and updates local state
  const handleTaskMove = async (taskId: string, newListId: string) => {
    try {
      await api.tasks.move(taskId, newListId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, list_id: newListId } : t))
      );
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">

        {/* list/board view toggle buttons */}
        <div className="flex items-center gap-1 px-6 pt-6 pb-2">
          <div className="flex items-center gap-1 bg-surface-raised
                          border border-surface-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md
                          text-xs font-medium transition-colors
                          ${viewMode === 'list'
                            ? 'bg-brand text-white'
                            : 'text-gray-500 hover:text-gray-300'
                          }`}
            >
              <List size={13} />
              List
            </button>

            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md
                          text-xs font-medium transition-colors
                          ${viewMode === 'board'
                            ? 'bg-brand text-white'
                            : 'text-gray-500 hover:text-gray-300'
                          }`}
            >
              <LayoutGrid size={13} />
              Board
            </button>
          </div>
        </div>

        {/* board view with drag and drop */}
        {viewMode === 'board' && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <KanbanBoard
              lists={lists}
              tasks={tasks}
              onTaskClick={setSelectedTask}
              onTaskMove={handleTaskMove}
              onTaskAdd={handleAddTask}
            />
          </div>
        )}

        {/* list view grouped by kanban column */}
        {viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full px-6 py-4 space-y-8">

              {lists.map((list) => {
                // only show incomplete tasks in each section
                const listTasks = activeTasks.filter((t) => t.list_id === list.id);

                return (
                  <section key={list.id}>

                    {/* section header with list name and task count */}
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {list.name}
                      </h3>
                      <span className="text-xs text-gray-700 bg-surface-raised px-1.5 py-0.5 rounded-full">
                        {listTasks.length}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {listTasks.length === 0 ? (
                        <p className="text-xs text-gray-700 px-4 py-2">No tasks yet</p>
                      ) : (
                        listTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            lists={lists}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onClick={setSelectedTask}
                            onMove={handleTaskMove}
                          />
                        ))
                      )}

                      {/* add task bar pinned to the bottom of each section */}
                      <AddTaskBar
                        onAdd={(title) => handleAddTask(list.id, title)}
                        placeholder={`Add to ${list.name}...`}
                      />
                    </div>

                  </section>
                );
              })}

              {/* completed tasks section collapsed by default */}
              {completedTasks.length > 0 && (
                <section>
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 text-xs font-semibold
                               text-gray-500 uppercase tracking-wider mb-3
                               hover:text-gray-300 transition-colors"
                  >
                    <CheckSquare size={13} />
                    Completed ({completedTasks.length})
                    <span className="text-gray-700 normal-case font-normal tracking-normal">
                      {showCompleted ? '▲ hide' : '▼ show'}
                    </span>
                  </button>

                  {showCompleted && (
                    <div className="space-y-0.5 opacity-60">
                      {completedTasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          lists={lists}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                          onClick={setSelectedTask}
                          onMove={handleTaskMove}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

            </div>
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