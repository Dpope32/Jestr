import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchConversations as apiFetchConversations } from '../services/socialService';
import { Conversation, Message } from '../types/types'; 

interface InboxState {
  conversations: Conversation[];
  pinnedConversations: Conversation[];
  notifications: string[];
  isLoading: boolean;
  fetchConversations: (userEmail: string) => Promise<void>;
  pinConversation: (id: string) => void;
  unpinConversation: (id: string) => void;
  updateConversationMessages: (conversationId: string, messages: Message[]) => void;
  getConversationMessages: (conversationId: string) => Message[] | undefined;
  addMessageToConversation: (conversationId: string, message: Message) => void;
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
            messages: conv.messages || [],
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
      updateConversationMessages: (conversationId: string, messages: Message[]) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId ? { ...conv, messages } : conv
          )
        }));
      },
      getConversationMessages: (conversationId: string) => {
        const { conversations } = get();
        const conversation = conversations.find(conv => conv.id === conversationId);
        return conversation?.messages;
      },
      addMessageToConversation: (conversationId: string, message: Message) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [message, ...(conv.messages || [])],
                  lastMessage: message
                }
              : conv
          )
        }));
      },
    }),
    {
      name: 'inbox-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);