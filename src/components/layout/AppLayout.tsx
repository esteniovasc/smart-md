import { useEffect, type ReactNode } from 'react';
import { Header } from './Header';
import { useTabsStore } from '../../stores/useTabsStore';

interface AppLayoutProps {
	children: ReactNode;
}

/**
 * AppLayout - Layout Modular com Ilhas Flutuantes
 * Gerencia o posicionamento das Docks laterais e o espaço central
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

	const iconButtonClass = `
		flex items-center justify-center w-10 h-10 rounded-xl
		text-slate-400 dark:text-slate-500
		hover:bg-black/5 hover:text-slate-700 
		dark:hover:bg-white/10 dark:hover:text-slate-200
		transition-colors cursor-pointer border-none bg-transparent
	`;

	return (
		<div className="min-h-screen w-full bg-transparent font-sans">
			<Header />

			{/* Main Content - Área Central */}
			{/* Ajustado padding para centralizar já que não tem dock esquerda */}
			<main
				className="
					absolute inset-0 
					pt-28 pb-6 px-4 md:px-8 lg:px-12 xl:px-16
					flex flex-col 
					z-0
					overflow-hidden
				"
			>
				{children}
			</main>
		</div>
	);
};
