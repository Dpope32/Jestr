// useCommentFeed.ts
import { useState, useRef, useEffect } from 'react';
import { Keyboard, TextInput, Animated, Dimensions } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useTabBarStore } from '../../../stores/tabBarStore';

import { fetchComments, postComment, deleteComment, updateCommentReaction, organizeCommentsIntoThreads,} from '../../../services/commentServices';

import { User, ProfileImage, CommentType } from '../../../types/types';

const screenHeight = Dimensions.get('window').height;

type UseCommentFeedProps = {
  memeID: string;
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
  handleAddComment: () => void;
  handleDeleteComment: (commentID: string) => void;
  handleUpdateReaction: (commentID: string, reaction: 'like' | 'dislike' | null) => void;
  handleReply: (commentID: string, username: string) => void;
  cancelReply: () => void;
  closeModal: () => void;
};

const useCommentFeed = ({
  memeID,
  user,
  isCommentFeedVisible,
  toggleCommentFeed,
}: UseCommentFeedProps): UseCommentFeedReturn => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
  const modalY = useRef(new Animated.Value(screenHeight)).current;
  const inputRef = useRef<TextInput>(null);
  const queryClient = useQueryClient();
  const setCommentModalVisible = useTabBarStore(
    (state) => state.setCommentModalVisible,
  );

  useEffect(() => {
    setCommentModalVisible(isCommentFeedVisible);

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

    return () => {
      setCommentModalVisible(false);
    };
  }, [isCommentFeedVisible, setCommentModalVisible, modalY]);

  // Fetch comments
  const { data: fetchedComments = [], isLoading } = useQuery<CommentType[]>({
    queryKey: ['comments', memeID],
    queryFn: () => fetchComments(memeID),
    enabled: isCommentFeedVisible,
  });

  // Organize comments into threads
  const comments = organizeCommentsIntoThreads(fetchedComments || []);

  // Mutation for posting a comment
  const postCommentMutation = useMutation({
    mutationFn: (newCommentData: {
      text: string;
      replyingTo: string | null;
    }) =>
      postComment(
        memeID,
        newCommentData.text,
        user!,
        newCommentData.replyingTo || undefined,
      ),
    onMutate: async (newCommentData) => {
      await queryClient.cancelQueries({ queryKey: ['comments', memeID] });
      const previousComments = queryClient.getQueryData<CommentType[]>([
        'comments',
        memeID,
      ]);
      const optimisticComment: CommentType = {
        commentID: Math.random().toString(),
        text: newCommentData.text,
        username: user!.username,
        profilePicUrl: user!.profilePic,
        likesCount: 0,
        dislikesCount: 0,
        timestamp: new Date().toISOString(),
        parentCommentID: newCommentData.replyingTo,
        email: user!.email,
        replies: [],
        userReaction: null,
      };
      queryClient.setQueryData(['comments', memeID], (old: any) =>
        old ? [optimisticComment, ...old] : [optimisticComment],
      );
      setNewComment('');
      setReplyingTo(null);
      setReplyingToUsername(null);
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['comments', memeID],
          context.previousComments,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', memeID] });
    },
  });

  const handleAddComment = () => {
    if (newComment.trim() !== '' && user) {
      postCommentMutation.mutate({ text: newComment, replyingTo });
    } else if (!user) {
      console.error('User is null, cannot post comment.');
    }
  };

  // Mutation for deleting a comment
  const deleteCommentMutation = useMutation({
    mutationFn: (commentID: string) =>
      deleteComment(commentID, memeID, user!.email),
    onMutate: async (commentID) => {
      await queryClient.cancelQueries({ queryKey: ['comments', memeID] });
      const previousComments = queryClient.getQueryData<CommentType[]>([
        'comments',
        memeID,
      ]);
      queryClient.setQueryData(['comments', memeID], (old: any) =>
        old?.filter((comment: CommentType) => comment.commentID !== commentID),
      );
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['comments', memeID],
          context.previousComments,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', memeID] });
    },
  });

  const handleDeleteComment = (commentID: string) => {
    if (user) {
      deleteCommentMutation.mutate(commentID);
    }
  };

  // Mutation for updating comment reactions
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
        user!.email,
      ),
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: ['comments', memeID] });
      const previousComments = queryClient.getQueryData<CommentType[]>([
        'comments',
        memeID,
      ]);

      queryClient.setQueryData(['comments', memeID], (old: any) =>
        old?.map((comment: CommentType) => {
          if (comment.commentID === params.commentID) {
            let likesCount = comment.likesCount;
            let dislikesCount = comment.dislikesCount;

            if (comment.userReaction === 'like') {
              likesCount -= 1;
            } else if (comment.userReaction === 'dislike') {
              dislikesCount -= 1;
            }

            if (params.reaction === 'like') {
              likesCount += 1;
            } else if (params.reaction === 'dislike') {
              dislikesCount += 1;
            }

            return {
              ...comment,
              likesCount,
              dislikesCount,
              userReaction: params.reaction,
            };
          } else {
            return comment;
          }
        }),
      );
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['comments', memeID],
          context.previousComments,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', memeID] });
    },
  });

  const handleUpdateReaction = (
    commentID: string,
    reaction: 'like' | 'dislike' | null,
  ) => {
    if (user) {
      updateCommentReactionMutation.mutate({ commentID, reaction });
    }
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