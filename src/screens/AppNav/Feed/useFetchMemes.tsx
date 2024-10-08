import {
  useInfiniteQuery,
  InfiniteData,
  QueryClient,
} from '@tanstack/react-query';
import axios from 'axios';
import {useMemo} from 'react';

import {API_URL} from '../../../services/config';
import {FetchMemesResult, Meme} from '../../../types/types';

export const fetchMemes = async (
  lastEvaluatedKey: string | null = null,
  userEmail: string,
  limit: number = 10,
  accessToken: string,
): Promise<FetchMemesResult> => {
  console.log(
    `fetchMemes called for user: ${userEmail}, lastEvaluatedKey: ${lastEvaluatedKey}`,
  );

  console.log('Fetching new data from API');

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
      `Fetched ${result.memes.length} memes, new lastViewedMemeId: ${result.lastEvaluatedKey}`,
    );
    return result;
  } catch (error) {
    console.error('Error fetching memes:', error);
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
    const {pages, pageParams} = queryData;

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

    // Keep up to 2 pages from pageIndexToKeep
    const pagesToKeep = pages.slice(pageIndexToKeep, pageIndexToKeep + 2);
    const pageParamsToKeep = pageParams.slice(
      pageIndexToKeep,
      pageIndexToKeep + 2,
    );

    // Update the query data
    const newQueryData: InfiniteData<FetchMemesResult> = {
      pages: pagesToKeep,
      pageParams: pageParamsToKeep,
    };

    queryClient.setQueryData(queryKey, newQueryData);

    console.log('Cache pruned. Pages kept:', pagesToKeep.length);
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
    // console.log('Data useMEMO:', queryResult.data);
    if (queryResult.data?.pages) {
      return queryResult.data.pages.flatMap(page => page.memes);
    }
    return [];
  }, [queryResult.data]);

  return {
    ...queryResult,
    memes,
  };
};
