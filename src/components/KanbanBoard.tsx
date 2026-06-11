/**
 * KanbanBoard.tsx
 *
 * Renders a horizontal set of columns where each column maps to a list
 * Cards can be dragged between columns and the change is saved to the database
 * A counter ref is used on drag enter and leave to prevent flickering when
 * the user drags over child elements inside a column
 */

import { useState, useRef } from 'react';
import { Task, List } from '../types';
import KanbanCard from './KanbanCard';
import AddTaskBar from './AddTaskBar';
import { api } from '../lib/api';

interface Props {
  lists: List[];                                        // the columns to render
  tasks: Task[];                                        // all tasks across all columns
  onTaskClick: (task: Task) => void;                   // opens the task detail drawer
  onTaskMove: (taskId: string, newListId: string) => void; // updates local state after a move
  onTaskAdd: (listId: string, title: string) => void;  // creates a new task in a column
}

export default function KanbanBoard({
  lists, tasks, onTaskClick, onTaskMove, onTaskAdd
}: Props) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null); // which card is being dragged
  const [dragOverListId, setDragOverListId] = useState<string | null>(null); // which column is highlighted

  // tracks how many times dragenter has fired per column
  // this prevents the highlight from flickering when hovering over child elements
  const dragCounter = useRef<Record<string, number>>({});

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
  };

  // reset all drag state when the drag ends regardless of where it was dropped
  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverListId(null);
    dragCounter.current = {};
  };

  // increment the counter and highlight the column the user is dragging over
  const handleDragEnter = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    dragCounter.current[listId] = (dragCounter.current[listId] || 0) + 1;
    setDragOverListId(listId);
  };

  // decrement the counter and only remove the highlight when fully leaving the column
  const handleDragLeave = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    dragCounter.current[listId] = (dragCounter.current[listId] || 0) - 1;
    if (dragCounter.current[listId] <= 0) {
      dragCounter.current[listId] = 0;
      setDragOverListId((prev) => (prev === listId ? null : prev));
    }
  };

  // required to allow dropping - also sets the cursor to a move icon
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    dragCounter.current[listId] = 0;
    setDragOverListId(null);

    // get the task id from state or fall back to the dataTransfer payload
    const taskId = draggingTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);

    // do nothing if the task was dropped back into the same column
    if (!task || task.list_id === listId) {
      setDraggingTaskId(null);
      return;
    }

    try {
      // save the new column to the database then update local state
      await api.tasks.move(taskId, listId);
      onTaskMove(taskId, listId);
    } catch (err) {
      console.error('Failed to move task:', err);
    } finally {
      setDraggingTaskId(null);
    }
  };

  return (
    // horizontal scrolling container so columns dont wrap on smaller screens
    <div className="flex gap-4 h-full overflow-x-auto pb-6 px-6 pt-4">
      {lists.map((list) => {

        // only show incomplete tasks in the board view
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
            {/* column header shows the list name and task count */}
            <div className="flex items-center justify-between px-4 py-3
                            border-b border-surface-border shrink-0">
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

            {/* scrollable card area - tints blue when a card is dragged over */}
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

              {/* dashed drop target shown when dragging over an empty column */}
              {isDragOver && listTasks.length === 0 && (
                <div className="border-2 border-dashed border-brand/40
                                rounded-xl h-20 flex items-center justify-center
                                transition-all">
                  <p className="text-xs text-brand/60 font-medium">Drop here</p>
                </div>
              )}

              {/* spacer keeps the column a consistent height when empty */}
              {!isDragOver && listTasks.length === 0 && (
                <div className="h-8" />
              )}
            </div>

            {/* add task input pinned to the bottom of each column */}
            <div className="p-3 border-t border-surface-border shrink-0">
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