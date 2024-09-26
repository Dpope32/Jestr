// notificationStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the structure for individual notifications
export interface Notification {
  id: number; // Ensure this is unique for each notification
  title: string;
  message: string;
  read: boolean;
  timestamp: string; // ISO string or any preferred format
  // Add any other fields as necessary
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  newFollowerNotif: boolean;
  newCommentNotif: boolean;
  newLikeNotif: boolean;
  mentionNotif: boolean;
  dailyDigest: boolean;
}

interface NotificationStore extends NotificationSettings {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number) => void;
  setNotificationPreferences: (settings: Partial<NotificationSettings>) => void;
  updateAllSettings: (settings: Partial<NotificationSettings>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  newFollowerNotif: true,
  newCommentNotif: true,
  newLikeNotif: true,
  mentionNotif: true,
  dailyDigest: false,
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      notifications: [], // Initialize with an empty array or default notifications

      // Method to set the entire notifications array
      setNotifications: (notifications: Notification[]) => set({ notifications }),

      // Method to add a single notification
      addNotification: (notification: Notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      // Method to mark a notification as read
      markAsRead: (notificationId: number) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          ),
        })),

      // Existing methods for notification settings
      updateAllSettings: (settings) => {
        set((state) => ({
          ...state,
          ...settings,
        }));
      },
      setNotificationPreferences: (settings) =>
        set((state) => ({
          ...state,
          ...settings,
        })),
      resetToDefaults: () => {
        set({
          ...DEFAULT_SETTINGS,
          notifications: [],
        });
      },
    }),
    {
      name: 'notification-storage', // Name of the storage item
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
