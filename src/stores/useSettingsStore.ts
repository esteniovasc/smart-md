import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  theme: 'dark' | 'light';
  fontSize: number;
  fontFamily: string;
  editorFontSize: number;
  lineHeight: number;
  autoSave: boolean;
  autoSaveInterval: number; // em ms
  showLineNumbers: boolean;
  enableWordWrap: boolean;
  enableMarkdownPreview: boolean;
  language: 'pt-BR' | 'en-US';

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setEditorFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setAutoSave: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  setShowLineNumbers: (show: boolean) => void;
  setEnableWordWrap: (enabled: boolean) => void;
  setEnableMarkdownPreview: (enabled: boolean) => void;
  setLanguage: (lang: 'pt-BR' | 'en-US') => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  theme: 'dark' as const,
  fontSize: 14,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  editorFontSize: 14,
  lineHeight: 1.6,
  autoSave: true,
  autoSaveInterval: 5000,
  showLineNumbers: true,
  enableWordWrap: true,
  enableMarkdownPreview: false,
  language: 'pt-BR' as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, _get) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setEditorFontSize: (editorFontSize) => set({ editorFontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setAutoSaveInterval: (autoSaveInterval) => set({ autoSaveInterval }),
      setShowLineNumbers: (showLineNumbers) => set({ showLineNumbers }),
      setEnableWordWrap: (enableWordWrap) => set({ enableWordWrap }),
      setEnableMarkdownPreview: (enableMarkdownPreview) => set({ enableMarkdownPreview }),
      setLanguage: (language) => set({ language }),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'smart-md-settings',
      version: 1,
    }
  )
);
