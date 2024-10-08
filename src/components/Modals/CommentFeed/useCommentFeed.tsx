// useCommentFeed.ts
import {useState, useRef, useEffect} from 'react';
import {Keyboard, TextInput, Animated, Dimensions} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
// import {useTabBarStore} from '../../../stores/tabBarStore';

import {
  fetchComments,
  postComment,
  deleteComment,
  updateCommentReaction,
  organizeCommentsIntoThreads,
} from '../../../services/commentServices';
import {Meme} from '../../../types/types';

import {User, ProfileImage, CommentType} from '../../../types/types';
// import {CommentType} from './CommentFeed';

const screenHeight = Dimensions.get('window').height;

type UseCommentFeedProps = {
  memeID: string;
  userEmail: string;
  user: User | null;
  isCommentFeedVisible: boolean;
  toggleCommentFeed: () => void;
};

type UseCommentFeedReturn = {
  newComment: string;
  setNewComment: (text: string) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyingToUsername: string | null;
  setReplyingToUsername: (username: string | null) => void;
  modalY: Animated.Value;
  inputRef: React.RefObject<TextInput>;
  comments: CommentType[];
  isLoading: boolean;
  isError: boolean;
  handleAddComment: () => void;
  handleDeleteComment: (commentID: string) => void;
  handleUpdateReaction: (
    commentID: string,
    reaction: 'like' | 'dislike' | null,
  ) => void;
  handleReply: (commentID: string, username: string) => void;
  cancelReply: () => void;
  closeModal: () => void;
};

const useCommentFeed = ({
  memeID,
  user,
  isCommentFeedVisible,
  toggleCommentFeed,
  userEmail,
}: UseCommentFeedProps): UseCommentFeedReturn => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(
    null,
  );
  const modalY = useRef(new Animated.Value(screenHeight)).current;
  const inputRef = useRef<TextInput>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isCommentFeedVisible) {
      Animated.timing(modalY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isCommentFeedVisible, modalY]);

  // QUERY: Fetch comments for memeID
  const {
    data: fetchedComments = [],
    isLoading,
    isError,
  } = useQuery({
    enabled: isCommentFeedVisible,
    queryKey: ['comments', memeID],
    queryFn: () => fetchComments(memeID),
  });

  // Organize comments into threads
  const comments = organizeCommentsIntoThreads(fetchedComments || []);

  // MUTATION: Post a new comment
  const postCommentMutation = useMutation({
    mutationFn: (newCommentData: {text: string; replyingTo: string | null}) =>
      postComment(
        memeID,
        newCommentData.text,
        user!,
        newCommentData.replyingTo || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['comments', memeID]});
      setNewComment('');
      setReplyingTo(null);

      queryClient.setQueryData(['memez', userEmail], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            memes: page.memes.map((meme: Meme) => {
              if (meme.memeID === memeID) {
                return {
                  ...meme,
                  commentCount: meme.commentCount + 1,
                };
              }
              return meme;
            }),
          })),
        };
      });
    },
    onError: error => {
      console.error('Failed to post comment:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['comments', memeID]});
    },
  });

  // MUTATION: Update comment reaction
  const updateCommentReactionMutation = useMutation({
    mutationFn: (params: {
      commentID: string;
      reaction: 'like' | 'dislike' | null;
    }) =>
      updateCommentReaction(
        params.commentID,
        memeID,
        params.reaction === 'like',
        params.reaction === 'dislike',
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['comments', memeID]});
    },
    onError: error => {
      console.error('Failed to update comment reaction:', error);
    },
  });

  // Mutation for deleting a comment
  const deleteCommentMutation = useMutation({
    mutationFn: (commentID: string) =>
      deleteComment(commentID, memeID, userEmail),
    onSuccess: () => {
      queryClient.setQueryData(['memez', userEmail], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            memes: page.memes.map((meme: Meme) => {
              if (meme.memeID === memeID) {
                return {
                  ...meme,
                  commentCount: meme.commentCount - 1,
                };
              }
              return meme;
            }),
          })),
        };
      });
    },
    onError: error => {
      console.error('Failed to DELETE comment:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['comments', memeID]});
    },
  });

  const handleAddComment = () => {
    if (newComment.trim() !== '' && user) {
      postCommentMutation.mutate({text: newComment, replyingTo});
    } else if (!user) {
      console.error('User is null, cannot post comment.');
    }
  };

  const handleDeleteComment = (commentID: string) => {
    deleteCommentMutation.mutate(commentID);
  };

  const handleUpdateReaction = (
    commentID: string,
    reaction: 'like' | 'dislike' | null,
  ) => {
    updateCommentReactionMutation.mutate({commentID, reaction});
  };

  const handleReply = (commentID: string, username: string) => {
    setReplyingTo(commentID);
    setReplyingToUsername(username);
    setNewComment(`@${username} `);
    inputRef.current?.focus();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyingToUsername(null);
    setNewComment('');
  };

  const closeModal = () => {
    Keyboard.dismiss();
    Animated.timing(modalY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      toggleCommentFeed();
    });
  };

  return {
    isError,
    newComment,
    setNewComment,
    replyingTo,
    setReplyingTo,
    replyingToUsername,
    setReplyingToUsername,
    modalY,
    inputRef,
    comments,
    isLoading,
    handleAddComment,
    handleDeleteComment,
    handleUpdateReaction,
    handleReply,
    cancelReply,
    closeModal,
  };
};

export default useCommentFeed;
