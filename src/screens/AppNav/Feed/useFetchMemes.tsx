import {
  useInfiniteQuery,
  InfiniteData,
  QueryClient,
} from '@tanstack/react-query';
import axios from 'axios';
import {useMemo} from 'react';

import {API_URL} from '../../../services/config';
import {FetchMemesResult, Meme} from '../../../types/types';
import { useFollowStore } from '../../../stores/followStore';

export const fetchMemes = async (
  lastEvaluatedKey: string | null = null,
  userEmail: string,
  limit: number = 10,
  accessToken: string,
): Promise<FetchMemesResult> => {
 // console.log(
 //   `fetchMemes called for user: ${userEmail}, lastEvaluatedKey: ${lastEvaluatedKey}`,
 // );

  //console.log('Fetching new data from API');

  try {
    const response = await axios.post(
      `${API_URL}/fetchMemes`,
      {
        operation: 'fetchMemes',
        lastEvaluatedKey,
        userEmail,
        limit,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // console.log('Fetch memes response:', response.data);

    const result = {
      memes: response.data.data.memes.map((meme: Meme) => ({
        ...meme,
        isFollowed: meme.isFollowed || false,
      })),
      lastEvaluatedKey: response.data.data.lastViewedMemeId || null,
    };

    console.log(
      `Fetched ${result.memes.length} memes`,
    );
    return result;
  } catch (error) {
  //  console.error('Error fetching memes:', error);
    return {memes: [], lastEvaluatedKey: null};
  }
};

export const pruneCache = (
  queryClient: QueryClient,
  userEmail: string,
  lastViewedIndex: number,
) => {
  const queryKey = ['memez', userEmail];
  const queryData =
    queryClient.getQueryData<InfiniteData<FetchMemesResult>>(queryKey);

  if (queryData) {
    const { pages, pageParams } = queryData;

    // Find the page index where lastViewedIndex is
    let cumulativeIndex = 0;
    let pageIndexToKeep = 0;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageLength = page.memes.length;
      if (
        lastViewedIndex >= cumulativeIndex &&
        lastViewedIndex < cumulativeIndex + pageLength
      ) {
        pageIndexToKeep = i;
        break;
      }
      cumulativeIndex += pageLength;
    }

    // Adjusted to keep pages before and after the current page
    const startPageIndex = Math.max(pageIndexToKeep - 2, 0);
    const endPageIndex = Math.min(pageIndexToKeep + 2, pages.length - 1);

    const pagesToKeep = pages.slice(startPageIndex, endPageIndex + 1);
    const pageParamsToKeep = pageParams.slice(
      startPageIndex,
      endPageIndex + 1,
    );

    // Update the query data
    const newQueryData: InfiniteData<FetchMemesResult> = {
      pages: pagesToKeep,
      pageParams: pageParamsToKeep,
    };

    queryClient.setQueryData(queryKey, newQueryData);

    //console.log(`Cache pruned. Pages kept: ${pagesToKeep.length}, from index ${startPageIndex} to ${endPageIndex}`);
  }
};

interface UseFetchMemesOptions {
  accessToken: string | null;
  userEmail: string;
  lastViewedMemeId: string | null;
}

export const useFetchMemes = ({
  accessToken,
  userEmail,
  lastViewedMemeId,
}: UseFetchMemesOptions) => {
  const following = useFollowStore(state => state.following);
  const followedEmails = following.map(user => user.email);
  const queryResult = useInfiniteQuery({
    enabled: !!accessToken,
    queryKey: ['memez', userEmail],
    queryFn: async ({pageParam = null}) => {
      return fetchMemes(pageParam, userEmail, 10, accessToken as string);
    },
    initialPageParam: lastViewedMemeId || null,
    getNextPageParam: lastPage => {
      if (lastPage && lastPage.lastEvaluatedKey) {
        return lastPage.lastEvaluatedKey;
      }
      return undefined;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const memes = useMemo(() => {
    if (queryResult.data?.pages) {
      return queryResult.data.pages.flatMap(page =>
        page.memes.map(meme => ({
          ...meme,
          isFollowed: followedEmails.includes(meme.email),
        })),
      );
    }
    return [];
  }, [queryResult.data, followedEmails]);

  return {
    ...queryResult,
    memes,
  };
};