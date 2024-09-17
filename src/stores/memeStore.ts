// memeStore.ts

import { create } from 'zustand';
import { Meme } from '../types/types'; // Assuming you have a Meme type defined
import { fetchMemes as fetchMemesAPI } from '../services/memeService'; // Adjust the import based on your file structure

type MemeStore = {
  memes: Meme[];
  setMemes: (memes: Meme[]) => void;
  currentMediaIndex: number;
  setCurrentMediaIndex: (index: number) => void;
  fetchMemes: (accessToken: string, userEmail: string) => Promise<void>;
  hasNextPage: boolean;
  setHasNextPage: (hasNext: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isError: boolean;
  setIsError: (error: boolean) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
};

export const useMemeStore = create<MemeStore>()((set, get) => ({
  memes: [],
  setMemes: (memes) => set({ memes }),
  currentMediaIndex: 0,
  setCurrentMediaIndex: (index) => set({ currentMediaIndex: index }),
  hasNextPage: true,
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  isError: false,
  setIsError: (error) => set({ isError: error }),
  error: null,
  setError: (error) => set({ error }),
  fetchMemes: async (accessToken, userEmail) => {
    set({ isLoading: true, isError: false, error: null });
    try {
      const lastEvaluatedKey = null; // You can manage this as per your pagination logic
      const result = await fetchMemesAPI(lastEvaluatedKey, userEmail, 10, accessToken);
      set((state) => {
        console.log('Adding memes to store:', result.memes.length);
        return {
          memes: [...state.memes, ...result.memes],
          hasNextPage: !!result.lastEvaluatedKey,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Error fetching memes:', error);
      set({ isError: true, error: error instanceof Error ? error : new Error('Unknown error'), isLoading: false });
    }
  },
}));
