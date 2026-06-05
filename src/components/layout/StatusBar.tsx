import React from 'react';
import { useStatusBarStore } from '../../stores/useStatusBarStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useTabsStore } from '../../stores/useTabsStore';
import { motion, AnimatePresence } from 'framer-motion';

export const StatusBar: React.FC = () => {
	// ⚡ Use selectors to trigger re-renders properly
	const line = useStatusBarStore(s => s.line);
	const col = useStatusBarStore(s => s.col);
	const chars = useStatusBarStore(s => s.chars);

	const showStatusBar = useSettingsStore(s => s.showStatusBar);
	const showStatusBarInZenMode = useSettingsStore(s => s.showStatusBarInZenMode);
	const statusBarLayout = useSettingsStore(s => s.statusBarLayout);
	const editorFontSize = useSettingsStore(s => s.editorFontSize);
	
	const activeTabId = useTabsStore(s => s.activeTabId);
	const tabs = useTabsStore(s => s.tabs);
	const isZenMode = useTabsStore(s => s.isZenMode);

	if (!showStatusBar || !activeTabId) return null;
	if (isZenMode && !showStatusBarInZenMode) return null;

	const activeTab = tabs.find(t => t.id === activeTabId);
	const extension = activeTab?.id.includes('.') ? `.${activeTab.id.split('.').pop()}` : '.md';

	// Modern Floating Pill Layout (Improved Aesthetics)
	if (statusBarLayout === 'pill') {
		return (
			<AnimatePresence>
				<motion.div
					initial={{ opacity: 0, y: 15, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 15, scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					className="fixed bottom-6 right-6 z-50 flex items-center gap-5 px-5 h-10 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-xs font-mono text-gray-700 dark:text-gray-300 select-none pointer-events-none"
				>
					<span className="font-medium">Ln {line}, Col {col}</span>
					<span className="w-px h-4 bg-gray-300 dark:bg-zinc-700"></span>
					<span>{chars} chars</span>
					<span className="w-px h-4 bg-gray-300 dark:bg-zinc-700"></span>
					<span>{editorFontSize}px</span>
					<span className="w-px h-4 bg-gray-300 dark:bg-zinc-700"></span>
					<span className="font-bold text-primary-600 dark:text-primary-500">{extension}</span>
				</motion.div>
			</AnimatePresence>
		);
	}

	// Dynamic padding mirroring AppLayout's <main> padding perfectly
	const paddingClasses = isZenMode
		? "px-8 md:px-16 lg:px-24 xl:px-32"
		: "px-4 md:px-8 lg:px-12 xl:px-16";

	// Bar Layout (Anchored to bottom, matching Editor width)
	return (
		<AnimatePresence>
			<div className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${paddingClasses}`}>
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 10 }}
					className="h-10 w-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-gray-200/50 dark:border-zinc-800/50 border-b-0 rounded-t-2xl flex items-center justify-between px-6 text-xs font-mono text-gray-700 dark:text-gray-400 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] pointer-events-auto"
				>
					<div className="flex items-center gap-5">
						<span className="font-bold text-primary-600 dark:text-primary-500 flex items-center gap-1.5 truncate max-w-[200px]">
							{activeTab?.title || "Sem Título"}
						</span>
						<span className="w-px h-4 bg-gray-300/50 dark:bg-zinc-700/50"></span>
						<span className="font-medium">{extension}</span>
					</div>

					<div className="flex items-center gap-6">
						<span className="font-medium text-gray-800 dark:text-gray-200">
							Ln {line}, Col {col}
						</span>
						<span>{chars} chars</span>
						<span>Fonte: {editorFontSize}px</span>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
};
