
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

// ----------------------------------------------------------------------
// WIDGET (SUBSTITUI O TEXTO)
// ----------------------------------------------------------------------
class BulletWidget extends WidgetType {
	toDOM() {
		const span = document.createElement('span');
		span.innerHTML = '•'; // O caractere do bullet
		span.className = 'cm-bullet-widget';
		return span;
	}
}

const bulletWidget = new BulletWidget();
const replaceDeco = Decoration.replace({ widget: bulletWidget });

function buildBulletDecorations(view: EditorView): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();

	// Usamos visibleRanges para ser mais eficiente com o parser, mas viewport funcionaria também
	for (const { from, to } of view.visibleRanges) {
		syntaxTree(view.state).iterate({
			from,
			to,
			enter: (node) => {
				// Detecta 'ListMark' gerado pelo parser Markdown
				if (node.name === 'ListMark') {
					const markText = view.state.sliceDoc(node.from, node.to);

					// Verifica se é um marcador de lista não-ordenada (*, -, +)
					// Isso ignora '1.' (listas numeradas) e 'HeaderMark' (#)
					// O parser Markdown garante que isso NÃO é ênfase (*italico*).
					if (/^[\*\-\+]\s?$/.test(markText)) {
						builder.add(node.from, node.to, replaceDeco);
					}
				}
			},
		});
	}

	return builder.finish();
}

/**
 * Extensão Bullet Points - Substituição REAL usando Widgets
 */
export const bulletPointsExtension = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = buildBulletDecorations(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged || update.selectionSet) {
				this.decorations = buildBulletDecorations(update.view);
			}
		}
	},
	{
		decorations: (v) => v.decorations,
	}
);

/**
 * Tema para estilizar o Bullet Widget
 */
export const bulletPointsTheme = EditorView.baseTheme({
	'.cm-bullet-widget': {
		display: 'inline-block',
		width: '24px',          // Espaço reservado para o bullet
		textAlign: 'center',    // Centralizado nesse espaço
		color: 'var(--cm-header-color, #6366f1)', // Roxo padrão
		fontSize: '1.4em',
		lineHeight: '1',
		fontWeight: 'bold',
		verticalAlign: 'middle',
		cursor: 'default',      // Mostra que é UI
		userSelect: 'none',     // Não selecionável como texto
		marginTop: '-2px',      // Ajuste fino de altura
	}
});
