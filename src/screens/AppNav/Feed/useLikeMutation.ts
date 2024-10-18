// src/screens/AppNav/Feed/useLikeMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../Badges/Badges.types';
import { useBadgeStore } from '../../../stores/badgeStore';
import { API_URL } from '../../../services/config';

export const useLikeMutation = (userEmail: string) => {
  const queryClient = useQueryClient();
  const badgeStore = useBadgeStore();

  return useMutation<
    { badgeEarned: Badge | null },
    Error,
    {
      memeID: string;
      incrementLikes: boolean;
      email: string;
      doubleLike: boolean;
      incrementDownloads: boolean;
    }
  >({
    mutationFn: async ({ memeID, incrementLikes, email, doubleLike, incrementDownloads }) => {
      const response = await fetch(`${API_URL}/updateMemeReaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'updateMemeReaction',
          memeID,
          incrementLikes,
          doubleLike,
          incrementDownloads,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update meme reaction');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      badgeStore.incrementCount('likeCount', userEmail);
      const queryKey = ['memez', userEmail];
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPages = oldData.pages.map((page: any) => {
          const updatedMemes = page.memes.map((meme: any) => {
            if (meme.memeID === variables.memeID) {
              const currentLikeCount =
                typeof meme.likeCount === 'number' ? meme.likeCount : Number(meme.likeCount) || 0;
              const newLikeCount = variables.incrementLikes
                ? currentLikeCount + 1
                : currentLikeCount - 1;
              const finalLikeCount = newLikeCount < 0 ? 0 : newLikeCount;

              console.log(
                `Updating Meme ID: ${meme.memeID}, Current Like Count: ${currentLikeCount}, New Like Count: ${finalLikeCount}`
              );

              return {
                ...meme,
                likeCount: finalLikeCount,
                likedByUser: variables.incrementLikes,
              };
            }
            return meme;
          });
          return { ...page, memes: updatedMemes };
        });

        const updatedData = { ...oldData, pages: updatedPages };
      //  console.log(`Old data: ${JSON.stringify(oldData)}`);
      //  console.log(`Updated data: ${JSON.stringify(updatedData)}`);
        return updatedData;
      });

      if (data.badgeEarned) {
        console.log('Badge earned:', data.badgeEarned);
      }
    },
    onError: (error) => {
      console.error('Error in likeMutation:', error);
    },
  });
};
