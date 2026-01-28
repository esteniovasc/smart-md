import { AppLayout } from './components/layout/AppLayout';
import { useTheme } from './hooks/useTheme';
import { useCursors } from './hooks/useCursors';
import { Editor } from './components/editor/Editor';

/**
 * Smart MD - Editor de Markdown PWA
 * Componente principal da aplicação
 */
export default function App() {
	// Inicializar hook de tema (aplica classe dark ao body)
	useTheme();
	useCursors();

	return (
		<AppLayout>
			<Editor />
		</AppLayout>
	);
}
