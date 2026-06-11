/**
 * KanbanCard.tsx
 *
 * A single draggable card on the kanban board
 * Shows the task title priority indicator and due date
 * While dragging the card fades out so you can see where it will land
 * Clicking the card opens the task detail drawer
 */

import { Calendar } from 'lucide-react';
import { Task } from '../types';
import { PRIORITIES } from '../types';

interface Props {
  task: Task;
  onClick: (task: Task) => void;       // opens the detail drawer
  onDragStart: (taskId: string) => void; // tells the board which card is moving
  onDragEnd: () => void;               // resets drag state on the board
  isDragging: boolean;                 // true while this card is being dragged
}

export default function KanbanCard({
  task, onClick, onDragStart, onDragEnd, isDragging
}: Props) {
  // look up color and label for the tasks priority level
  const priority = PRIORITIES[task.priority] ?? PRIORITIES.normal;

  // returns a short human readable date string
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // a task is overdue if it has a due date in the past and is not yet complete
  const isOverdue = task.due_date
    && !task.completed
    && new Date(task.due_date) < new Date();

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id); // needed as a fallback on some browsers
        setTimeout(() => onDragStart(task.id), 0); // small delay so the drag ghost renders first
      }}
      onDragEnd={onDragEnd}
      onClick={() => !isDragging && onClick(task)} // dont open the drawer if the user was dragging
      className={`bg-surface-base border rounded-xl p-3.5
                  transition-all duration-150 select-none
                  ${isDragging
                    ? 'opacity-40 border-brand cursor-grabbing'
                    : 'border-surface-border hover:border-brand/40 cursor-grab'
                  }
                  hover:shadow-lg hover:shadow-black/20`}
    >
      {/* thin colored bar at the top indicates priority level */}
      <div
        className="w-8 h-0.5 rounded-full mb-3"
        style={{ backgroundColor: priority.color }}
      />

      {/* task title with strikethrough if completed */}
      <p className={`text-sm font-medium leading-snug mb-3
                     ${task.completed
                       ? 'line-through text-gray-600'
                       : 'text-gray-200'
                     }`}>
        {task.title}
      </p>

      {/* footer row with due date on the left and priority badge on the right */}
      <div className="flex items-center justify-between">

        {/* due date turns red if the task is overdue */}
        {task.due_date ? (
          <div className={`flex items-center gap-1 text-xs
                           ${isOverdue ? 'text-red-400' : 'text-gray-600'}`}>
            <Calendar size={10} />
            <span>{formatDueDate(task.due_date)}</span>
          </div>
        ) : <span />}

        {/* priority badge uses the priority color with a faint background */}
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