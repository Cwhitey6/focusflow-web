import { useState } from 'react';
import { Trash2, Calendar, ChevronDown } from 'lucide-react';
import { Task, List } from '../types';
import { PRIORITIES } from '../types';

interface Props {
  task: Task;
  lists: List[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
  onMove: (taskId: string, newListId: string) => void;
}

export default function TaskRow({
  task, lists, onToggle, onDelete, onClick, onMove
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const priority = PRIORITIES[task.priority] ?? PRIORITIES.normal;
  const currentList = lists.find((l) => l.id === task.list_id);

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.due_date
    && !task.completed
    && new Date(task.due_date) < new Date();

  // Color for each list status
  const getListColor = (listName: string) => {
    if (listName === 'To Do')       return '#6b7280';
    if (listName === 'In Progress') return '#f97316';
    if (listName === 'Done')        return '#22c55e';
    return '#7c6af7';
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowStatusMenu(false);
      }}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-colors duration-100 group relative
                  ${isHovered ? 'bg-surface-raised' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`w-4 h-4 rounded-full border-2 flex-shrink-0
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

      {/* Priority dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: priority.color }}
        title={priority.label}
      />

      {/* Title */}
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

      {/* Status badge — clickable dropdown */}
      {!task.completed && currentList && (
        <div className="relative flex-shrink-0">
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

          {/* Dropdown menu */}
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
                      onMove(task.id, list.id);
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
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getListColor(list.name) }}
                  />
                  <span className="text-gray-200">{list.name}</span>
                  {list.id === task.list_id && (
                    <span className="ml-auto text-xs text-gray-600">current</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Due date */}
      {task.due_date && (
        <div className={`flex items-center gap-1 text-xs flex-shrink-0
                         ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
          <Calendar size={11} />
          <span>{formatDueDate(task.due_date)}</span>
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={() => onDelete(task.id)}
        className={`text-gray-600 hover:text-red-400 transition-all flex-shrink-0
                    ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}