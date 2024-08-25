import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchMemes } from '../../components/Meme/memeService';
import { Meme, User, FetchMemesResult } from '../../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, getUserIdentifier } from '../../utils/secureStore';

export const useMemes = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [hasMoreMemes, setHasMoreMemes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialMemes = useCallback(async () => {
    setIsLoading(true);
    try {
      const userEmail = await getUserIdentifier();
      const accessToken = await getToken('accessToken');

      if (!userEmail || !accessToken) {
        throw new Error('User email or access token not available');
      }

      // Try to load cached memes
      const cachedMemesString = await AsyncStorage.getItem('cachedMemes');
      if (cachedMemesString) {
        const cachedMemes = JSON.parse(cachedMemesString);
        setMemes(cachedMemes);
      }

      // Fetch fresh memes
      const result = await fetchMemes(null, userEmail, 10, accessToken);
      setMemes(result.memes);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setHasMoreMemes(result.memes.length === 10 && !!result.lastEvaluatedKey);

      // Update cache with new memes
      await AsyncStorage.setItem('cachedMemes', JSON.stringify(result.memes));
    } catch (error) {
      console.error('Error fetching initial memes:', error);
      setError('Failed to fetch memes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMoreMemes = useCallback(async () => {
    if (isLoadingMore || !hasMoreMemes) return;
    setIsLoadingMore(true);
    try {
      const userEmail = await getUserIdentifier();
      const accessToken = await getToken('accessToken');

      if (!userEmail || !accessToken) {
        throw new Error('User email or access token not available');
      }

      console.log('Fetching more memes with lastEvaluatedKey:', lastEvaluatedKey);
      const result = await fetchMemes(lastEvaluatedKey, userEmail, 10, accessToken);
      setMemes(prevMemes => [...prevMemes, ...result.memes]);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setHasMoreMemes(result.memes.length === 10 && !!result.lastEvaluatedKey);
      console.log('Fetched more memes:', result.memes.length);
    } catch (error) {
      console.error('Error fetching more memes:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreMemes, lastEvaluatedKey]);

  useEffect(() => {
    fetchInitialMemes();
  }, [fetchInitialMemes]);

  return {
    memes,
    isLoading,
    isLoadingMore,
    error,
    fetchMoreMemes,
    fetchInitialMemes,
  };
};