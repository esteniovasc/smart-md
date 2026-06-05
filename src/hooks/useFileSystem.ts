import { useEffect, useCallback } from 'react';
import { useTabsStore } from '../stores/useTabsStore';
import { openFilePicker, saveFile, checkExternalModification, readFileFromHandle, storeFileHandle } from '../utils/fileSystem';

export const useFileSystem = () => {
	// Store é acessada dinamicamente nos callbacks via useTabsStore.getState()

	const handleOpen = useCallback(async () => {
		const fileData = await openFilePicker();
		if (!fileData) return;

		// Check if already open
		const existingTab = useTabsStore.getState().tabs.find(t => t.title === fileData.title && t.content === fileData.content);
		if (existingTab) {
			useTabsStore.getState().setActiveTab(existingTab.id);
			return;
		}

		useTabsStore.getState().createTab(fileData.title, fileData.content);
		
		// The active tab is now the newly created one (createTab automatically sets activeTab)
		// We need to attach the handle to it
		setTimeout(() => {
			const state = useTabsStore.getState();
			const newTab = state.getActiveTab();
			if (newTab && fileData.handle) {
				useTabsStore.setState({
					tabs: state.tabs.map(t => t.id === newTab.id ? { ...t, fileHandle: fileData.handle, lastModified: fileData.lastModified } : t)
				});
				storeFileHandle(newTab.id, fileData.handle);
			}
		}, 0);
	}, []);

	const handleSave = useCallback(async () => {
		const state = useTabsStore.getState();
		const tab = state.getActiveTab();
		if (!tab) return;

		const result = await saveFile(tab.content, tab.fileHandle, tab.title);
		if (result.success) {
			const newTabs = state.tabs.map(t => {
				if (t.id === tab.id) {
					const updatedTab = { ...t, isModified: false, updatedAt: Date.now() };
					if (result.handle) {
						updatedTab.fileHandle = result.handle;
						storeFileHandle(t.id, result.handle);
					}
					if (result.lastModified) {
						updatedTab.lastModified = result.lastModified;
					}
					// Se era 'Sem título', atualiza o nome (no caso do fallback fallbackDownload, não temos o File real, mas no saveFileAs sim)
					if (result.handle && tab.title === 'Sem título') {
						result.handle.getFile().then((file: File) => {
							useTabsStore.getState().updateTabTitle(tab.id, file.name);
						});
					}
					return updatedTab;
				}
				return t;
			});
			useTabsStore.setState({ tabs: newTabs });
		}
	}, []);

	// Global Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				if (e.key === 's' || e.key === 'S') {
					e.preventDefault();
					handleSave();
				}
				if (e.key === 'o' || e.key === 'O') {
					e.preventDefault();
					handleOpen();
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleSave, handleOpen]);

	// Watch Mode: Check for external modifications on window focus
	useEffect(() => {
		let isChecking = false;

		const handleFocus = async () => {
			if (isChecking) return;
			// Aguarda 500ms para garantir que o SO (ou Google Drive) sincronizou os metadados do arquivo local
			setTimeout(async () => {
				isChecking = true;
				try {
					const state = useTabsStore.getState();
					const activeTab = state.getActiveTab();
					if (!activeTab || !activeTab.fileHandle || !activeTab.lastModified) return;

					const hasChanged = await checkExternalModification(activeTab.fileHandle, activeTab.lastModified);
					if (hasChanged) {
						const confirmReload = window.confirm(`O arquivo "${activeTab.title}" foi modificado externamente. Deseja recarregar as novas alterações?\n\nAviso: Você perderá as edições não salvas do Smart MD.`);
						if (confirmReload) {
							const updatedFile = await readFileFromHandle(activeTab.fileHandle);
							if (updatedFile) {
								useTabsStore.setState({
									tabs: useTabsStore.getState().tabs.map(t => 
										t.id === activeTab.id 
											? { ...t, content: updatedFile.content, lastModified: updatedFile.lastModified, isModified: false } 
											: t
									)
								});
							}
						} else {
							// User chose not to reload. We should update lastModified so it doesn't keep asking
							const currentFile = await activeTab.fileHandle.getFile().catch(() => null);
							const newTime = currentFile ? currentFile.lastModified : Date.now();
							useTabsStore.setState({
								tabs: useTabsStore.getState().tabs.map(t => 
									t.id === activeTab.id ? { ...t, lastModified: newTime } : t
								)
							});
						}
					}
				} finally {
					isChecking = false;
				}
			}, 500);
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				handleFocus();
			}
		};

		window.addEventListener('focus', handleFocus);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		
		return () => {
			window.removeEventListener('focus', handleFocus);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, []);

	return { handleOpen, handleSave };
};
