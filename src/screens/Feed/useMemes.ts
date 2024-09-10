// Implemented this to reduce server load and accurately log when memes are viewed by adding them 
//to a batch and sending entire batch at the end of the swiping when user closes app. 
import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchMemes, recordMemeViews} from '../../services/memeService';
import { Meme, User } from '../../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debounce } from 'lodash';

const LAST_VIEWED_MEME_KEY = 'lastViewedMemeId';
const FETCH_LOCK_KEY = 'fetchMemesLock';

export const useMemes = (user: User | null, accessToken: string | null) => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [allMemesViewed, setAllMemesViewed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const memeViewBatchRef = useRef<{email: string; memeID: string}[]>([]);
  const lastRecordTimeRef = useRef(0);
  const isFetchingRef = useRef(false);

  const recordMemeViewBatch = useCallback(async () => {
    const now = Date.now();
    if (memeViewBatchRef.current.length >= 5) {
      try {
        await recordMemeViews(memeViewBatchRef.current);
        console.log('Batched meme views sent:', memeViewBatchRef.current);
        memeViewBatchRef.current = [];
        lastRecordTimeRef.current = now;
      } catch (error) {
        console.error('Failed to record meme view batch:', error);
      }
    }
  }, []);

  const addToMemeViewBatch = useCallback(
    (email: string, memeID: string) => {
      if (!memeViewBatchRef.current.some(item => item.email === email && item.memeID === memeID)) {
        memeViewBatchRef.current.push({email, memeID});
        console.log('Added to meme view batch:', {email, memeID});
      }
      recordMemeViewBatch();
    },
    [recordMemeViewBatch],
  );

  const setLastViewedMeme = async (memeId: string) => {
    try {
      await AsyncStorage.setItem(LAST_VIEWED_MEME_KEY, memeId);
    } catch (e) {
      console.error('Failed to save last viewed meme ID', e);
    }
  };

  const getLastViewedMeme = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(LAST_VIEWED_MEME_KEY);
    } catch (e) {
      console.error('Failed to get last viewed meme ID', e);
      return null;
    }
  };

  const acquireLock = async () => {
    if (isFetchingRef.current) return false;
    const lockValue = await AsyncStorage.getItem(FETCH_LOCK_KEY);
    if (lockValue) return false;
    isFetchingRef.current = true;
    await AsyncStorage.setItem(FETCH_LOCK_KEY, 'locked');
    return true;
  };

  const releaseLock = async () => {
    isFetchingRef.current = false;
    await AsyncStorage.removeItem(FETCH_LOCK_KEY);
  };

  const debouncedFetchMemes = useCallback(
    debounce(async (lastViewedMemeId: string | null, email: string, limit: number, token: string) => {
      if (!(await acquireLock())) return;
      try {
        const result = await fetchMemes(lastViewedMemeId, email, limit, token);
        setMemes(prevMemes => lastViewedMemeId ? [...prevMemes, ...result.memes] : result.memes);
        setLastEvaluatedKey(result.lastEvaluatedKey);
        setAllMemesViewed(result.memes.length === 0 || !result.lastEvaluatedKey);
      } catch (error) {
        setError('Failed to fetch memes. Please try again later.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        releaseLock();
      }
    }, 500),
    []
  );

  const fetchInitialMemes = useCallback(async () => {
    if (!user?.email || !accessToken || isLoading || !(await acquireLock())) return;
    try {
      setIsLoading(true);
      const lastViewedMemeId = await getLastViewedMeme();
      const result = await fetchMemes(lastViewedMemeId, user.email, 10, accessToken);
      setMemes(result.memes);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0 || !result.lastEvaluatedKey);
    } catch (error) {
      setError('Failed to fetch initial memes. Please try again later.');
    } finally {
      setIsLoading(false);
      releaseLock();
    }
  }, [user, accessToken, isLoading, acquireLock, releaseLock]);

  const fetchMoreMemes = useCallback(() => {
    if (isLoadingMore || allMemesViewed || !user?.email || !accessToken) return;
    setIsLoadingMore(true);
    debouncedFetchMemes(lastEvaluatedKey, user.email, 10, accessToken);
  }, [isLoadingMore, allMemesViewed, user, accessToken, lastEvaluatedKey, debouncedFetchMemes]);


  useEffect(() => {

    const intervalId = setInterval(recordMemeViewBatch, 30000);
    return () => {
      clearInterval(intervalId);
      recordMemeViewBatch();
    };
  }, [recordMemeViewBatch]);

  const handleMemeViewed = useCallback((memeId: string) => {
    setLastViewedMeme(memeId);
    if (user?.email) {
      addToMemeViewBatch(user.email, memeId);
    }
  }, [user, addToMemeViewBatch]);

  return {
    memes,
    isLoading,
    isLoadingMore,
    error,
    fetchMoreMemes,
    fetchInitialMemes,
    handleMemeViewed,
  };
};