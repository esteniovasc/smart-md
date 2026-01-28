import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue } from 'framer-motion';
import { X, GripHorizontal, Sliders, Type, RotateCcw, Plus, Minus, Check, MousePointer2, Upload, ChevronDown } from 'lucide-react';
import { Switch } from './Switch';
import { SegmentedControl } from './SegmentedControl';
import { useSettingsStore, type MarkdownViewMode, defaultSettings } from '../../stores/useSettingsStore';

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
 * Botão de Reset com confirmação animada
 */
const ResetButton = ({ onConfirm, label = "Restaurar Padrões" }: { onConfirm: () => void, label?: string }) => {
	const [status, setStatus] = useState<'idle' | 'confirming'>('idle');

	const handleConfirm = () => {
		onConfirm();
		setStatus('idle');
	};

	return (
		<div className="relative overflow-hidden w-full">
			<AnimatePresence mode="wait">
				{status === 'idle' ? (
					<motion.button
						key="idle"
						initial={{ x: -20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -20, opacity: 0 }}
						transition={{ duration: 0.15 }}
						onClick={() => setStatus('confirming')}
						className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border-none cursor-pointer text-sm font-medium"
					>
						<RotateCcw className="w-3.5 h-3.5" />
						{label}
					</motion.button>
				) : (
					<motion.div
						key="confirming"
						initial={{ x: 20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: 20, opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="flex items-center gap-2"
					>
						<span className="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap px-1">
							Tem certeza?
						</span>
						<button
							onClick={() => setStatus('idle')}
							className="flex-1 py-2 px-3 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors border-none cursor-pointer text-sm"
						>
							Cancelar
						</button>
						<button
							onClick={handleConfirm}
							className="flex-1 py-2 px-3 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors border-none cursor-pointer text-sm font-medium flex items-center justify-center gap-1.5"
						>
							<Check className="w-3.5 h-3.5" />
							Sim
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
	const dragControls = useDragControls();
	const constraintsRef = useRef<HTMLDivElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const [activeTab, setActiveTab] = useState<'general' | 'text' | 'cursors'>('general');

	// Motion value para controlar a posição Y manualmente
	const y = useMotionValue(0);

	const {
		showLineNumbers,
		markdownViewMode,
		enableStatusColors,
		enableHighlightActiveLine,
		editorFontSize,
		restoreCursorPosition,
		cursors,
		hotspots,
		enabledCursors,
		enableCustomCursors,
		updateSettings,
		setEditorFontSize,
		setCursorPath,
		setCursorHotspot,
		setCursorEnabled,
		setEnableCustomCursors,
		resetCursors,
	} = useSettingsStore();

	const [localFontSize, setLocalFontSize] = useState(editorFontSize.toString());

	useEffect(() => {
		setLocalFontSize(editorFontSize.toString());
	}, [editorFontSize]);

	const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setLocalFontSize(val);

		const numVal = parseInt(val);
		if (!isNaN(numVal) && numVal > 0) {
			setEditorFontSize(numVal);
		}
	};

	const handleFontSizeBlur = () => {
		const numVal = parseInt(localFontSize);
		if (isNaN(numVal) || numVal <= 0) {
			setLocalFontSize(editorFontSize.toString());
		}
	};

	const adjustFontSize = (delta: number) => {
		setEditorFontSize(editorFontSize + delta);
	};

	// Monitora troca de abas para garantir que ele caiba na tela
	// Usamos useLayoutEffect para ajustar antes do browser pintar o frame
	useEffect(() => {
		const adjustPosition = () => {
			if (modalRef.current) {
				const height = modalRef.current.offsetHeight;
				const viewportHeight = window.innerHeight;
				const topOffset = 80; // top-20 (5rem) aprox 80px
				const padding = 24;   // Margem de segurança

				// Cálculo do Y máximo permitido
				// currentY + topOffset + height <= viewportHeight - padding
				const maxY = viewportHeight - padding - topOffset - height;
				const currentY = y.get();

				if (currentY > maxY) {
					y.set(maxY);
				}
			}
		};

		// Executa imediatamente
		adjustPosition();

		// E também garante no próximo frame caso haja reflow tardio
		requestAnimationFrame(adjustPosition);
	}, [activeTab, y]);

	const resetGeneral = () => {
		updateSettings({
			showLineNumbers: defaultSettings.showLineNumbers,
			markdownViewMode: defaultSettings.markdownViewMode,
			enableStatusColors: defaultSettings.enableStatusColors,
			enableHighlightActiveLine: defaultSettings.enableHighlightActiveLine,
			restoreCursorPosition: defaultSettings.restoreCursorPosition,
		});
	};

	const resetText = () => {
		setEditorFontSize(defaultSettings.editorFontSize);
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<div
						ref={constraintsRef}
						className="fixed inset-0 pointer-events-none z-50"
					/>

					<motion.div
						ref={modalRef}
						layout // Ativa animação de suave de redimensionamento
						style={{ y }}
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
						className="fixed top-20 right-6 z-51 w-80 max-w-[calc(100vw-48px)] select-none"
					>
						<motion.div
							layout="position" // Previne distorção no container interno
							className="bg-white/98 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-black/5 dark:border-white/10 flex flex-col max-h-[80vh]"
						>
							{/* Header */}
							<motion.div
								layout="position" // Previne distorção no header
								onPointerDown={(e) => dragControls.start(e)}
								className="flex items-center justify-between px-3.5 py-2.5 border-b border-black/5 dark:border-white/5 cursor-grab active:cursor-grabbing"
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
							</motion.div>

							{/* Tabs Navigation */}
							<motion.div
								layout="position" // Previne distorção na navegação
								className="flex border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-800/30"
							>
								<button
									onClick={() => setActiveTab('general')}
									className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium transition-colors border-none cursor-pointer ${activeTab === 'general'
										? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-white/5 shadow-sm'
										: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
										}`}
								>
									<Sliders className="w-3.5 h-3.5" />
									Geral
								</button>
								<button
									onClick={() => setActiveTab('text')}
									className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium transition-colors border-none cursor-pointer ${activeTab === 'text'
										? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-white/5 shadow-sm'
										: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
										}`}
								>
									<Type className="w-3.5 h-3.5" />
									Texto
								</button>
								<button
									onClick={() => setActiveTab('cursors')}
									className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium transition-colors border-none cursor-pointer ${activeTab === 'cursors'
										? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-white/5 shadow-sm'
										: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
										}`}
								>
									<MousePointer2 className="w-3.5 h-3.5" />
									Cursores
								</button>
							</motion.div>

							{/* Content Area */}
							<motion.div
								layout="position" // Previne distorção no wrapper de conteúdo
								className="p-3.5 pt-1 pb-3.5 overflow-y-auto custom-scrollbar"
							>

								{/* GERAL TAB */}
								{activeTab === 'general' && (
									<motion.div
										key="general" // Add keys for better reconciliation
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 10 }}
										transition={{ duration: 0.2 }}
									>
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

										<SettingRow label="Restaurar cursor ao trocar aba">
											<Switch
												checked={restoreCursorPosition}
												onChange={(v) => updateSettings({ restoreCursorPosition: v })}
											/>
										</SettingRow>

										<div className="pt-3 border-t border-black/5 dark:border-white/5 mt-2 mb-4">
											<div className="text-sm text-gray-700 dark:text-gray-300 mb-2.5 select-text cursor-text">
												Marcadores Markdown
											</div>
											<SegmentedControl
												options={markdownViewOptions}
												value={markdownViewMode}
												onChange={(v) => updateSettings({ markdownViewMode: v })}
											/>
											<div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 leading-snug">
												{markdownViewMode === 'visible' && 'Mostra todos os símbolos'}
												{markdownViewMode === 'current-line' && 'Oculta símbolos fora da linha ativa'}
												{markdownViewMode === 'hidden' && 'Texto limpo, sem símbolos'}
											</div>
										</div>

										<div className="pt-2 border-t border-black/5 dark:border-white/5">
											<ResetButton onConfirm={resetGeneral} label="Restaurar Interação" />
										</div>
									</motion.div>
								)}

								{/* DO TEXTO TAB */}
								{activeTab === 'text' && (
									<motion.div
										key="text" // Add keys for better reconciliation
										initial={{ opacity: 0, x: 10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -10 }}
										transition={{ duration: 0.2 }}
									>
										<div className="mb-6">
											<label className="text-sm text-gray-700 dark:text-gray-300 block mb-2">
												Tamanho da Fonte (px)
											</label>
											<div className="flex gap-2 h-10">
												<input
													type="text"
													value={localFontSize}
													onChange={handleFontSizeChange}
													onBlur={handleFontSizeBlur}
													className="flex-1 min-w-0 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
													placeholder="ex: 14"
												/>

												<div className="flex flex-col gap-0.5 h-full w-9">
													<button
														onClick={() => adjustFontSize(1)}
														className="flex-1 flex items-center justify-center rounded-t-sm rounded-bx-md bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors border-none cursor-pointer"
														title="Aumentar"
													>
														<Plus className="w-3 h-3" />
													</button>
													<button
														onClick={() => adjustFontSize(-1)}
														className="flex-1 flex items-center justify-center rounded-b-md rounded-tx-sm bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors border-none cursor-pointer"
														title="Diminuir"
													>
														<Minus className="w-3 h-3" />
													</button>
												</div>
											</div>
											<p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
												Atalhos do editor: <strong>Ctrl +</strong> para aumentar, <strong>Ctrl -</strong> para diminuir.
											</p>
										</div>

										<div className="pt-2 border-t border-black/5 dark:border-white/5">
											<ResetButton onConfirm={resetText} label="Restaurar Texto" />
										</div>
									</motion.div>
								)}

								{/* CURSORES TAB */}
								{activeTab === 'cursors' && (
									<motion.div
										key="cursors"
										initial={{ opacity: 0, x: 10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -10 }}
										transition={{ duration: 0.2 }}
										className="space-y-4"
									>
										{/* Master Switch */}
										<div className="flex items-center justify-between py-2 mb-4 border-b border-black/5 dark:border-white/5">
											<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
												Habilitar Cursores Personalizados
											</label>
											<Switch
												checked={enableCustomCursors}
												onChange={setEnableCustomCursors}
											/>
										</div>

										<div className={`space-y-4 transition-opacity duration-200 ${!enableCustomCursors ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
											{[
												{ id: 'default', label: 'Padrão' },
												{ id: 'pointer', label: 'Pointer (Link)' },
												{ id: 'text', label: 'Texto' },
												{ id: 'grab', label: 'Mover (Grab)' },
												{ id: 'grabbing', label: 'Movendo (Grabbing)' }
											].map((cursor) => (
												<div key={cursor.id} className="space-y-2 pb-2 border-b border-black/5 dark:border-white/5 last:border-0">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3">
															{/* Individual Toggle */}
															<Switch
																checked={enabledCursors[cursor.id as keyof typeof enabledCursors]}
																onChange={(val) => setCursorEnabled(cursor.id as any, val)}
																disabled={!enableCustomCursors}
															/>

															{/* Preview Icon */}
															<div className="w-8 h-8 rounded bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/5">
																<img
																	src={cursors[cursor.id as keyof typeof cursors]}
																	className="w-5 h-5 object-contain"
																	alt={`Cursor ${cursor.label}`}
																/>
															</div>

															<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
																{cursor.label}
															</label>
														</div>

														{/* Upload Button */}
														<label className={`flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer transition-colors border-none text-gray-600 dark:text-gray-300 ${!enabledCursors[cursor.id as keyof typeof enabledCursors] ? 'opacity-50 pointer-events-none' : ''}`} title="Alterar ícone">
															<input
																type="file"
																className="hidden"
																accept=".svg,.png,.jpg,.jpeg,.ico"
																onChange={(e) => {
																	const file = e.target.files?.[0];
																	if (file) {
																		const reader = new FileReader();
																		reader.onloadend = () => {
																			const base64String = reader.result as string;
																			setCursorPath(cursor.id as any, base64String);
																		};
																		reader.readAsDataURL(file);
																	}
																}}
															/>
															<Upload className="w-4 h-4" />
														</label>
													</div>

													{/* Hotspot Tuning (Dropdown) */}
													{enabledCursors[cursor.id as keyof typeof enabledCursors] && (
														<details className="group/hotspot pl-[52px]">
															<summary className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-fit list-none">
																<ChevronDown className="w-3 h-3 transition-transform group-open/hotspot:rotate-180" />
																Ajuste de Clique (Hotspot)
															</summary>
															<div className="flex gap-4 p-2 mt-1 rounded bg-gray-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 w-fit">
																<div className="flex items-center gap-2">
																	<span className="text-[10px] font-mono text-gray-500">X:</span>
																	<input
																		type="number"
																		value={hotspots[cursor.id as keyof typeof hotspots]?.x ?? 0}
																		onChange={(e) => setCursorHotspot(cursor.id as any, parseInt(e.target.value) || 0, hotspots[cursor.id as keyof typeof hotspots]?.y || 0)}
																		className="w-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-primary-500 text-center"
																	/>
																</div>
																<div className="flex items-center gap-2">
																	<span className="text-[10px] font-mono text-gray-500">Y:</span>
																	<input
																		type="number"
																		value={hotspots[cursor.id as keyof typeof hotspots]?.y ?? 0}
																		onChange={(e) => setCursorHotspot(cursor.id as any, hotspots[cursor.id as keyof typeof hotspots]?.x || 0, parseInt(e.target.value) || 0)}
																		className="w-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-primary-500 text-center"
																	/>
																</div>
															</div>
														</details>
													)}
												</div>
											))}
										</div>

										<div className="pt-2 border-t border-black/5 dark:border-white/5">
											<ResetButton onConfirm={resetCursors} label="Redefinir Cursores" />
										</div>
									</motion.div>
								)}
							</motion.div>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
