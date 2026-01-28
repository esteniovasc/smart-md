import { useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';

export const useBackground = () => {
	const appColor = useSettingsStore(state => state.appBackgroundColor);
	const editorColor = useSettingsStore(state => state.editorBackgroundColor);

	useEffect(() => {
		const root = document.body;

		// 1. App Background (Global Body)
		if (appColor) {
			root.style.setProperty('--app-background', appColor);
			root.style.setProperty('background-image', 'none');
			root.style.setProperty('background-color', 'var(--app-background)');
		} else {
			root.style.removeProperty('--app-background');
			root.style.removeProperty('background-image');
			root.style.removeProperty('background-color');
		}

		// 2. Editor Background (CSS Variable for .cm-editor)
		if (editorColor) {
			root.style.setProperty('--editor-bg-override', editorColor);
		} else {
			root.style.removeProperty('--editor-bg-override');
		}
	}, [appColor, editorColor]);
};
