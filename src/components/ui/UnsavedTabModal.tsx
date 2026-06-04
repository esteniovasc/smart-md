import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { GlassButton } from './GlassButton';

interface UnsavedTabModalProps {
	isOpen: boolean;
	tabTitle: string;
	onClose: () => void;
	onConfirmDiscard: () => void;
}

import { createPortal } from 'react-dom';

export const UnsavedTabModal = ({ isOpen, tabTitle, onClose, onConfirmDiscard }: UnsavedTabModalProps) => {
	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
					{/* Overlay Background */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
					/>

					{/* Modal Content */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
						className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl flex flex-col"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
							<div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
								<AlertTriangle size={20} strokeWidth={2.5} />
								<h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
									Alterações não salvas
								</h2>
							</div>
							<button
								onClick={onClose}
								className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 transition-colors"
							>
								<X size={18} strokeWidth={2.5} />
							</button>
						</div>

						{/* Body */}
						<div className="p-6">
							<p className="text-slate-600 dark:text-slate-300">
								Você tem alterações não salvas na nota <span className="font-semibold text-slate-800 dark:text-slate-200">"{tabTitle}"</span>.
							</p>
							<p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
								O salvamento automático de arquivos locais ainda não está ativado. Deseja realmente fechar e perder essas alterações?
							</p>
						</div>

						{/* Footer */}
						<div className="p-4 bg-black/5 dark:bg-white/5 flex justify-end gap-3 border-t border-black/5 dark:border-white/5">
							<GlassButton
								onClick={onClose}
								className="text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10"
							>
								Cancelar
							</GlassButton>
							
							<GlassButton
								disabled={true}
								title="O salvamento local ainda não está implementado"
								className="opacity-50 cursor-not-allowed"
							>
								Salvar
							</GlassButton>

							<GlassButton
								onClick={() => {
									onConfirmDiscard();
									onClose();
								}}
								className="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 border-red-500/20"
							>
								Descartar e Fechar
							</GlassButton>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	);
};
