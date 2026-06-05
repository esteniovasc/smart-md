import { EditorView } from '@codemirror/view';
import { useStatusBarStore } from '../../stores/useStatusBarStore';

export const statusBarExtension = EditorView.updateListener.of((update) => {
	// Only run if the document or selection changed
	if (!update.docChanged && !update.selectionSet) return;

	const head = update.state.selection.main.head;
	const line = update.state.doc.lineAt(head);
	const chars = update.state.doc.length;

	// Col is the head position minus the line's start position (1-indexed for display usually)
	const col = head - line.from + 1;

	// Use Zustand's setStats to update outside of React's lifecycle immediately
	useStatusBarStore.getState().setStats({
		line: line.number,
		col: col,
		chars: chars
	});
});
