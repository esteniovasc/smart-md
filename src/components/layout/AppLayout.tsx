import { useEffect, type ReactNode } from 'react';
import { Header } from './Header';
import { useTabsStore } from '../../stores/useTabsStore';

interface AppLayoutProps {
	children: ReactNode;
}

/**
 * AppLayout - Container principal que aplica o layout completo
 * Inclui Header fixo e área de conteúdo
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
	const tabs = useTabsStore((s) => s.tabs);
	const setActiveTab = useTabsStore((s) => s.setActiveTab);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Atalho Alt + [1-9] para trocar de abas
			if (e.altKey && e.key >= '1' && e.key <= '9') {
				e.preventDefault();
				const index = parseInt(e.key) - 1;

				if (index < tabs.length) {
					const targetTabId = tabs[index].id;
					setActiveTab(targetTabId);
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [tabs, setActiveTab]);

	return (
		<div className="flex flex-col h-screen w-full overflow-hidden bg-transparent">
			<Header />

			{/* Main Content */}
			<main className="flex-1 overflow-hidden p-4 relative z-10">
				{children}
			</main>
		</div>
	);
};
