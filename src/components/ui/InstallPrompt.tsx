import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const InstallPrompt = () => {
	const { isInstallable, installApp } = usePWA();
	const [showPrompt, setShowPrompt] = useState(false);

	useEffect(() => {
		if (!isInstallable) {
			setShowPrompt(false);
			return;
		}

		// Show the prompt after 10 seconds of interaction/load
		const timer = setTimeout(() => {
			// Check if we haven't dismissed it before in this session or entirely
			const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
			if (!dismissed) {
				setShowPrompt(true);
			}
		}, 10000);

		return () => clearTimeout(timer);
	}, [isInstallable]);

	const handleDismiss = () => {
		setShowPrompt(false);
		sessionStorage.setItem('pwa-prompt-dismissed', 'true');
	};

	const handleInstall = () => {
		installApp();
		setShowPrompt(false);
	};

	return (
		<AnimatePresence>
			{showPrompt && (
				<motion.div
					initial={{ opacity: 0, y: 50, scale: 0.9 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 20, scale: 0.9 }}
					transition={{ type: 'spring', damping: 25, stiffness: 300 }}
					className="fixed bottom-6 left-6 z-[100] w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 p-4"
				>
					<button
						onClick={handleDismiss}
						className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
					>
						<X className="w-4 h-4" />
					</button>

					<div className="flex items-start gap-4">
						<div className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/40 shrink-0">
							<DownloadCloud className="w-6 h-6" />
						</div>
						<div className="flex-1 pr-4">
							<h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
								Instale o Smart MD
							</h4>
							<p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
								Adicione à tela inicial para usar offline e abrir como um aplicativo de desktop.
							</p>
							<div className="flex gap-2">
								<button
									onClick={handleInstall}
									className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors shadow-md shadow-indigo-500/20"
								>
									Instalar Agora
								</button>
								<button
									onClick={handleDismiss}
									className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
								>
									Agora Não
								</button>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
