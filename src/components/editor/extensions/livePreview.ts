import {
	Decoration,
	type DecorationSet,
	EditorView,
	ViewPlugin,
	type ViewUpdate,
	WidgetType,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import type { MarkdownViewMode } from '../../../stores/useSettingsStore';

// --- WIDGETS ---

class HiddenMarkerWidget extends WidgetType {
	toDOM() {
		const span = document.createElement('span');
		span.className = 'cm-hidden-marker';
		return span;
	}
}

class HrWidget extends WidgetType {
	toDOM() {
		const div = document.createElement('div');
		div.className = 'cm-hr-widget';
		const line = document.createElement('hr');
		div.appendChild(line);
		return div;
	}
}

const hiddenWidget = new HiddenMarkerWidget();
const hrWidget = new HrWidget();

// Decoration.replace não aceita 'block: true'. Removemos para evitar comportamento indefinido.
// O widget em si pode ser estilizado como block via CSS.
const replaceDeco = Decoration.replace({ widget: hiddenWidget });
const hrDeco = Decoration.replace({ widget: hrWidget });

// --- DECORATION BUILDER ---

function buildDecorations(view: EditorView, mode: MarkdownViewMode): DecorationSet {
	// Se modo 'visible', não esconde nada
	if (!mode || mode === 'visible') return Decoration.none;

	const builder = new RangeSetBuilder<Decoration>();
	const candidates: Array<{ from: number; to: number; deco: Decoration }> = [];

	const { state } = view;
	const doc = state.doc;

	if (doc.length === 0) return Decoration.none;

	const selection = state.selection;
	const cursorHead = selection.main.head;
	const cursorLineObj = doc.lineAt(cursorHead);
	const cursorLineNum = cursorLineObj.number;

	try {
		// Varredura completa do documento usando a árvore de sintaxe oficial
		syntaxTree(state).iterate({
			from: 0,
			to: doc.length,
			enter: (node) => {
				// 1. Horizontal Rules (---)
				// O parser garante que só entra aqui se for hr real
				if (node.name === 'HorizontalRule') {
					if (mode === 'current-line' && doc.lineAt(node.from).number === cursorLineNum) return;

					candidates.push({ from: node.from, to: node.to, deco: hrDeco });
					return;
				}

				// 2. Header Marks (# ou ---/===)
				// O parser identifica 'HeaderMark' tanto para ATX (# Título) quanto Setext (Título \n ---)
				// Isso simplifica tudo: se é HeaderMark, nós escondemos.
				// O parser já resolveu se é título ou HR.
				if (node.name === 'HeaderMark') {
					if (mode === 'current-line' && doc.lineAt(node.from).number === cursorLineNum) return;

					candidates.push({ from: node.from, to: node.to, deco: replaceDeco });
					return;
				}

				// 3. Ênfase / Formatação
				if (node.name === 'EmphasisMark' || node.name === 'StrongEmphasisMark' || node.name === 'CodeMark' || node.name === 'LinkMark') {
					if (mode === 'current-line' && doc.lineAt(node.from).number === cursorLineNum) return;

					candidates.push({ from: node.from, to: node.to, deco: replaceDeco });
					return;
				}
			},
		});

		// --- SORT & FILTER (Anti-Crash) ---
		candidates.sort((a, b) => a.from - b.from || a.to - b.to);

		let lastTo = 0;
		for (const cand of candidates) {
			// Double check limites
			if (cand.to > doc.length) continue;

			// Ignorar sobreposições
			if (cand.from < lastTo) continue;

			builder.add(cand.from, cand.to, cand.deco);
			lastTo = cand.to;
		}

	} catch (e) {
		console.error("SmartMD LivePreview Crash Prevention:", e);
		return Decoration.none;
	}

	return builder.finish();
}

/**
 * Extensão Live Preview - Modo Seguro
 */
export function createLivePreviewExtension(mode: MarkdownViewMode) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildDecorations(view, mode);
			}

			update(update: ViewUpdate) {
				if (
					update.docChanged ||
					update.viewportChanged ||
					update.selectionSet
				) {
					this.decorations = buildDecorations(update.view, mode);
				}
			}
		},
		{
			decorations: (v) => v.decorations,
		}
	);
}

export const livePreviewTheme = EditorView.baseTheme({
	'.cm-hidden-marker': {
		display: 'inline-block',
		width: '0',
		height: '0',
		overflow: 'hidden',
		verticalAlign: 'text-top',
	},
	'.cm-hr-widget': {
		display: 'flex', // Flex para ocupar a linha corretamente
		width: '100%',
		alignItems: 'center',
		cursor: 'default',
		userSelect: 'none',
		minHeight: '1em', // Garante altura mínima
	},
	'.cm-hr-widget hr': {
		width: '100%',
		border: 'none',
		borderTop: '2px solid var(--cm-hr-color, rgba(148, 163, 184, 0.4))',
		margin: '0',
		borderRadius: '2px',
	}
});
