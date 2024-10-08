import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import zustandMMKVStorage from '../utils/zustandMMKVStorage';

interface SearchState {
  searchHistory: string[];
  recentSearches: string[];
  savedSearches: string[];
  trendingSearches: string[];
  addToSearchHistory: (term: string) => void;
  clearSearchHistory: () => void;
  addToRecentSearches: (term: string) => void;
  removeFromRecentSearches: (term: string) => void;
  addToSavedSearches: (term: string) => void;
  removeFromSavedSearches: (term: string) => void;
  setTrendingSearches: (terms: string[]) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      searchHistory: [],
      recentSearches: [],
      savedSearches: [],
      trendingSearches: [],

      addToSearchHistory: term =>
        set(state => ({
          searchHistory: [
            term,
            ...state.searchHistory.filter(t => t !== term),
          ].slice(0, 50),
        })),

      clearSearchHistory: () => set({searchHistory: []}),

      addToRecentSearches: term =>
        set(state => ({
          recentSearches: [
            term,
            ...state.recentSearches.filter(t => t !== term),
          ].slice(0, 10),
        })),

      removeFromRecentSearches: term =>
        set(state => ({
          recentSearches: state.recentSearches.filter(t => t !== term),
        })),

      addToSavedSearches: term =>
        set(state => ({
          savedSearches: [...new Set([term, ...state.savedSearches])],
        })),

      removeFromSavedSearches: term =>
        set(state => ({
          savedSearches: state.savedSearches.filter(t => t !== term),
        })),

      setTrendingSearches: terms => set({trendingSearches: terms}),
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
