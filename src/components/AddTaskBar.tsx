// AddTaskBar.tsx — Quick task creation input at the bottom of a list.

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onAdd: (title: string) => void;
  placeholder?: string;
}

export default function AddTaskBar({ onAdd, placeholder = 'Add a task...' }: Props) {
  const [title, setTitle] = useState('');
  const [focused, setFocused] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle('');
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg
                     border transition-colors duration-150
                     ${focused
                       ? 'border-brand bg-surface-raised'
                       : 'border-transparent hover:border-surface-border'
                     }`}>
      {/* Plus icon */}
      <Plus
        size={16}
        className={focused ? 'text-brand' : 'text-gray-600'}
      />

      {/* Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
          if (e.key === 'Escape') {
            setTitle('');
            setFocused(false);
          }
        }}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-gray-300
                   placeholder-gray-600 outline-none"
      />

      {/* Add button — only shown when typing */}
      {title.trim() && (
        <button
          onMouseDown={(e) => {
            e.preventDefault(); // prevent blur before click
            handleAdd();
          }}
          className="text-xs bg-brand hover:bg-brand-hover text-white
                     px-2.5 py-1 rounded-md transition-colors"
        >
          Add
        </button>
      )}
    </div>
  );
}