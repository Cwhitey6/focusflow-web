/**
 * AddTaskBar.tsx
 *
 * Quick task creation input shown at the bottom of each list
 * Typing a title and pressing 'Enter' or clicking 'Add' fires the onAdd callback
 * Pressing 'Escape' clears the input and removes focus
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onAdd: (title: string) => void;   // called with the new task title when submitted
  placeholder?: string;              // optional custom placeholder text
}

export default function AddTaskBar({ onAdd, placeholder = 'Add a task...' }: Props) {
  const [title, setTitle] = useState('');       // current value of the input field
  const [focused, setFocused] = useState(false); // tracks whether the input is active

  // trim whitespace and fire the callback then reset the field
  const handleAdd = () => {
    if (!title.trim()) return; // do nothing if the input is empty or just spaces
    onAdd(title.trim());
    setTitle('');
  };

  return (
    // wrapper changes border and background when the input is focused
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg
                     border transition-colors duration-150
                     ${focused
                       ? 'border-brand bg-surface-raised'
                       : 'border-transparent hover:border-surface-border'
                     }`}>

      {/* plus icon turns brand color when the input is active */}
      <Plus
        size={16}
        className={focused ? 'text-brand' : 'text-gray-600'}
      />

      {/* main text input where the user types the task title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setFocused(true)}   // mark as focused so styles update
        onBlur={() => setFocused(false)}   // mark as unfocused when user clicks away
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();  // submit on Enter
          if (e.key === 'Escape') {
            setTitle('');        // clear whatever was typed
            setFocused(false);   // dismiss the focused state
          }
        }}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-gray-300
                   placeholder-gray-600 outline-none"
      />

      {/* add button only renders once the user has typed something */}
      {title.trim() && (
        <button
          onMouseDown={(e) => {
            e.preventDefault(); // stop the input losing focus before the click fires
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