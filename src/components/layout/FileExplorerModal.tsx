import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, FolderOpen, FileText, ChevronRight, CornerUpLeft, HardDrive, File as FileIcon, AlertTriangle, Trash2, ArrowLeft } from 'lucide-react';
import { useTabsStore } from '../../stores/useTabsStore';
import { get, set } from 'idb-keyval';

interface FileExplorerModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface ExplorerEntry {
	name: string;
	kind: 'file' | 'directory';
	handle: any; // FileSystemHandle
}

interface Workspace {
	name: string;
	handle: any;
}

export const FileExplorerModal = ({ isOpen, onClose }: FileExplorerModalProps) => {
	const createTabWithHandle = useTabsStore((s) => s.createTabWithHandle);

	const [view, setView] = useState<'hub' | 'explorer'>('hub');
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	
	const [pathStack, setPathStack] = useState<{ handle: any; name: string }[]>([]);
	const [entries, setEntries] = useState<ExplorerEntry[]>([]);
	
	const [isLoading, setIsLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// Load workspaces on mount
	useEffect(() => {
		if (isOpen) {
			get('smart-md-workspaces').then((savedWorkspaces) => {
				if (Array.isArray(savedWorkspaces)) {
					setWorkspaces(savedWorkspaces);
				}
			}).catch(e => console.error("Erro ao carregar workspaces", e));
		}
	}, [isOpen]);

	// Load entries when current directory changes in explorer view
	useEffect(() => {
		let isMounted = true;

		const loadEntries = async () => {
			if (view !== 'explorer' || pathStack.length === 0) {
				if (isMounted) setEntries([]);
				return;
			}

			setIsLoading(true);
			try {
				const currentDir = pathStack[pathStack.length - 1].handle;
				const newEntries: ExplorerEntry[] = [];
				
				// @ts-ignore - TS might not know about File System Access API iterators
				for await (const entry of currentDir.values()) {
					if (entry.kind === 'directory') {
						newEntries.push({ name: entry.name, kind: 'directory', handle: entry });
					} else if (entry.kind === 'file') {
						const name = entry.name.toLowerCase();
						if (name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.csv')) {
							newEntries.push({ name: entry.name, kind: 'file', handle: entry });
						}
					}
				}

				newEntries.sort((a, b) => {
					if (a.kind === b.kind) return a.name.localeCompare(b.name);
					return a.kind === 'directory' ? -1 : 1;
				});

				if (isMounted) setEntries(newEntries);
			} catch (error) {
				console.error("Erro ao ler diretório:", error);
				if (isMounted) setErrorMsg("Não foi possível ler o conteúdo desta pasta.");
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		loadEntries();

		return () => { isMounted = false; };
	}, [pathStack, view]);

	const saveWorkspaces = async (newWorkspaces: Workspace[]) => {
		setWorkspaces(newWorkspaces);
		await set('smart-md-workspaces', newWorkspaces);
	};

	const handleAddWorkspace = async () => {
		try {
			setErrorMsg(null);
			// @ts-ignore
			const dirHandle = await window.showDirectoryPicker();
			
			// Check if already exists
			const exists = workspaces.find(w => w.name === dirHandle.name);
			let updatedWorkspaces = workspaces;
			if (!exists) {
				updatedWorkspaces = [{ name: dirHandle.name, handle: dirHandle }, ...workspaces].slice(0, 8); // Max 8
				await saveWorkspaces(updatedWorkspaces);
			}
			
			// Enter the new workspace directly
			setPathStack([{ handle: dirHandle, name: dirHandle.name }]);
			setView('explorer');
		} catch (error: any) {
			console.log('Seleção de pasta cancelada', error);
			if (error.name !== 'AbortError') {
				setErrorMsg('Permissão negada ou ocorreu um erro ao selecionar a pasta.');
			}
		}
	};

	const handleRemoveWorkspace = async (workspaceName: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const updatedWorkspaces = workspaces.filter(w => w.name !== workspaceName);
		await saveWorkspaces(updatedWorkspaces);
	};

	const handleOpenWorkspace = async (workspace: Workspace) => {
		try {
			setErrorMsg(null);
			const perm = await workspace.handle.queryPermission({ mode: 'read' });
			if (perm === 'granted') {
				setPathStack([{ handle: workspace.handle, name: workspace.name }]);
				setView('explorer');
			} else {
				// Request permission
				const requestPerm = await workspace.handle.requestPermission({ mode: 'read' });
				if (requestPerm === 'granted') {
					setPathStack([{ handle: workspace.handle, name: workspace.name }]);
					setView('explorer');
				} else {
					setErrorMsg('Permissão negada. Autorize o acesso para abrir este espaço.');
				}
			}
		} catch (error: any) {
			console.error("Erro ao solicitar permissão", error);
			setErrorMsg('Erro ao tentar restaurar permissão da pasta.');
		}
	};

	const handleOpenFile = async () => {
		try {
			setErrorMsg(null);
			// @ts-ignore
			const [fileHandle] = await window.showOpenFilePicker({
				types: [
					{
						description: 'Text Files',
						accept: {
							'text/plain': ['.txt', '.md', '.csv'],
						},
					},
				],
			});
			const file = await fileHandle.getFile();
			const content = await file.text();
			
			createTabWithHandle(file.name, content, fileHandle, file.lastModified);
			onClose();
		} catch (error) {
			console.log('Seleção de arquivo cancelada', error);
		}
	};

	const handleEntryClick = async (entry: ExplorerEntry) => {
		if (entry.kind === 'directory') {
			setPathStack(prev => [...prev, { handle: entry.handle, name: entry.name }]);
		} else {
			try {
				const file = await entry.handle.getFile();
				const content = await file.text();
				createTabWithHandle(entry.name, content, entry.handle, file.lastModified);
				onClose();
			} catch (error) {
				console.error('Erro ao ler arquivo:', error);
				setErrorMsg('Não foi possível ler este arquivo.');
			}
		}
	};

	const handleGoBack = () => {
		if (pathStack.length > 1) {
			setPathStack(prev => prev.slice(0, -1));
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
					onClick={onClose}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="relative w-full max-w-5xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
						style={{ height: '75vh', maxHeight: '700px' }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 shrink-0 bg-white/50 dark:bg-black/20">
							<div className="flex items-center gap-3">
								{view === 'explorer' && (
									<button
										onClick={() => {
											setView('hub');
											setPathStack([]);
										}}
										className="p-1.5 rounded-lg text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors mr-1"
										data-tooltip="Voltar aos Espaços"
									>
										<ArrowLeft className="w-5 h-5" />
									</button>
								)}
								<FolderOpen className="w-5 h-5 text-blue-500" />
								<h2 className="text-lg font-bold text-slate-800 dark:text-white select-none">
									{view === 'hub' ? 'Espaços de Trabalho' : 'Explorador'}
								</h2>
							</div>
							
							<div className="flex items-center gap-2">
								<button
									onClick={onClose}
									className="p-1.5 rounded-lg text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
						</div>

						{/* Error Message */}
						{errorMsg && (
							<div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between text-red-600 dark:text-red-400 text-sm shrink-0">
								<div className="flex items-center gap-2">
									<AlertTriangle className="w-4 h-4" />
									{errorMsg}
								</div>
								<button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-500/20 rounded">
									<X className="w-3 h-3" />
								</button>
							</div>
						)}

						{/* Body */}
						<div className="flex-1 overflow-hidden flex flex-col relative">
							{view === 'hub' ? (
								<div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
									<div className="max-w-4xl mx-auto space-y-8">
										
										{/* Actions */}
										<div className="flex flex-col sm:flex-row gap-4 justify-center">
											<button
												onClick={handleAddWorkspace}
												className="flex-1 max-w-sm px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-95 flex flex-col items-center justify-center gap-2"
											>
												<FolderOpen className="w-6 h-6" />
												<span>Adicionar Novo Espaço</span>
												<span className="text-xs text-blue-200 font-normal">Selecionar uma pasta do computador</span>
											</button>
											
											<button
												onClick={handleOpenFile}
												className="flex-1 max-w-sm px-6 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-2xl font-medium transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-2"
											>
												<FileIcon className="w-6 h-6" />
												<span>Arquivo Único (Avulso)</span>
												<span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Selecionar apenas um arquivo</span>
											</button>
										</div>

										{/* Saved Workspaces */}
										{workspaces.length > 0 && (
											<div className="pt-8 border-t border-black/5 dark:border-white/5">
												<h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-1 select-none">
													Seus Espaços ({workspaces.length}/8)
												</h3>
												<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
													{workspaces.map((workspace, idx) => (
														<div 
															key={`${workspace.name}-${idx}`}
															onClick={() => handleOpenWorkspace(workspace)}
															className="group relative flex flex-col p-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl hover:shadow-lg hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden"
														>
															<div className="flex items-start justify-between mb-3">
																<div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
																	<HardDrive className="w-6 h-6 text-blue-500" />
																</div>
																<button
																	onClick={(e) => handleRemoveWorkspace(workspace.name, e)}
																	className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
																	data-tooltip="Remover workspace do histórico"
																>
																	<Trash2 className="w-4 h-4" />
																</button>
															</div>
															<span className="font-semibold text-slate-800 dark:text-white truncate" data-tooltip={workspace.name}>
																{workspace.name}
															</span>
															<span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
																Clique para acessar
															</span>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className="flex-1 flex flex-col min-h-0">
									{/* Path Breadcrumb */}
									<div className="flex items-center gap-1 p-3 bg-slate-50 dark:bg-black/40 border-b border-black/5 dark:border-white/5 shrink-0 overflow-x-auto custom-scrollbar select-none">
										{pathStack.length > 1 && (
											<button
												onClick={handleGoBack}
												className="flex items-center gap-1 mr-2 px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
											>
												<CornerUpLeft className="w-4 h-4" />
												<span className="text-sm font-medium">Voltar</span>
											</button>
										)}
										
										{pathStack.map((p, index) => (
											<div key={index} className="flex items-center shrink-0">
												{index > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />}
												<button 
													onClick={() => {
														if (index < pathStack.length - 1) {
															setPathStack(prev => prev.slice(0, index + 1));
														}
													}}
													className={`text-sm rounded-md px-1.5 py-0.5 transition-colors ${
														index < pathStack.length - 1 
															? 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer' 
															: 'font-semibold text-slate-800 dark:text-white cursor-default'
													}`}
												>
													{p.name}
												</button>
											</div>
										))}
									</div>

									{/* File List */}
									<div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
										{isLoading ? (
											<div className="flex items-center justify-center h-32">
												<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
											</div>
										) : entries.length === 0 ? (
											<div className="flex flex-col items-center justify-center h-48 text-slate-500 dark:text-slate-400">
												<Folder className="w-12 h-12 mb-3 opacity-20" />
												<p>Esta pasta está vazia ou não contém arquivos suportados.</p>
											</div>
										) : (
											<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-8">
												{entries.map((entry, idx) => (
													<button
														key={`${entry.name}-${idx}`}
														onClick={() => handleEntryClick(entry)}
														className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 hover:bg-blue-50 dark:hover:bg-white/10 hover:border-blue-200 dark:hover:border-white/10 transition-colors text-left group shadow-sm"
													>
														{entry.kind === 'directory' ? (
															<Folder className="w-6 h-6 text-amber-500 shrink-0" fill="currentColor" fillOpacity={0.2} />
														) : (
															<FileText className="w-6 h-6 text-blue-500 shrink-0" />
														)}
														<span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate flex-1">
															{entry.name}
														</span>
													</button>
												))}
											</div>
										)}
									</div>
									
									{/* Footer Notice */}
									<div className="absolute bottom-2 right-4 pointer-events-none">
										<span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 select-none bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded backdrop-blur-md">
											Exibindo somente pastas e arquivos de texto
										</span>
									</div>
								</div>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
