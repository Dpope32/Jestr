import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CommentFeed from '../src/components/Modals/CommentFeed/CommentFeed';
import { Keyboard } from 'react-native';
import { User } from '../src/types/types'; // Import the User type
import useCommentFeed from '../src/components/Modals/CommentFeed/useCommentFeed';

// Mock the useCommentFeed hook
// Mock the useCommentFeed hook
jest.mock('../src/components/Modals/CommentFeed/useCommentFeed', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    newComment: '',
    setNewComment: jest.fn(),
    replyingTo: null,
    replyingToUsername: null,
    comments: [],
    isLoading: false,
    modalY: { current: 0 },
    inputRef: { current: null },
    keyboardHeight: { current: 0 },
    handleAddComment: jest.fn(),
    handleDeleteComment: jest.fn(),
    handleUpdateReaction: jest.fn(),
    handleReply: jest.fn(),
    cancelReply: jest.fn(),
    closeModal: jest.fn(),
  })),
}));

describe('CommentFeed', () => {
  const mockUser: User = {
    email: 'test@example.com',
    username: 'testuser',
    profilePic: 'https://example.com/profile.jpg',
    headerPic: 'https://example.com/header.jpg',
    followersCount: 0,
    followingCount: 0,
    displayName: 'Test User',
  };

  const mockProps = {
    memeID: '123',
    profilePicUrl: 'https://example.com/profile.jpg',
    user: mockUser,
    isCommentFeedVisible: true,
    toggleCommentFeed: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByPlaceholderText } = render(<CommentFeed {...mockProps} />);
    expect(getByPlaceholderText('Add a comment...')).toBeTruthy();
  });
  
    it('closes when clicking outside the modal', () => {
      const { getByTestId } = render(<CommentFeed {...mockProps} />);
      fireEvent.press(getByTestId('modal-backdrop'));
      expect(mockProps.toggleCommentFeed).toHaveBeenCalled();
    });
  
    it('calls handleAddComment when send button is pressed', () => {
      const mockHandleAddComment = jest.fn();
      jest.mocked(useCommentFeed).mockReturnValue({
        ...jest.mocked(useCommentFeed)(mockProps),
        handleAddComment: mockHandleAddComment,
      });
  
      const { getByTestId } = render(<CommentFeed {...mockProps} />);
      const sendButton = getByTestId('send-comment-button');
      fireEvent.press(sendButton);
      expect(mockHandleAddComment).toHaveBeenCalled();
    });
  
    it('renders comments when available', () => {
      const mockComments = [
        { id: '1', text: 'Test comment 1', user: { username: 'user1' } },
        { id: '2', text: 'Test comment 2', user: { username: 'user2' } },
      ];
      jest.mocked(useCommentFeed).mockReturnValue({
        ...jest.mocked(useCommentFeed)(mockProps),
        comments: mockComments,
      });
      const { getByText } = render(<CommentFeed {...mockProps} />);
      expect(getByText('Test comment 1')).toBeTruthy();
      expect(getByText('Test comment 2')).toBeTruthy();
    });
  
    it('adjusts input field position when keyboard shows', () => {
      const { getByTestId } = render(<CommentFeed {...mockProps} />);
      const inputContainer = getByTestId('input-container');
      const initialPosition = inputContainer.props.style.transform[0].translateY;
  
      act(() => {
        Keyboard.emit('keyboardWillShow', {
          endCoordinates: { height: 300 },
        });
      });
  
      const adjustedPosition = inputContainer.props.style.transform[0].translateY;
      expect(adjustedPosition).not.toBe(initialPosition);
    });
  });
