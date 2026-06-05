import { useEffect } from 'react';
import { useTabsStore } from '../stores/useTabsStore';

/**
 * Hook to prevent accidental closing of the tab/window when there are unsaved changes.
 */
export function useUnsavedWarning() {
	// Assinamos o estado para que o hook perceba as mudanças e o componente que o usa seja re-renderizado
	useTabsStore((state) => state.tabs.some((tab) => tab.isModified));

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			const hasUnsaved = useTabsStore.getState().tabs.some((tab) => tab.isModified);
			if (hasUnsaved) {
				// Cancel the event as stated by the standard.
				event.preventDefault();
				// Chrome requires returnValue to be set.
				event.returnValue = '';
				return '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);
}
