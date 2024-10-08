// notificationStore.ts

import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import zustandMMKVStorage from '../utils/zustandMMKVStorage';

// Define the structure for individual notifications
export interface Notification {
  id: number;
  message: string;
  read: boolean;
  timestamp: string;
  profilePicUrl: string;
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

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
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

const mockNotifications: Notification[] = [
  {
    id: 1,
    message: 'John Doe liked your meme',
    read: false,
    timestamp: '2h ago',
    profilePicUrl: '4.png',
  },
  {
    id: 2,
    message: 'Jane Smith commented on your post',
    read: false,
    timestamp: '5h ago',
    profilePicUrl: '3.png',
  },
  {
    id: 3,
    message: 'Mike Johnson started following you',
    read: true,
    timestamp: '1d ago',
    profilePicUrl: '1.png',
  },
  {
    id: 4,
    message: 'Sarah Brown mentioned you in a comment',
    read: true,
    timestamp: '2d ago',
    profilePicUrl: '2.png',
  },
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      notifications: mockNotifications,

      setNotifications: (notifications: Notification[]) => set({notifications}),

      addNotification: (notification: Notification) =>
        set(state => ({
          notifications: [notification, ...state.notifications],
        })),

      markAsRead: (notificationId: number) =>
        set(state => ({
          notifications: state.notifications.map(notif =>
            notif.id === notificationId ? {...notif, read: true} : notif,
          ),
        })),

      markAllAsRead: () =>
        set(state => ({
          notifications: state.notifications.map(notif => ({
            ...notif,
            read: true,
          })),
        })),

      updateAllSettings: settings => {
        set(state => ({
          ...state,
          ...settings,
        }));
      },
      setNotificationPreferences: settings =>
        set(state => ({
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
      name: 'notification-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
