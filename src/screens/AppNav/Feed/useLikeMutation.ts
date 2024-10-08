import {useMutation, useQueryClient} from '@tanstack/react-query';
import {updateMemeReaction} from '../../../services/memeService';

export const useLikeMutation = (userEmail: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memeID,
      incrementLikes,
      email,
      doubleLike,
      incrementDownloads,
    }: {
      memeID: string;
      incrementLikes: boolean;
      email: string;
      doubleLike: boolean;
      incrementDownloads: boolean;
    }) =>
      updateMemeReaction({
        memeID,
        incrementLikes,
        email,
        doubleLike,
        incrementDownloads,
      }),
    onSuccess: (data, variables) => {
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
    },
    onError: error => {
      console.error('Error in likeMutation:', error);
    },
  });
};
