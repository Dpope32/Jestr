import { useState, useCallback, useEffect } from 'react';
import { fetchMemes, getLikeStatus } from '../../components/Meme/memeService';
import { Meme, User } from '../../types/types';

export const useMemes = (user: User | null, accessToken: string | null) => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [allMemesViewed, setAllMemesViewed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialMemes = useCallback(async () => {
    if (!user?.email || !accessToken) return;
    setIsLoading(true);
    try {
      const result = await fetchMemes(null, user.email, 5, accessToken);
      setMemes(result.memes);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0);
    } catch (error) {
      setError('Failed to fetch memes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user, accessToken]);

  const fetchMoreMemes = useCallback(async () => {
    if (isLoadingMore || allMemesViewed || !user?.email || !accessToken) return;
    setIsLoadingMore(true);
    try {
      console.log('Fetching more memes with lastEvaluatedKey:', lastEvaluatedKey);
      const result = await fetchMemes(lastEvaluatedKey, user.email, 5, accessToken);
      setMemes(prevMemes => [...prevMemes, ...result.memes]);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0 || !result.lastEvaluatedKey);
      console.log('Fetched more memes:', result.memes.length);
    } catch (error) {
      console.error('Error fetching more memes:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, allMemesViewed, user, accessToken, lastEvaluatedKey]);

  useEffect(() => {
    fetchInitialMemes();
  }, [fetchInitialMemes]);

  return { memes, isLoading, isLoadingMore, error, fetchMoreMemes, fetchInitialMemes };
};