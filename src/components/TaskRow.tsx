/**
 * TaskRow.tsx
 *
 * A single task row in the list view
 * Shows a completion checkbox priority dot title status badge due date and delete button
 * The status badge is a dropdown that lets the user move the task between lists
 * The delete button only appears when the row is hovered
 * Clicking the title opens the task detail drawer
 */

import { useState } from 'react';
import { Trash2, Calendar, ChevronDown } from 'lucide-react';
import { Task, List } from '../types';
import { PRIORITIES } from '../types';

interface Props {
  task: Task;
  lists: List[];                                        // all lists in the project for the status dropdown
  onToggle: (id: string, completed: boolean) => void;  // marks the task complete or incomplete
  onDelete: (id: string) => void;                      // removes the task
  onClick: (task: Task) => void;                       // opens the detail drawer
  onMove: (taskId: string, newListId: string) => void; // moves the task to a different list
}

export default function TaskRow({
  task, lists, onToggle, onDelete, onClick, onMove
}: Props) {
  const [isHovered, setIsHovered] = useState(false);       // controls delete button visibility
  const [showStatusMenu, setShowStatusMenu] = useState(false); // controls the status dropdown

  const priority = PRIORITIES[task.priority] ?? PRIORITIES.normal;
  const currentList = lists.find((l) => l.id === task.list_id);

  // returns a short human readable string for the due date
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // a task is overdue if it has a past due date and is not yet complete
  const isOverdue = task.due_date
    && !task.completed
    && new Date(task.due_date) < new Date();

  // returns a color for each list name so the status badge is visually distinct
  const getListColor = (listName: string) => {
    if (listName === 'To Do') return '#6b7280';
    if (listName === 'In Progress') return '#f97316';
    if (listName === 'Done') return '#22c55e';
    return '#7c6af7';
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowStatusMenu(false); // close the dropdown if the user moves away
      }}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-colors duration-100 group relative
                  ${isHovered ? 'bg-surface-raised' : ''}`}
    >
      {/* circular checkbox that fills with brand color when complete */}
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`w-4 h-4 rounded-full border-2 shrink-0
                    flex items-center justify-center transition-colors
                    ${task.completed
                      ? 'bg-brand border-brand'
                      : 'border-gray-600 hover:border-brand'
                    }`}
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* small colored dot showing the priority level */}
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: priority.color }}
        title={priority.label}
      />

      {/* task title - clicking opens the detail drawer */}
      <button
        onClick={() => onClick(task)}
        className={`flex-1 text-left text-sm transition-colors
                    ${task.completed
                      ? 'line-through text-gray-600'
                      : 'text-gray-200 hover:text-white'
                    }`}
      >
        {task.title}
      </button>

      {/* note indicator - only shown when the task has a description */}
      {task.description && (
        <span
          title={task.description}
          className="text-gray-600 hover:text-gray-400 transition-colors shrink-0 text-xs"
        >
          📝
        </span>
      )}      

      {/* status badge only shows on incomplete tasks since completed ones cant be moved */}
      {!task.completed && currentList && (
        <div className="relative shrink-0">

          {/* clicking the badge opens the dropdown */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusMenu(!showStatusMenu);
            }}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md
                       border border-surface-border hover:border-gray-500
                       transition-colors"
            style={{
              backgroundColor: getListColor(currentList.name) + '20',
              color: getListColor(currentList.name),
            }}
          >
            {currentList.name}
            <ChevronDown size={10} />
          </button>

          {/* dropdown lists all available lists to move the task into */}
          {showStatusMenu && (
            <div className="absolute right-0 top-full mt-1 bg-surface-raised
                            border border-surface-border rounded-xl shadow-2xl
                            overflow-hidden z-50 min-w-36">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (list.id !== task.list_id) {
                      onMove(task.id, list.id); // only move if its a different list
                    }
                    setShowStatusMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5
                              text-sm text-left transition-colors hover:bg-surface-border
                              ${list.id === task.list_id
                                ? 'opacity-50 cursor-default'
                                : 'cursor-pointer'
                              }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getListColor(list.name) }}
                  />
                  <span className="text-gray-200">{list.name}</span>

                  {/* label to show which list the task currently lives in */}
                  {list.id === task.list_id && (
                    <span className="ml-auto text-xs text-gray-600">current</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* due date turns red if the task is past its deadline */}
      {task.due_date && (
        <div className={`flex items-center gap-1 text-xs shrink-0
                         ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
          <Calendar size={11} />
          <span>{formatDueDate(task.due_date)}</span>
        </div>
      )}

      {/* delete button fades in on hover */}
      <button
        onClick={() => onDelete(task.id)}
        className={`text-gray-600 hover:text-red-400 transition-all shrink-0
                    ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <Trash2 size={14} />
      </button>

    </div>
  );
}