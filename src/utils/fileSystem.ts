import { get, set, del } from 'idb-keyval';

export const isFSA_Supported = 'showOpenFilePicker' in window;

export interface FileData {
	handle?: any; // FileSystemFileHandle
	file?: File;
	content: string;
	title: string;
	lastModified: number;
}

// Persist handles in IDB
export const storeFileHandle = async (id: string, handle: any) => {
	if (!handle) return;
	await set(`fileHandle_${id}`, handle);
};

export const getStoredFileHandle = async (id: string): Promise<any | null> => {
	return await get(`fileHandle_${id}`) || null;
};

export const deleteStoredFileHandle = async (id: string) => {
	await del(`fileHandle_${id}`);
};

/**
 * Open File Picker using FSA API
 */
export const openFilePicker = async (): Promise<FileData | null> => {
	if (!isFSA_Supported) {
		// Fallback for browsers without FSA API: standard file input
		return new Promise((resolve) => {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.md,text/markdown,text/plain';
			input.onchange = async (e) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (!file) {
					resolve(null);
					return;
				}
				const content = await file.text();
				resolve({
					file,
					content,
					title: file.name,
					lastModified: file.lastModified,
				});
			};
			input.click();
		});
	}

	try {
		const [handle] = await (window as any).showOpenFilePicker({
			types: [
				{
					description: 'Markdown Files',
					accept: {
						'text/markdown': ['.md'],
						'text/plain': ['.txt'],
					},
				},
			],
			multiple: false,
		});

		const file = await handle.getFile();
		const content = await file.text();

		return {
			handle,
			file,
			content,
			title: file.name,
			lastModified: file.lastModified,
		};
	} catch (err: any) {
		if (err.name !== 'AbortError') {
			console.error('Error opening file:', err);
			alert('Falha ao abrir arquivo: ' + err.message);
		}
		return null;
	}
};

/**
 * Save existing file
 */
export const saveFile = async (content: string, handle?: any, fallbackTitle: string = 'Untitled.md'): Promise<{ success: boolean; lastModified?: number; handle?: any }> => {
	if (!isFSA_Supported) {
		fallbackDownload(content, fallbackTitle.endsWith('.md') ? fallbackTitle : `${fallbackTitle}.md`);
		return { success: true };
	}

	try {
		if (handle) {
			// Request permission just in case (useful after page reload)
			if ((await handle.queryPermission({ mode: 'readwrite' })) !== 'granted') {
				const perm = await handle.requestPermission({ mode: 'readwrite' });
				if (perm !== 'granted') return { success: false };
			}

			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();

			const file = await handle.getFile();
			return { success: true, lastModified: file.lastModified, handle };
		} else {
			return saveFileAs(content, fallbackTitle);
		}
	} catch (err: any) {
		if (err.name !== 'AbortError') {
			console.error('Error saving file:', err);
			alert('Falha ao salvar arquivo: ' + err.message);
		}
		return { success: false };
	}
};

/**
 * Save file as new (Save As)
 */
export const saveFileAs = async (content: string, defaultName: string = 'Untitled.md'): Promise<{ success: boolean; lastModified?: number; handle?: any }> => {
	if (!isFSA_Supported) {
		fallbackDownload(content, defaultName);
		return { success: true };
	}

	try {
		const handle = await (window as any).showSaveFilePicker({
			suggestedName: defaultName,
			types: [
				{
					description: 'Markdown File',
					accept: { 'text/markdown': ['.md'] },
				},
			],
		});

		const writable = await handle.createWritable();
		await writable.write(content);
		await writable.close();

		const file = await handle.getFile();
		return { success: true, lastModified: file.lastModified, handle };
	} catch (err: any) {
		if (err.name !== 'AbortError') {
			console.error('Error saving file as:', err);
		}
		return { success: false };
	}
};

/**
 * Download file directly (Fallback)
 */
export const fallbackDownload = (content: string, filename: string) => {
	const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
};

/**
 * Check if the file has been modified externally
 */
export const checkExternalModification = async (handle: any, knownLastModified?: number): Promise<boolean> => {
	if (!handle || !knownLastModified || !isFSA_Supported) return false;
	try {
		// Quick permission check without prompting
		if ((await handle.queryPermission({ mode: 'read' })) !== 'granted') return false;
		
		const file = await handle.getFile();
		return file.lastModified > knownLastModified;
	} catch (err) {
		return false; // Handle invalid or file deleted
	}
};

/**
 * Read updated content from handle
 */
export const readFileFromHandle = async (handle: any): Promise<{ content: string; lastModified: number } | null> => {
	if (!handle) return null;
	try {
		if ((await handle.queryPermission({ mode: 'read' })) !== 'granted') return null;
		const file = await handle.getFile();
		const content = await file.text();
		return { content, lastModified: file.lastModified };
	} catch (err) {
		return null;
	}
};
