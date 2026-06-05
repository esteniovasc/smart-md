import { AppLayout } from './components/layout/AppLayout';
import { useTheme } from './hooks/useTheme';
import { useCursors } from './hooks/useCursors';
import { Editor } from './components/editor/Editor';
import { DynamicBackground } from './components/layout/DynamicBackground';

/**
 * Smart MD - Editor de Markdown PWA
 * Componente principal da aplicação
 */
import { usePageTitle } from './hooks/usePageTitle';

import { useBackground } from './hooks/useBackground';
import { useFileSystem } from './hooks/useFileSystem';
import { HomeScreen } from './components/layout/HomeScreen';
import { useTabsStore } from './stores/useTabsStore';

/**
 * Smart MD - Editor de Markdown PWA
 * Componente principal da aplicação
 */
export default function App() {
	// Inicializar hook de tema (aplica classe dark ao body)
	useTheme();
	useCursors();
	usePageTitle();
	useBackground();
	useFileSystem();

	const activeTabId = useTabsStore((s) => s.activeTabId);
	const _hasHydrated = useTabsStore((s) => s._hasHydrated);

	return (
		<AppLayout>
			<DynamicBackground />
			{_hasHydrated ? (
				activeTabId === null ? <HomeScreen /> : <Editor />
			) : null}
		</AppLayout>
	);
}
