/**
 * searchStore.ts
 *
 * Global store for the search bar state
 * Both TopBar and SearchPage read and write from here
 * so they stay in sync without passing props between them
 * isSearching drives whether SearchPage is shown instead of the current view
 */

import { create } from 'zustand';

interface SearchState {
  query: string;          // the current text in the search bar
  isSearching: boolean;   // true whenever the query is non-empty
  setQuery: (query: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  isSearching: false,

  // updates the query and flips isSearching on whenever there is text
  setQuery: (query: string) =>
    set({ query, isSearching: query.trim().length > 0 }),

  // resets both values so the normal view comes back
  clearSearch: () =>
    set({ query: '', isSearching: false }),
}));