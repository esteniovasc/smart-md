import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripHorizontal, Book, Keyboard, Info, ArrowLeft, Github, Heart, DownloadCloud } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

interface HelpModalProps {
	isOpen: boolean;
	onClose: () => void;
}

type ViewType = 'menu' | 'tutorial' | 'shortcuts' | 'about';

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
	const constraintsRef = useRef<HTMLDivElement>(null);
	const [activeView, setActiveView] = useState<ViewType>('menu');
	const { isInstallable, installApp } = usePWA();

	const handleClose = () => {
		onClose();
		setTimeout(() => setActiveView('menu'), 300); // reset after animation
	};

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
						className="fixed top-24 right-24 z-[60] w-80 max-w-[90vw]"
					>
						<div className="glass-panel rounded-xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 flex flex-col bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">

							{/* Header Dragável */}
							<div
								className="flex items-center justify-between px-3.5 py-2.5 border-b border-black/5 dark:border-white/5 cursor-grab active:cursor-grabbing bg-white/50 dark:bg-black/20"
							>
								<div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
									{activeView !== 'menu' ? (
										<button
											onClick={() => setActiveView('menu')}
											className="p-1 -ml-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
										>
											<ArrowLeft className="w-3.5 h-3.5" />
										</button>
									) : (
										<GripHorizontal className="w-3.5 h-3.5 opacity-50" />
									)}
									<span className="text-sm font-semibold">
										{activeView === 'menu' && 'Ajuda & Recursos'}
										{activeView === 'tutorial' && 'Tutorial Rápido'}
										{activeView === 'shortcuts' && 'Atalhos de Teclado'}
										{activeView === 'about' && 'Sobre o Smart MD'}
									</span>
								</div>
								<button
									onClick={handleClose}
									className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							</div>

							{/* Conteúdo Dinâmico */}
							<div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
								<AnimatePresence mode="wait">
									{activeView === 'menu' && (
										<motion.div
											key="menu"
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -10 }}
											className="flex flex-col gap-2"
										>
											<button onClick={() => setActiveView('tutorial')} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-left cursor-pointer">
												<div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
													<Book className="w-4 h-4" />
												</div>
												<div>
													<div className="text-sm font-medium text-slate-800 dark:text-slate-100">Tutorial Rápido</div>
													<div className="text-xs text-slate-500 dark:text-slate-400">Aprenda o básico do Smart MD</div>
												</div>
											</button>

											<button onClick={() => setActiveView('shortcuts')} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-left cursor-pointer">
												<div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
													<Keyboard className="w-4 h-4" />
												</div>
												<div>
													<div className="text-sm font-medium text-slate-800 dark:text-slate-100">Atalhos de Teclado</div>
													<div className="text-xs text-slate-500 dark:text-slate-400">Lista completa de comandos</div>
												</div>
											</button>

											<button onClick={() => setActiveView('about')} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-left cursor-pointer">
												<div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
													<Info className="w-4 h-4" />
												</div>
												<div>
													<div className="text-sm font-medium text-slate-800 dark:text-slate-100">Sobre</div>
													<div className="text-xs text-slate-500 dark:text-slate-400">Autores, contribuição e versão</div>
												</div>
											</button>

											{isInstallable && (
												<button onClick={installApp} className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors text-left cursor-pointer mt-2">
													<div className="p-2 rounded-md bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
														<DownloadCloud className="w-4 h-4" />
													</div>
													<div>
														<div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Instalar Smart MD</div>
														<div className="text-xs text-indigo-600/70 dark:text-indigo-400/70">Acesse como um app nativo</div>
													</div>
												</button>
											)}
										</motion.div>
									)}

									{activeView === 'tutorial' && (
										<motion.div
											key="tutorial"
											initial={{ opacity: 0, x: 10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 10 }}
											className="text-sm text-slate-600 dark:text-slate-300 space-y-4 pb-2"
										>
											<div>
												<h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">✍️ Escrita Fluida</h4>
												<p className="text-xs leading-relaxed">O Smart MD é focado na sua experiência. Abra múltiplos arquivos nas abas superiores, ative os efeitos sonoros ou visuais nas configurações e sinta o teclado.</p>
											</div>
											<div>
												<h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">🧘 Modo Zen</h4>
												<p className="text-xs leading-relaxed">Pressione <kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">Alt+Z</kbd> para focar 100% no texto. Mova o mouse para as laterais se quiser sair, ou apenas aperte ESC.</p>
											</div>
											<div>
												<h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">🎨 Personalização Total</h4>
												<p className="text-xs leading-relaxed">Clique no ícone de engrenagem no topo. Altere temas, cores dos cursores, marcadores de lista dinâmicos e fontes.</p>
											</div>
										</motion.div>
									)}

									{activeView === 'shortcuts' && (
										<motion.div
											key="shortcuts"
											initial={{ opacity: 0, x: 10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 10 }}
											className="pb-2"
										>
											<div className="border border-black/5 dark:border-white/5 rounded-lg overflow-hidden">
												<table className="w-full text-xs text-left">
													<thead className="bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300">
														<tr>
															<th className="px-3 py-2 font-medium border-b border-black/5 dark:border-white/5">Comando</th>
															<th className="px-3 py-2 font-medium border-b border-black/5 dark:border-white/5">Atalho</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-black/5 dark:divide-white/5 text-slate-600 dark:text-slate-400">
														<tr><td className="px-3 py-2">Negrito</td><td className="px-3 py-2"><kbd className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">Ctrl+B</kbd></td></tr>
														<tr><td className="px-3 py-2">Itálico</td><td className="px-3 py-2"><kbd className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">Ctrl+I</kbd></td></tr>
														<tr><td className="px-3 py-2">Riscado</td><td className="px-3 py-2"><kbd className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">Ctrl+Shift+X</kbd></td></tr>
														<tr><td className="px-3 py-2">Modo Zen</td><td className="px-3 py-2"><kbd className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">Alt+Z</kbd></td></tr>
														<tr><td className="px-3 py-2">Pesquisar</td><td className="px-3 py-2"><kbd className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">Ctrl+F</kbd></td></tr>
														<tr><td className="px-3 py-2">Salvar (Em breve)</td><td className="px-3 py-2"><kbd className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">Ctrl+S</kbd></td></tr>
													</tbody>
												</table>
											</div>
										</motion.div>
									)}

									{activeView === 'about' && (
										<motion.div
											key="about"
											initial={{ opacity: 0, x: 10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 10 }}
											className="flex flex-col items-center text-center space-y-4 pb-2"
										>
											<img src="/favicon.svg" alt="Smart MD Logo" className="w-16 h-16 drop-shadow-xl mb-2" />

											<div>
												<h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Smart MD</h3>
												<p className="text-xs text-slate-500 dark:text-slate-400">Versão Alpha • Acesso antecipado</p>
											</div>

											<p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-[250px]">
												Desenvolvido com <Heart className="inline w-3 h-3 text-red-500 fill-red-500" /> com o Gemini 3.1 Pro. Uma ferramenta focada na pura estética e prazer de escrever em Markdown.
											</p>

											<div className="w-full h-px bg-black/5 dark:bg-white/5 my-2" />

											<a
												href="https://github.com/esteniovasc/smart-md"
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg bg-[#24292e] hover:bg-[#2c3137] text-white text-sm font-medium transition-colors shadow-md"
											>
												<Github className="w-4 h-4" />
												Contribua no GitHub
											</a>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{activeView === 'menu' && (
								<div className="text-xs text-center text-slate-400 pb-4">
									Versão Alpha • Acesso antecipado
								</div>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
