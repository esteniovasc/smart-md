import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { StatusBar } from './StatusBar';
import { GlobalTooltip } from '../ui/GlobalTooltip';
import { useTabsStore } from '../../stores/useTabsStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface AppLayoutProps {
	children: ReactNode;
}

/**
 * AppLayout - Layout Modular com Ilhas Flutuantes
 * Gerencia o posicionamento das Docks laterais e o espaço central
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
	const {
		showStatusBar,
		showStatusBarInZenMode,
		statusBarLayout
	} = useSettingsStore();
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
					${isZenMode 
						? `pt-10 px-8 md:px-16 lg:px-24 xl:px-32 ${showStatusBar && showStatusBarInZenMode && statusBarLayout === 'bar' ? 'pb-14' : 'pb-10'}` 
						: `pt-28 px-4 md:px-8 lg:px-12 xl:px-16 ${showStatusBar && statusBarLayout === 'bar' ? 'pb-14' : 'pb-6'}`
					}
					flex flex-col 
					z-10
					overflow-hidden
				`}
			>
				{children}
			</main>

			{/* Zen Mode Mouse Escape Area */}
			<AnimatePresence>
				{isZenMode && (() => {
					const zenBottomPadding = showStatusBar && showStatusBarInZenMode && statusBarLayout === 'bar' ? 'bottom-14' : 'bottom-10';
					
					return (
						<>
							{/* Left Escape Area */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className={`fixed top-10 ${zenBottomPadding} left-0 w-10 md:w-16 z-[100] group flex flex-col justify-center`}
							>
								<button
									onClick={() => useTabsStore.getState().setIsZenMode(false)}
									data-tooltip="Sair do Modo Zen (Esc)"
									className="absolute left-0 top-0 bottom-0 w-full -translate-x-[120%] group-hover:translate-x-0 transition-transform duration-[400ms] ease-out bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-r-2xl shadow-[8px_0_30px_rgb(0,0,0,0.12)] border border-l-0 border-gray-200 dark:border-zinc-700 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 dark:text-gray-400 dark:hover:text-red-400 cursor-pointer flex flex-col items-center justify-center"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
										<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
									</svg>
								</button>
							</motion.div>

							{/* Right Escape Area */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className={`fixed top-10 ${zenBottomPadding} right-0 w-10 md:w-16 z-[100] group flex flex-col justify-center`}
							>
								<button
									onClick={() => useTabsStore.getState().setIsZenMode(false)}
									data-tooltip="Sair do Modo Zen (Esc)"
									className="absolute right-0 top-0 bottom-0 w-full translate-x-[120%] group-hover:translate-x-0 transition-transform duration-[400ms] ease-out bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-l-2xl shadow-[-8px_0_30px_rgb(0,0,0,0.12)] border border-r-0 border-gray-200 dark:border-zinc-700 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 dark:text-gray-400 dark:hover:text-red-400 cursor-pointer flex flex-col items-center justify-center"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
										<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
									</svg>
								</button>
							</motion.div>
						</>
					);
				})()}
			</AnimatePresence>

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

			<GlobalTooltip />
			<StatusBar />
		</div>
	);
};
