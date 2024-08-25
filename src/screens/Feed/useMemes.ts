import {useState, useCallback, useEffect} from 'react';

import {Meme} from '../../types/types';
// import {fetchMemes} from '../../components/Meme/memeService';
// import {recordMemeViews} from '../../services/authFunctions';
// import AsyncStorage from '@react-native-async-storage/async-storage';

import localMemes from '../../utils/dummyData.json';

export const useMemes = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<number | null>(null);
  const [allMemesViewed, setAllMemesViewed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  // Simulating the "fetch" by loading data from the local JSON file
  const fetchMemes = async (
    startKey: number | null,
    limit: number,
  ): Promise<{memes: Meme[]; lastEvaluatedKey: number | null}> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the start index
      const startIndex = startKey !== null ? startKey : 0;

      // Slice the data to simulate pagination
      const slicedMemes = localMemes.data.slice(startIndex, startIndex + limit);

      // Map the slicedMemes to match the Meme type
      const mappedMemes: Meme[] = slicedMemes.map(meme => ({
        memeID: meme.memeID.toString(),
        mediaType: meme.mediaType,
        url: meme.url,
        caption: meme.caption,
        uploadTimestamp: new Date(meme.uploadTimestamp).toISOString(),
        likeCount: meme.likeCount,
        downloadCount: meme.downloadCount,
        commentCount: meme.commentCount,
        shareCount: Number(meme.shareCount),
        username: meme.username.toString(),
        profilePicUrl: meme.profilePicUrl,
        email: meme.email,
      }));

      // Determine the last evaluated key (for pagination)
      const newLastEvaluatedKey =
        startIndex + limit < localMemes.data.length ? startIndex + limit : null;

      return {
        memes: mappedMemes,
        lastEvaluatedKey: newLastEvaluatedKey,
      };
    } catch (err) {
      throw new Error('Failed to load memes');
    }
  };

  const fetchInitialMemes = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchMemes(null, PAGE_SIZE);
      setMemes(result.memes);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0);
    } catch (error) {
      setError('Failed to fetch memes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMoreMemes = useCallback(async () => {
    if (isLoadingMore || allMemesViewed) return;
    setIsLoadingMore(true);
    try {
      const result = await fetchMemes(lastEvaluatedKey, PAGE_SIZE);
      setMemes(prevMemes => [...prevMemes, ...result.memes]);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0 || !result.lastEvaluatedKey);
    } catch (error) {
      console.error('Error fetching more memes:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, allMemesViewed, lastEvaluatedKey]);

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
