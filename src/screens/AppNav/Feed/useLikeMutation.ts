import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUpdateMemeReaction } from '../../../services/reactionServices';
import { Badge } from '../Badges/Badges.types';
import { useBadgeStore } from '../../../stores/badgeStore';

export const useLikeMutation = (userEmail: string) => {
  const queryClient = useQueryClient();
  const updateMemeReactionMutation = useUpdateMemeReaction();
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
    mutationFn: (variables) => {
      return updateMemeReactionMutation.mutateAsync(variables);
    },
    onSuccess: (data, variables) => {
      badgeStore.incrementLikeCount(userEmail)
      const queryKey = ['memez', userEmail];
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        console.log('oldData:', oldData);

        const updatedPages = oldData.pages.map((page: any) => {
          const updatedMemes = page.memes.map((meme: any) => {
            if (meme.memeID === variables.memeID) {
              const newLikeCount =
                meme.likeCount + (variables.incrementLikes ? 1 : -1);
              return {
                ...meme,
                likeCount: newLikeCount,
                likedByUser: variables.incrementLikes,
              };
            }
            return meme;
          });
          return {...page, memes: updatedMemes};
        });

        return {...oldData, pages: updatedPages};
      });

      // Handle the badgeEarned logic here if needed
      if (data.badgeEarned) {
        console.log('Badge earned:', data.badgeEarned);

      }
    },
    onError: (error) => {
      console.error('Error in likeMutation:', error);
    },
  });
};