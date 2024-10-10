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
      console.log('Mutation function called with variables:', variables);
      return updateMemeReactionMutation.mutateAsync(variables);
    },
    onSuccess: (data, variables) => {
      console.log('onSuccess called with data:', data);
      console.log('onSuccess called with variables:', variables);

      badgeStore.incrementLikeCount(userEmail);
      const queryKey = ['memez', userEmail];
      queryClient.setQueryData(queryKey, (oldData: any) => {
        console.log('oldData before updating:', oldData);

        if (!oldData) return oldData;

        const updatedPages = oldData.pages.map((page: any) => {
          const updatedMemes = page.memes.map((meme: any) => {
            if (meme.memeID === variables.memeID) {
              const newLikeCount =
                meme.likeCount + (variables.incrementLikes ? 1 : -1);
              console.log('Updating meme like count for memeID:', meme.memeID, 'New likeCount:', newLikeCount);

              return {
                ...meme,
                likeCount: newLikeCount,
                likedByUser: variables.incrementLikes,
              };
            }
            return meme;
          });
          return { ...page, memes: updatedMemes };
        });

        const updatedData = { ...oldData, pages: updatedPages };
        console.log('Updated data after setQueryData:', updatedData);
        return updatedData;
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
