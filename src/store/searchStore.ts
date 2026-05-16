// searchStore.ts — Global search state.
// Stores the current search query so both TopBar and
// SearchPage can read/write it from anywhere.

import { create } from 'zustand';

interface SearchState {
  query: string;
  isSearching: boolean;
  setQuery: (query: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  isSearching: false,

  setQuery: (query: string) =>
    set({ query, isSearching: query.trim().length > 0 }),

  clearSearch: () =>
    set({ query: '', isSearching: false }),
}));