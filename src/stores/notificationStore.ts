import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import zustandMMKVStorage from '../utils/zustandMMKVStorage';

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
    set => ({
      ...DEFAULT_SETTINGS,

      updateAllSettings: settings => {
        //   console.log('Updating all settings:', settings);
        set(state => {
          const newState = {...state, ...settings};
          //       console.log('New state after update:', newState);
          return newState;
        });
      },
      setNotificationPreferences: settings =>
        set(state => ({...state, ...settings})),
      resetToDefaults: () => {
        //    console.log('Resetting to default settings');
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
