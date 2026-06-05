import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
	const isZenMode = useTabsStore((s) => s.isZenMode);
	
	const [activeToast, setActiveToast] = useState<{ id: number, text: string } | null>(null);
	const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Sair do Zen Mode com Esc
			if (e.key === 'Escape' && useTabsStore.getState().isZenMode) {
				useTabsStore.getState().setIsZenMode(false);
			}

			// Atalho Alt + Z para Ativar/Desativar Zen Mode
			if (e.altKey && e.key.toLowerCase() === 'z') {
				e.preventDefault();
				const currentZenState = useTabsStore.getState().isZenMode;
				useTabsStore.getState().setIsZenMode(!currentZenState);
			}

			// Atalho Alt + [1-9] para trocar de abas
			if (e.altKey && e.key >= '1' && e.key <= '9') {
				e.preventDefault();
				const index = parseInt(e.key) - 1;

				if (index < tabs.length) {
					const targetTabId = tabs[index].id;
					const targetTabName = tabs[index].title;
					setActiveTab(targetTabId);
					
					// Mostra o Toast e reseta timeout
					if (toastTimeoutRef.current) {
						clearTimeout(toastTimeoutRef.current);
					}
					
					setActiveToast({ id: Date.now(), text: targetTabName || 'Aba ' + (index + 1) });
					
					toastTimeoutRef.current = setTimeout(() => {
						setActiveToast(null);
					}, 1500);
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [tabs, setActiveTab]);
	return (
		<div className="min-h-screen w-full bg-transparent font-sans relative">
			{/* Zen Mode Backdrop */}
			<AnimatePresence>
				{isZenMode && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
						className="fixed inset-0 bg-black/10 dark:bg-black/30 pointer-events-none z-0"
					/>
				)}
			</AnimatePresence>

			<Header />

			{/* Main Content - Área Central */}
			<main
				className={`
					absolute inset-0 
					transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
					${isZenMode ? 'pt-10 pb-10 px-8 md:px-16 lg:px-24 xl:px-32' : 'pt-28 pb-6 px-4 md:px-8 lg:px-12 xl:px-16'}
					flex flex-col 
					z-10
					overflow-hidden
				`}
			>
				{children}
			</main>

			{/* Toast Indicator para Troca de Abas no Zen Mode */}
			<AnimatePresence mode="wait">
				{activeToast && isZenMode && (
					<motion.div
						key={activeToast.id}
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black/50 dark:bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide border border-white/10 shadow-xl"
					>
						{activeToast.text}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
