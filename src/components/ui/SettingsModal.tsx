import { useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, GripHorizontal } from 'lucide-react';
import { Switch } from './Switch';
import { SegmentedControl } from './SegmentedControl';
import { useSettingsStore, type MarkdownViewMode } from '../../stores/useSettingsStore';

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface SettingRowProps {
	label: string;
	children: React.ReactNode;
}

const SettingRow = ({ label, children }: SettingRowProps) => (
	<div className="flex items-center justify-between py-3 border-b border-black/5 dark:border-white/5 gap-4">
		<span className="text-sm text-gray-700 dark:text-gray-300 select-text min-w-0 flex-shrink">
			{label}
		</span>
		<div className="flex-shrink-0">
			{children}
		</div>
	</div>
);

const markdownViewOptions: { value: MarkdownViewMode; label: string }[] = [
	{ value: 'visible', label: 'Visível' },
	{ value: 'current-line', label: 'Na Linha' },
	{ value: 'hidden', label: 'Oculto' },
];

/**
 * SettingsModal - Janela flutuante de configurações (draggable pelo header)
 * Refatorado para Tailwind CSS v4
 */
export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
	const dragControls = useDragControls();
	const constraintsRef = useRef<HTMLDivElement>(null);

	const {
		showLineNumbers,
		markdownViewMode,
		enableStatusColors,
		enableHighlightActiveLine,
		restoreCursorPosition,
		updateSettings,
	} = useSettingsStore();

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Constraints container (tela toda) */}
					<div
						ref={constraintsRef}
						className="fixed inset-0 pointer-events-none z-50"
					/>

					<motion.div
						initial={{ opacity: 0, scale: 0.96, y: -10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: -10 }}
						transition={{ type: 'spring', stiffness: 500, damping: 35 }}
						drag
						dragControls={dragControls}
						dragListener={false}
						dragMomentum={false}
						dragElastic={0}
						dragConstraints={constraintsRef}
						className="fixed top-20 right-6 z-51 w-80 max-w-[calc(100vw-48px)]"
					>
						<div className="bg-white/98 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-black/5 dark:border-white/10">
							{/* Header - Drag Handle ONLY */}
							<div
								onPointerDown={(e) => dragControls.start(e)}
								className="flex items-center justify-between px-3.5 py-2.5 border-b border-black/5 dark:border-white/5 cursor-grab select-none active:cursor-grabbing"
							>
								<div className="flex items-center gap-2">
									<GripHorizontal className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
									<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 m-0">
										Configurações
									</h2>
								</div>
								<button
									onClick={onClose}
									className="p-1 rounded-md bg-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150 flex items-center justify-center border-none cursor-pointer"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							</div>

							{/* Settings List */}
							<div className="p-3.5 pt-1 pb-3.5">
								<SettingRow label="Números de Linha">
									<Switch
										checked={showLineNumbers}
										onChange={(v) => updateSettings({ showLineNumbers: v })}
									/>
								</SettingRow>

								<SettingRow label="Destacar Linha Ativa">
									<Switch
										checked={enableHighlightActiveLine}
										onChange={(v) => updateSettings({ enableHighlightActiveLine: v })}
									/>
								</SettingRow>

								<SettingRow label="Cores de Status (✅ ⚠️ 💡)">
									<Switch
										checked={enableStatusColors}
										onChange={(v) => updateSettings({ enableStatusColors: v })}
									/>
								</SettingRow>

								<SettingRow label="Continuar digitando no histórico do ponteiro">
									<Switch
										checked={restoreCursorPosition}
										onChange={(v) => updateSettings({ restoreCursorPosition: v })}
									/>
								</SettingRow>

								{/* Markdown View Mode - 3 estados */}
								<div className="pt-3">
									<div className="text-sm text-gray-700 dark:text-gray-300 mb-2.5 select-text cursor-text">
										Marcadores Markdown (#, *, **)
									</div>
									<SegmentedControl
										options={markdownViewOptions}
										value={markdownViewMode}
										onChange={(v) => updateSettings({ markdownViewMode: v })}
									/>
									<div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 leading-snug">
										{markdownViewMode === 'visible' && 'Sempre mostra #, *, ** no texto'}
										{markdownViewMode === 'current-line' && 'Mostra marcadores só na linha do cursor'}
										{markdownViewMode === 'hidden' && 'Oculta completamente os marcadores'}
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
