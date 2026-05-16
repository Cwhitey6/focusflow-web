// TopBar.tsx — Top bar with live search input.

import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useSearchStore } from '../store/searchStore';

export default function TopBar() {
  const { activeView, activeProjectId, projects } = useAppStore();
  const { query, setQuery, clearSearch } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && query) {
        clearSearch();
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  const getTitle = () => {
    if (activeView === 'my-day') return 'My Day';
    if (activeView === 'inbox') return 'Inbox';
    if (activeProjectId) {
      const project = projects.find((p) => p.id === activeProjectId);
      return project ? `${project.icon} ${project.name}` : 'Project';
    }
    return 'FocusFlow';
  };

  return (
    <header className="h-14 border-b border-surface-border flex items-center
                       justify-between px-6 bg-surface-base flex-shrink-0">

      {/* Page title */}
      <h2 className="text-white font-semibold text-base">{getTitle()}</h2>

      {/* Search bar */}
      <div className="flex items-center gap-2 bg-surface-raised border
                      border-surface-border rounded-lg px-3 py-1.5 w-72
                      focus-within:border-brand transition-colors group">
        <Search size={14} className="text-gray-500 flex-shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
          className="bg-transparent text-sm text-white placeholder-gray-600
                     outline-none w-full"
        />

        {/* Clear button — only shown when typing */}
        {query && (
          <button
            onClick={() => {
              clearSearch();
              inputRef.current?.focus();
            }}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

    </header>
  );
}