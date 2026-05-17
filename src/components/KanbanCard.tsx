// KanbanCard v2
import { Calendar } from 'lucide-react';
import { Task } from '../types';
import { PRIORITIES } from '../types';

interface Props {
  task: Task;
  onClick: (task: Task) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export default function KanbanCard({
  task, onClick, onDragStart, onDragEnd, isDragging
}: Props) {
  const priority = PRIORITIES[task.priority] ?? PRIORITIES.normal;

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.due_date
    && !task.completed
    && new Date(task.due_date) < new Date();

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        setTimeout(() => onDragStart(task.id), 0);
      }}
      onDragEnd={onDragEnd}
      onClick={() => !isDragging && onClick(task)}
      className={`bg-surface-base border rounded-xl p-3.5
                  transition-all duration-150 select-none
                  ${isDragging
                    ? 'opacity-40 border-brand cursor-grabbing'
                    : 'border-surface-border hover:border-brand/40 cursor-grab'
                  }
                  hover:shadow-lg hover:shadow-black/20`}
    >
      {/* Priority bar */}
      <div
        className="w-8 h-0.5 rounded-full mb-3"
        style={{ backgroundColor: priority.color }}
      />

      {/* Title */}
      <p className={`text-sm font-medium leading-snug mb-3
                     ${task.completed
                       ? 'line-through text-gray-600'
                       : 'text-gray-200'
                     }`}>
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {task.due_date ? (
          <div className={`flex items-center gap-1 text-xs
                           ${isOverdue ? 'text-red-400' : 'text-gray-600'}`}>
            <Calendar size={10} />
            <span>{formatDueDate(task.due_date)}</span>
          </div>
        ) : <span />}

        <span
          className="text-xs px-1.5 py-0.5 rounded-md font-medium"
          style={{
            backgroundColor: priority.color + '20',
            color: priority.color,
          }}
        >
          {priority.label}
        </span>
      </div>
    </div>
  );
}