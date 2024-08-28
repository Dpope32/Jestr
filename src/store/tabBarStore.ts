import {create} from 'zustand';

type TabBarStore = {
  isTabBarVisible: boolean;
  setTabBarVisibility: (isVisible: boolean) => void;
  isSidePanelVisible: boolean;
  setSidePanelVisibility: (isVisible: boolean) => void;
};

export const useTabBarStore = create<TabBarStore>(set => ({
  isTabBarVisible: true,
  setTabBarVisibility: isVisible => set({isTabBarVisible: isVisible}),
  isSidePanelVisible: false,
  setSidePanelVisibility: isVisible => set({isSidePanelVisible: isVisible}),
}));
