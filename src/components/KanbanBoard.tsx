import { useState, useRef } from 'react';
import { Task, List } from '../types';
import KanbanCard from './KanbanCard';
import AddTaskBar from './AddTaskBar';
import { api } from '../lib/api';

interface Props {
  lists: List[];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, newListId: string) => void;
  onTaskAdd: (listId: string, title: string) => void;
}

export default function KanbanBoard({
  lists, tasks, onTaskClick, onTaskMove, onTaskAdd
}: Props) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverListId, setDragOverListId] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverListId(null);
    dragCounter.current = {};
  };

  const handleDragEnter = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    dragCounter.current[listId] = (dragCounter.current[listId] || 0) + 1;
    setDragOverListId(listId);
  };

  const handleDragLeave = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    dragCounter.current[listId] = (dragCounter.current[listId] || 0) - 1;
    if (dragCounter.current[listId] <= 0) {
      dragCounter.current[listId] = 0;
      setDragOverListId((prev) => (prev === listId ? null : prev));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    dragCounter.current[listId] = 0;
    setDragOverListId(null);

    const taskId = draggingTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.list_id === listId) {
      setDraggingTaskId(null);
      return;
    }

    try {
      await api.tasks.move(taskId, listId);
      onTaskMove(taskId, listId);
    } catch (err) {
      console.error('Failed to move task:', err);
    } finally {
      setDraggingTaskId(null);
    }
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-6 px-6 pt-4">
      {lists.map((list) => {
        const listTasks = tasks.filter(
          (t) => t.list_id === list.id && !t.completed
        );
        const isDragOver = dragOverListId === list.id;

        return (
          <div
            key={list.id}
            onDragEnter={(e) => handleDragEnter(e, list.id)}
            onDragLeave={(e) => handleDragLeave(e, list.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, list.id)}
            className={`flex flex-col w-72 min-w-72 rounded-2xl border
                        transition-all duration-150
                        ${isDragOver
                          ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10'
                          : 'border-surface-border bg-surface-raised'
                        }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3
                            border-b border-surface-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-300">
                  {list.name}
                </h3>
                <span className="text-xs text-gray-600 bg-surface-base
                                 px-1.5 py-0.5 rounded-full">
                  {listTasks.length}
                </span>
              </div>
            </div>

            {/* Cards area */}
            <div className={`flex-1 overflow-y-auto p-3 space-y-2.5 min-h-24
                             transition-colors duration-150
                             ${isDragOver ? 'bg-brand/5' : ''}`}
            >
              {listTasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggingTaskId === task.id}
                />
              ))}

              {isDragOver && listTasks.length === 0 && (
                <div className="border-2 border-dashed border-brand/40
                                rounded-xl h-20 flex items-center justify-center
                                transition-all">
                  <p className="text-xs text-brand/60 font-medium">Drop here</p>
                </div>
              )}

              {!isDragOver && listTasks.length === 0 && (
                <div className="h-8" />
              )}
            </div>

            {/* Add task */}
            <div className="p-3 border-t border-surface-border flex-shrink-0">
              <AddTaskBar
                onAdd={(title) => onTaskAdd(list.id, title)}
                placeholder="Add card..."
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}