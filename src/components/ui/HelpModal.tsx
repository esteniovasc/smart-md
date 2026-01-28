import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripHorizontal, Book, Keyboard, MessageCircle } from 'lucide-react';

interface HelpModalProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * HelpModal - Modal flutuante de ajuda
 * Segue o mesmo padrão visual do SettingsModal
 */
export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
	const constraintsRef = useRef<HTMLDivElement>(null);

	// Conteúdo placeholder por enquanto
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Area de restrição invisível */}
					<div
						ref={constraintsRef}
						className="fixed inset-0 pointer-events-none z-50"
					/>

					<motion.div
						drag
						dragConstraints={constraintsRef}
						dragMomentum={false}
						dragElastic={0}
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: 'spring', stiffness: 500, damping: 30 }}
						className="fixed top-24 right-24 z-51 w-80 max-w-[90vw]"
					>
						<div className="glass-panel rounded-xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 flex flex-col bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">

							{/* Header Dragável */}
							<div
								className="flex items-center justify-between px-3.5 py-2.5 border-b border-black/5 dark:border-white/5 cursor-grab active:cursor-grabbing bg-white/50 dark:bg-black/20"
							>
								<div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
									<GripHorizontal className="w-3.5 h-3.5 opacity-50" />
									<span className="text-sm font-semibold">Ajuda & Recursos</span>
								</div>
								<button
									onClick={onClose}
									className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							</div>

							{/* Conteúdo */}
							<div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
								<div className="flex flex-col gap-2">
									<button className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-left cursor-pointer">
										<div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
											<Book className="w-4 h-4" />
										</div>
										<div>
											<div className="text-sm font-medium text-slate-800 dark:text-slate-100">Tutorial Rápido</div>
											<div className="text-xs text-slate-500 dark:text-slate-400">Aprenda o básico do Smart MD</div>
										</div>
									</button>

									<button className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-left cursor-pointer">
										<div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
											<Keyboard className="w-4 h-4" />
										</div>
										<div>
											<div className="text-sm font-medium text-slate-800 dark:text-slate-100">Atalhos de Teclado</div>
											<div className="text-xs text-slate-500 dark:text-slate-400">Lista completa de comandos</div>
										</div>
									</button>

									<button className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-left cursor-pointer">
										<div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
											<MessageCircle className="w-4 h-4" />
										</div>
										<div>
											<div className="text-sm font-medium text-slate-800 dark:text-slate-100">Feedback</div>
											<div className="text-xs text-slate-500 dark:text-slate-400">Reportar bug ou sugerir melhoria</div>
										</div>
									</button>
								</div>

								<div className="text-xs text-center text-slate-400 mt-4">
									Smart MD v0.1.0 • Early Access
								</div>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
