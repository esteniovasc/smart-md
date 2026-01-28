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

	return (
		<AppLayout>
			<DynamicBackground />
			<Editor />
		</AppLayout>
	);
}
