/**
 * TopBar.tsx
 *
 * Sticky header bar that sits above the main content area
 * Shows the current page title on the left and a search input on the right
 * Pressing Ctrl+K or Cmd+K from anywhere on the page focuses the search
 * Pressing Escape clears the search and removes focus
 * Typing anything triggers the global search page via the search store
 */

import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useSearchStore } from '../store/searchStore';

export default function TopBar() {
  const { activeView, activeProjectId, projects } = useAppStore();
  const { query, setQuery, clearSearch } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // register global keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K focuses the search bar from anywhere on the page
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape clears the search if there is an active query
      if (e.key === 'Escape' && query) {
        clearSearch();
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, clearSearch]);

  // builds the page title based on what is currently active in the sidebar
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
                       justify-between px-6 bg-surface-base shrink-0">

      {/* current page title driven by the active view */}
      <h2 className="text-white font-semibold text-base">{getTitle()}</h2>

      {/* search input - border turns brand color when focused */}
      <div className="flex items-center gap-2 bg-surface-raised border
                      border-surface-border rounded-lg px-3 py-1.5 w-72
                      focus-within:border-brand transition-colors group">
        <Search size={14} className="text-gray-500 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
          className="bg-transparent text-sm text-white placeholder-gray-600
                     outline-none w-full"
        />

        {/* clear button only appears once the user has typed something */}
        {query && (
          <button
            onClick={() => {
              clearSearch();
              inputRef.current?.focus(); // keep focus so the user can type a new query
            }}
            className="text-gray-500 hover:text-white transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

    </header>
  );
}