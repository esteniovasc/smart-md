import { create } from 'zustand';

export interface Tab {
  id: string;
  title: string;
  content: string;
  path?: string;
  isModified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  
  // Actions
  createTab: (title?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  updateTabTitle: (id: string, title: string) => void;
  updateTabPath: (id: string, path: string) => void;
  markTabAsClean: (id: string) => void;
  closeAllTabs: () => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  getTabs: () => Tab[];
  getActiveTab: () => Tab | undefined;
  getTabById: (id: string) => Tab | undefined;
}

// Simple UUID-like function (without external dependency)
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  createTab: (title = 'Untitled') => {
    const newTab: Tab = {
      id: generateId(),
      title,
      content: '',
      isModified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  closeTab: (id: string) => {
    set((state) => {
      const filteredTabs = state.tabs.filter((tab) => tab.id !== id);
      let newActiveTabId = state.activeTabId;

      // Se a aba fechada era a ativa, seleciona a próxima ou anterior
      if (state.activeTabId === id) {
        const closedIndex = state.tabs.findIndex((tab) => tab.id === id);
        if (filteredTabs.length > 0) {
          const nextIndex = Math.min(closedIndex, filteredTabs.length - 1);
          newActiveTabId = filteredTabs[nextIndex].id;
        } else {
          newActiveTabId = null;
        }
      }

      return {
        tabs: filteredTabs,
        activeTabId: newActiveTabId,
      };
    });
  },

  setActiveTab: (id: string) => {
    set((state) => ({
      activeTabId: state.tabs.some((tab) => tab.id === id) ? id : state.activeTabId,
    }));
  },

  updateTabContent: (id: string, content: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? { ...tab, content, isModified: true, updatedAt: Date.now() }
          : tab
      ),
    }));
  },

  updateTabTitle: (id: string, title: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? { ...tab, title, isModified: true, updatedAt: Date.now() }
          : tab
      ),
    }));
  },

  updateTabPath: (id: string, path: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? { ...tab, path, updatedAt: Date.now() }
          : tab
      ),
    }));
  },

  markTabAsClean: (id: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? { ...tab, isModified: false }
          : tab
      ),
    }));
  },

  closeAllTabs: () => {
    set({
      tabs: [],
      activeTabId: null,
    });
  },

  reorderTabs: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newTabs = [...state.tabs];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      return { tabs: newTabs };
    });
  },

  getTabs: () => get().tabs,
  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((tab) => tab.id === activeTabId);
  },
  getTabById: (id: string) => {
    return get().tabs.find((tab) => tab.id === id);
  },
}));
