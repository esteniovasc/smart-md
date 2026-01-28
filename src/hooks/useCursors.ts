import { useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';

/**
 * Hook to synchronize cursor settings with CSS variables
 */
export const useCursors = () => {
	const cursors = useSettingsStore((state) => state.cursors);
	const hotspots = useSettingsStore((state) => state.hotspots);
	const enabledCursors = useSettingsStore((state) => state.enabledCursors);
	const masterEnabled = useSettingsStore((state) => state.enableCustomCursors);

	useEffect(() => {
		const root = document.body;

		if (masterEnabled) {
			root.classList.add('custom-cursors-enabled');

			// Helper to set or fallback
			const set = (prop: string, url: string, { x, y }: { x: number, y: number }, fallback: string, isEnabled: boolean) => {
				const value = isEnabled
					? `url('${url}') ${x} ${y}, ${fallback}`
					: fallback;
				root.style.setProperty(prop, value);
			};

			set('--cursor-default', cursors.default, hotspots.default, 'auto', enabledCursors.default);
			set('--cursor-pointer', cursors.pointer, hotspots.pointer, 'pointer', enabledCursors.pointer);
			set('--cursor-text', cursors.text, hotspots.text, 'text', enabledCursors.text);
			set('--cursor-grab', cursors.grab, hotspots.grab, 'grab', enabledCursors.grab);
			set('--cursor-grabbing', cursors.grabbing, hotspots.grabbing, 'grabbing', enabledCursors.grabbing);

		} else {
			root.classList.remove('custom-cursors-enabled');
			// Opcional: Limpar variáveis para limpeza, mas a classe já previne o uso
			root.style.removeProperty('--cursor-default');
			root.style.removeProperty('--cursor-pointer');
			root.style.removeProperty('--cursor-text');
			root.style.removeProperty('--cursor-grab');
			root.style.removeProperty('--cursor-grabbing');
		}

	}, [cursors, hotspots, enabledCursors, masterEnabled]);
};
