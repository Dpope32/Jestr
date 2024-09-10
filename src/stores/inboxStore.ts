import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchConversations as apiFetchConversations } from '../services/socialService';
import { Conversation } from '../types/types'; 

interface InboxState {
  conversations: Conversation[];
  pinnedConversations: Conversation[];
  notifications: string[];
  isLoading: boolean;
  fetchConversations: (userEmail: string) => Promise<void>;
  pinConversation: (id: string) => void;
  unpinConversation: (id: string) => void;
}

export const useInboxStore = create<InboxState>()(
  persist(
    (set, get) => ({
      conversations: [],
      pinnedConversations: [],
      notifications: [],
      isLoading: false,
      fetchConversations: async (userEmail: string) => {
        set({ isLoading: true });
        const { conversations } = get();
        if (conversations.length > 0) {
          set({ isLoading: false });
          return;
        }
        try {
          const userConversations = await apiFetchConversations(userEmail);
          const formattedConversations: Conversation[] = userConversations.map((conv: any) => ({
            id: conv.ConversationID,
            ConversationID: conv.ConversationID,
            userEmail: conv.partnerUser.email,
            username: conv.partnerUser.username || conv.partnerUser.email,
            profilePicUrl: conv.partnerUser.profilePic,
            lastMessage: conv.lastMessage,
            timestamp: conv.lastMessage.Timestamp,
            messages: [],
            UnreadCount: conv.UnreadCount,
            LastReadMessageID: conv.LastReadMessageID,
            partnerUser: conv.partnerUser
          }));
          set({ conversations: formattedConversations, isLoading: false });
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
    }),
    {
      name: 'inbox-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);