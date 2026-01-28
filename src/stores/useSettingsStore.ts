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

	// Cursors
	enableCustomCursors: boolean;
	cursors: {
		default: string;
		pointer: string;
		text: string;
		grab: string;
		grabbing: string;
	};
	hotspots: {
		default: { x: number; y: number };
		pointer: { x: number; y: number };
		text: { x: number; y: number };
		grab: { x: number; y: number };
		grabbing: { x: number; y: number };
	};
	enabledCursors: {
		default: boolean;
		pointer: boolean;
		text: boolean;
		grab: boolean;
		grabbing: boolean;
	};

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
	setEnableCustomCursors: (enabled: boolean) => void;
	setLanguage: (lang: 'pt-BR' | 'en-US') => void;
	setRestoreCursorPosition: (enabled: boolean) => void;
	setCursorPath: (type: 'default' | 'pointer' | 'text' | 'grab' | 'grabbing', path: string) => void;
	setCursorHotspot: (type: 'default' | 'pointer' | 'text' | 'grab' | 'grabbing', x: number, y: number) => void;
	setCursorEnabled: (type: 'default' | 'pointer' | 'text' | 'grab' | 'grabbing', enabled: boolean) => void;
	resetCursors: () => void;
	updateSettings: (partial: Partial<SettingsState>) => void;
	resetToDefaults: () => void;
}

export const defaultCursors = {
	default: '/cursors/default.svg',
	pointer: '/cursors/pointer.svg',
	text: '/cursors/text.svg',
	grab: '/cursors/grab.svg',
	grabbing: '/cursors/grabbing.svg',
};

export const defaultHotspots = {
	default: { x: 0, y: 0 },
	pointer: { x: 0, y: 0 },
	text: { x: 12, y: 12 }, // Centro aproximado para 24x24
	grab: { x: 12, y: 12 },
	grabbing: { x: 12, y: 12 },
};

export const defaultEnabledCursors = {
	default: false,
	pointer: false,
	text: true,
	grab: true,
	grabbing: true,
};

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
	enableCustomCursors: true,
	cursors: defaultCursors,
	hotspots: defaultHotspots,
	enabledCursors: defaultEnabledCursors,
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
			setEnableCustomCursors: (enableCustomCursors) => set({ enableCustomCursors }),
			setLanguage: (language) => set({ language }),
			setRestoreCursorPosition: (restoreCursorPosition) => set({ restoreCursorPosition }),

			setCursorPath: (type, path) => set((state) => ({
				cursors: { ...state.cursors, [type]: path }
			})),

			setCursorHotspot: (type, x, y) => set((state) => ({
				hotspots: {
					...state.hotspots,
					[type]: { x, y }
				}
			})),

			setCursorEnabled: (type, enabled) => set((state) => ({
				enabledCursors: {
					...state.enabledCursors,
					[type]: enabled
				}
			})),

			resetCursors: () => set({
				cursors: defaultCursors,
				hotspots: defaultHotspots,
				enabledCursors: defaultEnabledCursors
			}),

			updateSettings: (partial) => set(partial),

			resetToDefaults: () => set(defaultSettings),
		}),
		{
			name: 'smart-md-settings',
			version: 5, // Incremented version for migration
		}
	)
);
