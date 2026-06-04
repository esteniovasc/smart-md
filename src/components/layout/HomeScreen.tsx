import { motion, type Variants } from 'framer-motion';
import { FileText, Plus, ArrowRight, X } from 'lucide-react';
import { useTabsStore } from '../../stores/useTabsStore';

export const HomeScreen = () => {
	const tabs = useTabsStore((s) => s.tabs) || [];
	const recentFiles = useTabsStore((s) => s.recentFiles) || [];
	const hiddenRecents = useTabsStore((s) => s.hiddenRecents) || [];
	const createTab = useTabsStore((s) => s.createTab);
	const setActiveTab = useTabsStore((s) => s.setActiveTab);
	const restoreRecentFile = useTabsStore((s) => s.restoreRecentFile);
	const removeRecentFile = useTabsStore((s) => s.removeRecentFile);

	const container: Variants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const item: Variants = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
	};

	const openTabIds = new Set(tabs.map(t => t.id));
	const allRecent = [
		...tabs,
		...recentFiles.filter(rf => !openTabIds.has(rf.id))
	]
		.filter(rf => !hiddenRecents.includes(rf.id))
		.sort((a, b) => b.updatedAt - a.updatedAt)
		.slice(0, 3);

	return (
		<div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">
			<motion.div 
				variants={container}
				initial="hidden"
				animate="show"
				className="max-w-3xl w-full flex flex-col items-center text-center gap-8"
			>
				{/* Header Section */}
				<motion.div variants={item} className="flex flex-col items-center gap-4">
					<div className="w-24 h-24 rounded-3xl glass-panel border border-white/20 dark:border-white/10 flex items-center justify-center shadow-2xl mb-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20">
						<FileText className="w-12 h-12 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
					</div>
					<h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight select-none">
						Smart MD
					</h1>
					<p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-lg select-none">
						Bloco de notas web com suporte avançado a Markdown, abas e muito mais.
					</p>
				</motion.div>

				{/* Primary Action */}
				<motion.div variants={item}>
					<button
						onClick={() => createTab('Sem título')}
						className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25 active:scale-95 overflow-hidden select-none"
					>
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
						<Plus className="w-5 h-5" strokeWidth={2.5} />
						<span className="text-lg">Criar Nova Nota</span>
					</button>
				</motion.div>

				{/* Recent/Open Tabs Section */}
				{allRecent.length > 0 && (
					<motion.div variants={item} className="w-full mt-12 flex flex-col items-start text-left">
						<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 pl-1 select-none">
							Recentes
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
							{allRecent.map((file) => {
								const isOpen = openTabIds.has(file.id);
								
								return (
									<div key={file.id} className="relative group">
										<button
											onClick={() => isOpen ? setActiveTab(file.id) : restoreRecentFile(file.id)}
											className="w-full h-full flex flex-col items-start gap-2 p-5 glass-panel rounded-2xl border border-white/20 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left cursor-pointer hover:shadow-lg active:scale-[0.98]"
										>
											<div className="flex items-center justify-between w-full">
												<div className="flex items-center gap-2">
													<FileText className="w-5 h-5 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
													<span className="font-medium text-slate-700 dark:text-slate-200 truncate pr-2 max-w-[140px]">
														{file.title}
													</span>
													{isOpen && file.isModified && (
														<span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Alterações não salvas" />
													)}
												</div>
												<ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mr-6" />
											</div>
											<span className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mt-1">
												{file.content ? file.content : <span className="italic">Nota vazia...</span>}
											</span>
										</button>
										
										{/* Remove Button */}
										<button
											onClick={(e) => {
												e.stopPropagation();
												removeRecentFile(file.id);
											}}
											title="Remover dos Recentes"
											className="absolute top-3 right-3 p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 dark:hover:bg-red-500/30 dark:hover:text-red-400 transition-all"
										>
											<X className="w-3.5 h-3.5" strokeWidth={2.5} />
										</button>
									</div>
								);
							})}
						</div>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
};
