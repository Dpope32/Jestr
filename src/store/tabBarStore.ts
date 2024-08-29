import {create} from 'zustand';

type TabBarStore = {
  isTabBarVisible: boolean;
  setTabBarVisibility: (isVisible: boolean) => void;
};

export const useTabBarStore = create<TabBarStore>(set => ({
  isTabBarVisible: true,
  setTabBarVisibility: isVisible => set({isTabBarVisible: isVisible}),
}));
