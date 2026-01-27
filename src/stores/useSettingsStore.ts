import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Modos de visualização de marcadores Markdown
export type MarkdownViewMode = 'visible' | 'current-line' | 'hidden';

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

	// Smart Decorators
	markdownViewMode: MarkdownViewMode;  // Controle de visibilidade dos marcadores
	enableStatusColors: boolean;         // Pinta linhas de tarefas (✅, ⚠️)
	enableHighlightActiveLine: boolean;
	restoreCursorPosition: boolean;      // Salva/restaura posição do cursor ao trocar abas

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
	setRestoreCursorPosition: (enabled: boolean) => void;
	updateSettings: (partial: Partial<SettingsState>) => void;
	resetToDefaults: () => void;
}

export const defaultSettings = {
	theme: 'light' as const,
	fontSize: 14,
	fontFamily: 'system-ui, -apple-system, sans-serif',
	editorFontSize: 14,
	lineHeight: 1.6,
	autoSave: true,
	autoSaveInterval: 5000,
	showLineNumbers: false,
	enableWordWrap: true,
	enableMarkdownPreview: false,
	language: 'pt-BR' as const,
	// Smart Decorators defaults
	markdownViewMode: 'current-line' as MarkdownViewMode,
	enableStatusColors: true,
	enableHighlightActiveLine: true,
	restoreCursorPosition: true,
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
			setRestoreCursorPosition: (restoreCursorPosition) => set({ restoreCursorPosition }),
			updateSettings: (partial) => set(partial),

			resetToDefaults: () => set(defaultSettings),
		}),
		{
			name: 'smart-md-settings',
			version: 3,
		}
	)
);
