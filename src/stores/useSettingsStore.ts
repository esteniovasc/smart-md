import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSuggestedColor } from '../utils/colorUtils';

// Modos de visualização de marcadores Markdown
export type MarkdownViewMode = 'visible' | 'current-line' | 'hidden';


// Configuração de Marcadores de Lista
export interface ListMarkerConfig {
	enabled: boolean;
	color: string; // Cor ativa atual
	customIcon?: string; // Base64 ou URL
	lightColor?: string; // Cor persistida para modo claro
	darkColor?: string;  // Cor persistida para modo escuro
}

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

	// List Markers Customization
	listMarkers: {
		'*': ListMarkerConfig;
		'-': ListMarkerConfig;
		'+': ListMarkerConfig;
	};

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

	// Background
	appBackgroundColor: string; // Global App Background
	editorBackgroundColor: string; // Editor Specific Background
	enableDynamicBackground: boolean;
	spotlightRadius: number; // Radius in pixels

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

	setListMarkerConfig: (char: '*' | '-' | '+', config: Partial<ListMarkerConfig>) => void;

	setCursorPath: (type: 'default' | 'pointer' | 'text' | 'grab' | 'grabbing', path: string) => void;
	setCursorHotspot: (type: 'default' | 'pointer' | 'text' | 'grab' | 'grabbing', x: number, y: number) => void;
	setCursorEnabled: (type: 'default' | 'pointer' | 'text' | 'grab' | 'grabbing', enabled: boolean) => void;
	resetCursors: () => void;

	// Background Actions
	setAppBackgroundColor: (color: string) => void;
	setEditorBackgroundColor: (color: string) => void;
	setEnableDynamicBackground: (enabled: boolean) => void;
	setSpotlightRadius: (radius: number) => void;

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

export const defaultListMarkers = {
	'*': { enabled: true, color: '', lightColor: '', darkColor: '' },
	'-': { enabled: true, color: '', lightColor: '', darkColor: '' },
	'+': { enabled: false, color: '', lightColor: '', darkColor: '' },
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

	// Markers Defaults
	listMarkers: defaultListMarkers,

	enableCustomCursors: true,
	cursors: defaultCursors,
	hotspots: defaultHotspots,
	enabledCursors: defaultEnabledCursors,

	// Background Defaults
	appBackgroundColor: '', // Global
	editorBackgroundColor: '', // Editor
	enableDynamicBackground: true,
	spotlightRadius: 600,
};

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set, _get) => ({
			...defaultSettings,

			setTheme: (theme) => set((state) => {
				// Ao trocar o tema, atualiza as cores dos marcadores
				const newListMarkers: Record<string, ListMarkerConfig> = {};

				(Object.keys(state.listMarkers) as Array<keyof typeof state.listMarkers>).forEach((key) => {
					// CRITICAL: Clone the object to avoid mutating previous state
					const oldMarker = state.listMarkers[key];
					const newMarker = { ...oldMarker };

					const isGoingToDark = theme === 'dark';

					// 1. Salva a cor atual no slot do tema ANTERIOR (se aplicável)
					if (state.theme === 'light') newMarker.lightColor = oldMarker.color;
					else newMarker.darkColor = oldMarker.color;

					// 2. Tenta carregar a cor do NOVO tema
					let nextColor = isGoingToDark ? newMarker.darkColor : newMarker.lightColor;

					// 3. Se não houver cor salva para o novo tema, gera uma automática baseada na anterior
					if (nextColor === undefined || nextColor === '') {
						// Se a cor anterior era vazia, continua vazia (hardcoded default)
						if (!oldMarker.color) {
							nextColor = '';
						} else {
							// Calcula cor segura para o novo tema
							nextColor = getSuggestedColor(oldMarker.color, isGoingToDark);
						}

						// Salva essa cor gerada para persistência futura
						if (isGoingToDark) newMarker.darkColor = nextColor;
						else newMarker.lightColor = nextColor;
					}

					newMarker.color = nextColor;
					newListMarkers[key] = newMarker;
				});

				return { theme, listMarkers: newListMarkers as typeof state.listMarkers };
			}),
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

			setListMarkerConfig: (char, config) => set((state) => {
				const current = state.listMarkers[char] || { enabled: true, color: '' };
				const updated = { ...current, ...config };

				// Se a cor mudou, atualiza também o slot persistente do tema ATUAL
				if (config.color !== undefined) {
					if (state.theme === 'dark') updated.darkColor = config.color;
					else updated.lightColor = config.color;
				}

				return {
					listMarkers: {
						...state.listMarkers,
						[char]: updated,
					},
				};
			}),

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

			setAppBackgroundColor: (color) => set({ appBackgroundColor: color }),
			setEditorBackgroundColor: (color) => set({ editorBackgroundColor: color }),
			setEnableDynamicBackground: (enabled) => set({ enableDynamicBackground: enabled }),
			setSpotlightRadius: (radius) => set({ spotlightRadius: radius }),

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
			version: 8, // Incremented version for migration (State Shape Changed)
		}
	)
);
