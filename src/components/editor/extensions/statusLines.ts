import {
	Decoration,
	type DecorationSet,
	EditorView,
	ViewPlugin,
	type ViewUpdate,
} from '@codemirror/view';

// Decorações de linha para status
const doneLineDeco = Decoration.line({ class: 'cm-line-done' });
const alertLineDeco = Decoration.line({ class: 'cm-line-alert' });
const infoLineDeco = Decoration.line({ class: 'cm-line-info' });
const progressLineDeco = Decoration.line({ class: 'cm-line-progress' });
const cancelledLineDeco = Decoration.line({ class: 'cm-line-cancelled' });

/**
 * Padrões de status para detectar nas linhas
 */
const STATUS_PATTERNS: { pattern: RegExp; decoration: Decoration }[] = [
	{ pattern: /✅|☑️|\[x\]|\[X\]/u, decoration: doneLineDeco },
	{ pattern: /⚠️|🔶|⚡/u, decoration: alertLineDeco },
	{ pattern: /ℹ️|💡|📌/u, decoration: infoLineDeco },
	{ pattern: /🔄️?|⏳|🔁/u, decoration: progressLineDeco },
	{ pattern: /❌|🚫|✖️/u, decoration: cancelledLineDeco },
];

/**
 * Constrói decorações de linha baseado no conteúdo
 * Otimizado para processar apenas viewport visível
 */
function buildStatusDecorations(view: EditorView): DecorationSet {
	const decorations: { pos: number; deco: Decoration }[] = [];

	// Processar apenas linhas visíveis
	const { from: viewFrom, to: viewTo } = view.viewport;

	try {
		const startLine = view.state.doc.lineAt(viewFrom).number;
		const endLine = view.state.doc.lineAt(viewTo).number;

		for (let i = startLine; i <= endLine; i++) {
			const line = view.state.doc.line(i);
			const text = line.text;

			for (const { pattern, decoration } of STATUS_PATTERNS) {
				if (pattern.test(text)) {
					decorations.push({ pos: line.from, deco: decoration });
					break; // Só uma decoração por linha
				}
			}
		}
	} catch {
		return Decoration.none;
	}

	// Já está ordenado pois iteramos linha a linha
	return Decoration.set(
		decorations.map(d => d.deco.range(d.pos))
	);
}

/**
 * Extensão Status Lines - colore linhas baseado em emojis/marcadores
 */
export const statusLinesExtension = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = buildStatusDecorations(view);
		}

		update(update: ViewUpdate) {
			// Atualizar quando doc muda OU viewport muda (scroll)
			if (update.docChanged || update.viewportChanged) {
				this.decorations = buildStatusDecorations(update.view);
			}
		}
	},
	{
		decorations: (v) => v.decorations,
	}
);

/**
 * Tema com cores para linhas de status
 */
export const statusLinesTheme = EditorView.baseTheme({
	// Done - verde suave
	'.cm-line-done': {
		backgroundColor: 'rgba(34, 197, 94, 0.08)',
		boxShadow: 'inset 3px 0 0 0 rgba(34, 197, 94, 0.6)',
	},
	// Alert - amarelo/laranja suave
	'.cm-line-alert': {
		backgroundColor: 'rgba(251, 191, 36, 0.08)',
		boxShadow: 'inset 3px 0 0 0 rgba(251, 191, 36, 0.6)',
	},
	// Info - azul suave
	'.cm-line-info': {
		backgroundColor: 'rgba(59, 130, 246, 0.08)',
		boxShadow: 'inset 3px 0 0 0 rgba(59, 130, 246, 0.5)',
	},
	// Progress - roxo suave (🔄️)
	'.cm-line-progress': {
		backgroundColor: 'rgba(139, 92, 246, 0.08)',
		boxShadow: 'inset 3px 0 0 0 rgba(139, 92, 246, 0.6)',
	},
	// Cancelled - cinza (❌)
	'.cm-line-cancelled': {
		backgroundColor: 'rgba(107, 114, 128, 0.06)',
		boxShadow: 'inset 3px 0 0 0 rgba(107, 114, 128, 0.4)',
	},
});
