import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import zustandMMKVStorage from '../utils/zustandMMKVStorage';

interface PrivacySafetySettings {
  allowDMsFromEveryone: boolean;
  allowDMsFromFollowersOnly: boolean;
  allowSearchByEmail: boolean;
  allowSearchByPhone: boolean;
  blockedAccounts: string[];
  likesPublic: boolean;
}

interface AccessibilitySettings {
  fontSize: number;
  language: string;
  highContrastMode: boolean;
  reduceMotion: boolean;
}

interface SettingsStore {
  privacySafety: PrivacySafetySettings;
  accessibility: AccessibilitySettings;
  updatePrivacySafety: (settings: Partial<PrivacySafetySettings>) => void;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  blockAccount: (accountId: string) => void;
  unblockAccount: (accountId: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: {
  privacySafety: PrivacySafetySettings;
  accessibility: AccessibilitySettings;
} = {
  privacySafety: {
    allowDMsFromEveryone: false,
    allowDMsFromFollowersOnly: true,
    allowSearchByEmail: false,
    allowSearchByPhone: false,
    blockedAccounts: [],
    likesPublic: true,
  },
  accessibility: {
    fontSize: 1,
    language: 'en',
    highContrastMode: false,
    reduceMotion: false,
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,

      updatePrivacySafety: settings => {
        //    console.log('Updating Privacy Safety Settings...');
        set(state => {
          const newSettings = {...state.privacySafety, ...settings};
          //   console.log('Old Privacy Safety:', state.privacySafety);
          //    console.log('New Privacy Safety:', newSettings);
          return {privacySafety: newSettings};
        });
      },

      updateAccessibility: settings => {
        console.log('Updating Accessibility Settings...');
        set(state => {
          const newSettings = {...state.accessibility, ...settings};
          console.log('Old Accessibility:', state.accessibility);
          console.log('New Accessibility:', newSettings);
          return {accessibility: newSettings};
        });
      },

      blockAccount: accountId => {
        console.log(`Blocking Account: ${accountId}`);
        set(state => {
          const newBlockedAccounts = [
            ...state.privacySafety.blockedAccounts,
            accountId,
          ];
          console.log(
            'Blocked Accounts Before:',
            state.privacySafety.blockedAccounts,
          );
          console.log('Blocked Accounts After:', newBlockedAccounts);
          return {
            privacySafety: {
              ...state.privacySafety,
              blockedAccounts: newBlockedAccounts,
            },
          };
        });
      },

      unblockAccount: accountId => {
        console.log(`Unblocking Account: ${accountId}`);
        set(state => {
          const newBlockedAccounts = state.privacySafety.blockedAccounts.filter(
            id => id !== accountId,
          );
          console.log(
            'Blocked Accounts Before:',
            state.privacySafety.blockedAccounts,
          );
          console.log('Blocked Accounts After:', newBlockedAccounts);
          return {
            privacySafety: {
              ...state.privacySafety,
              blockedAccounts: newBlockedAccounts,
            },
          };
        });
      },

      resetToDefaults: () => {
        console.log('Resetting to Default Settings...');
        set(() => {
          console.log('Settings Reset to:', DEFAULT_SETTINGS);
          return DEFAULT_SETTINGS;
        });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
