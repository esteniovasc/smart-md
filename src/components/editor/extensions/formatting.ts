import { keymap } from '@uiw/react-codemirror';
import { type StateCommand, EditorSelection } from '@codemirror/state';

/**
 * Cria um comando de formatação (ex: **texto**, *texto*, ~~texto~~)
 * Se houver seleção: envolve o texto selecionado.
 * Se NÃO houver seleção: insere os marcadores vazios e coloca o cursor no meio.
 * 
 * @param mark A string de marcação (ex: "**", "*", "~~")
 */
export const toggleFormat = (mark: string): StateCommand => {
	return ({ state, dispatch }) => {
		const changes = state.changeByRange(range => {
			// Se estiver vazio (nenhuma seleção)
			if (range.empty) {
				return {
					changes: [{ from: range.from, insert: mark + mark }],
					range: EditorSelection.cursor(range.from + mark.length)
				};
			}

			// Check if already formatted (basic toggle logic)
			const before = state.sliceDoc(Math.max(0, range.from - mark.length), range.from);
			const after = state.sliceDoc(range.to, Math.min(state.doc.length, range.to + mark.length));

			if (before === mark && after === mark) {
				// Remove format
				return {
					changes: [
						{ from: range.from - mark.length, to: range.from, insert: '' },
						{ from: range.to, to: range.to + mark.length, insert: '' }
					],
					range: EditorSelection.range(range.from - mark.length, range.to - mark.length)
				};
			}

			// Apply format
			return {
				changes: [{ from: range.from, insert: mark }, { from: range.to, insert: mark }],
				range: EditorSelection.range(range.from + mark.length, range.to + mark.length)
			};
		});

		dispatch(state.update(changes, { scrollIntoView: true, userEvent: 'input' }));
		return true;
	};
};

export const formattingKeymap = keymap.of([
	{
		key: 'Mod-b',
		run: toggleFormat('**'),
		preventDefault: true,
	},
	{
		key: 'Mod-i',
		run: toggleFormat('*'),
		preventDefault: true,
	},
	{
		key: 'Mod-Shift-x',
		run: toggleFormat('~~'),
		preventDefault: true,
	},
]);
