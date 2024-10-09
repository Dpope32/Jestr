import {ProfileImage} from './types';

export interface InboxState {
  conversations: Conversation[];
  pinnedConversations: Conversation[];
  notifications: string[];
  isLoading: boolean;
  fetchConversations: (userEmail: string) => Promise<void>;
  pinConversation: (id: string) => void;
  unpinConversation: (id: string) => void;
  updateConversationMessages: (
    conversationId: string,
    messages: Message[],
  ) => void;
  getConversationMessages: (conversationId: string) => Message[] | undefined;
  addMessageToConversation: (conversationId: string, message: Message) => void;
  addConversation: (conversation: Conversation) => void;
  deleteConversation: (id: string) => void;
  resetUnreadCount: (conversationId: string) => void;
}

export interface ApiConversation {
  ConversationID: string;
  partnerUser: {
    email: string;
    username?: string;
    profilePic: string;
  };
  lastMessage: Message;
  messages?: Message[];
  UnreadCount: number;
  LastReadMessageID: string;
}

export type Message = {
  MessageID: string;
  SenderID: string;
  ReceiverID: string;
  Content: string | MemeShareContent;
  Timestamp: string;
  Status: 'sent' | 'delivered' | 'read';
  ConversationID: string;
  sentByMe?: boolean;
  read?: boolean;
  reactions?: string[];
};

export type MessageContent = string | MemeShareContent;

export type LastMessage = {
  Content: MessageContent;
  Timestamp: string;
};

export interface Conversation {
  id: string;
  ConversationID: string;
  userEmail: string;
  username: string;
  profilePicUrl: string | ProfileImage | null;
  lastMessage: LastMessage;
  timestamp: string;
  messages: Message[];
  UnreadCount: number;
  LastReadMessageID: string;
  partnerUser: {
    email: string;
    username: string | null;
    profilePic: string | null;
  };
}

export type MemeShareContent = {
  type: 'meme_share';
  memeID: string;
  message?: string;
  mediaType?: 'image' | 'video'; // Added mediaType
};
