// inboxStore.ts
import create from 'zustand';
import { fetchConversations } from '../../services/authFunctions';
import {Conversation} from '../Inbox/Conversations';

interface InboxState {
  conversations: Conversation[];
  pinnedConversations: Conversation[];
  notifications: string[];
  isLoading: boolean;
  fetchConversations: (userEmail: string) => Promise<void>;
  pinConversation: (id: string) => void;
  unpinConversation: (id: string) => void;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  conversations: [],
  pinnedConversations: [],
  notifications: [],
  isLoading: false,
  fetchConversations: async (userEmail: string) => {
    set({ isLoading: true });
    try {
      const userConversations = await fetchConversations(userEmail);
      set({ conversations: userConversations, isLoading: false });
    } catch (error) {
      console.error('Error loading conversations:', error);
      set({ isLoading: false });
    }
  },
  pinConversation: (id: string) => {
    const { conversations, pinnedConversations } = get();
    const conversationToPin = conversations.find(conv => conv.id === id);
    if (conversationToPin) {
      set({
        pinnedConversations: [...pinnedConversations, conversationToPin],
        conversations: conversations.filter(conv => conv.id !== id)
      });
    }
  },
  unpinConversation: (id: string) => {
    const { conversations, pinnedConversations } = get();
    const conversationToUnpin = pinnedConversations.find(conv => conv.id === id);
    if (conversationToUnpin) {
      set({
        conversations: [...conversations, conversationToUnpin],
        pinnedConversations: pinnedConversations.filter(conv => conv.id !== id)
      });
    }
  },
}));