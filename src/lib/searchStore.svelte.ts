/**
 * Search store for managing search state, history, and results
 * Persists to localStorage and provides reactive search interface
 */

import { writable, derived } from 'svelte/store';
import type { SearchResult, SearchFilter } from '$lib/server/search';

export interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  filters: SearchFilter;
  history: string[]; // last 20 searches
  selectedResult: string | null; // docId of selected result
}

const STORAGE_KEY_QUERY = 'sive:search:query';
const STORAGE_KEY_FILTERS = 'sive:search:filters';
const STORAGE_KEY_HISTORY = 'sive:search:history';
const MAX_HISTORY = 20;
const DEBOUNCE_DELAY = 300; // ms

// Initialize from localStorage
function initializeState(): SearchState {
  const savedQuery =
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_QUERY) : null;
  const savedFilters =
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_FILTERS) : null;
  const savedHistory =
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_HISTORY) : null;

  return {
    query: savedQuery || '',
    results: [],
    isSearching: false,
    error: null,
    filters: savedFilters ? JSON.parse(savedFilters) : {},
    history: savedHistory ? JSON.parse(savedHistory) : [],
    selectedResult: null
  };
}

// Create writable store
const initialState = initializeState();
const state = writable<SearchState>(initialState);

// Debounce timer for search
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Update query and trigger search (with debounce)
 */
export function setQuery(query: string): void {
  state.update((s) => ({ ...s, query, isSearching: true }));

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_QUERY, query);
  }

  // Clear previous debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new debounce timer
  debounceTimer = setTimeout(async () => {
    await executeSearch();
  }, DEBOUNCE_DELAY);
}

/**
 * Execute the actual search
 */
async function executeSearch(): Promise<void> {
  const currentState = await new Promise<SearchState>((resolve) => {
    const unsubscribe = state.subscribe(resolve);
    unsubscribe();
  });

  if (!currentState.query.trim()) {
    state.update((s) => ({
      ...s,
      results: [],
      isSearching: false,
      error: null
    }));
    return;
  }

  try {
    state.update((s) => ({ ...s, isSearching: true, error: null }));

    // Call search API (TODO: implement backend endpoint)
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: currentState.query,
        filters: currentState.filters
      })
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const results = await response.json();

    state.update((s) => ({
      ...s,
      results,
      isSearching: false,
      error: null
    }));

    // Add to history if not empty
    if (currentState.query.trim()) {
      addToHistory(currentState.query);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search error';
    state.update((s) => ({
      ...s,
      results: [],
      isSearching: false,
      error: message
    }));
  }
}

/**
 * Add query to search history (max 20)
 */
function addToHistory(query: string): void {
  state.update((s) => {
    const newHistory = [query, ...s.history.filter((q) => q !== query)].slice(
      0,
      MAX_HISTORY
    );

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
    }

    return { ...s, history: newHistory };
  });
}

/**
 * Update search filters and re-execute search
 */
export function setFilters(filters: Partial<SearchFilter>): void {
  state.update((s) => {
    const newFilters = { ...s.filters, ...filters };

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(newFilters));
    }

    return { ...s, filters: newFilters, isSearching: true };
  });

  // Re-execute search with new filters
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    executeSearch();
  }, 100); // Faster re-search for filter changes
}

/**
 * Clear all filters
 */
export function clearFilters(): void {
  setFilters({
    tags: undefined,
    dateRangeStart: undefined,
    dateRangeEnd: undefined
  });
}

/**
 * Select a result (for highlighting)
 */
export function selectResult(docId: string | null): void {
  state.update((s) => ({ ...s, selectedResult: docId }));
}

/**
 * Clear search entirely
 */
export function clearSearch(): void {
  state.update((s) => ({
    ...s,
    query: '',
    results: [],
    selectedResult: null,
    error: null,
    isSearching: false
  }));

  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_QUERY);
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
}

/**
 * Clear search history
 */
export function clearHistory(): void {
  state.update((s) => ({ ...s, history: [] }));

  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  }
}

/**
 * Get a search query from history
 */
export function loadFromHistory(query: string): void {
  setQuery(query);
}

/**
 * Subscribe to search state
 */
export const searchState = {
  subscribe: state.subscribe
};

/**
 * Derived: is search active?
 */
export const isSearchActive = derived(state, ($state) => $state.query.length > 0);

/**
 * Derived: result count
 */
export const resultCount = derived(state, ($state) => $state.results.length);

/**
 * Derived: filtered tags
 */
export const activeFilters = derived(state, ($state) => {
  const active = [];
  if ($state.filters.tags && $state.filters.tags.length > 0) {
    active.push(`Tags: ${$state.filters.tags.join(', ')}`);
  }
  if ($state.filters.dateRangeStart || $state.filters.dateRangeEnd) {
    active.push('Date range active');
  }
  return active;
});

/**
 * Export state for testing/debugging
 */
export function getState(): SearchState {
  let current: SearchState = initialState;
  const unsubscribe = state.subscribe((s) => {
    current = s;
  });
  unsubscribe();
  return current;
}
