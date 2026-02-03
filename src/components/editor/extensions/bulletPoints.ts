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
import type { ListMarkerConfig } from '../../../stores/useSettingsStore';

// ----------------------------------------------------------------------
// SMART COLOR UTILS
// ----------------------------------------------------------------------

/**
 * Ajusta cor para contraste inteligente.
 * SIMPLIFICADO: A responsabilidade de garantir contraste agora é do SettingsModal (botão "Corrigir")
 * e do Store (ao trocar de tema).
 * Aqui apenas retornamos a cor configurada, ou vazio para herdar.
 */
function getSmartColor(color: string, _isDark: boolean): string {
	if (!color) return ''; // Retorna vazio para herdar a cor do texto (currentColor)

	// Se não for hex válido, retorna original
	if (!/^#?[0-9A-F]{6}([0-9A-F]{2})?$/i.test(color)) return color;

	// O usuário pediu explicitamente para remover a correção automática "agressiva".
	// Agora obedecemos fielmente o que está na config.
	return color;
}

// ----------------------------------------------------------------------
// WIDGET (SUBSTITUI O TEXTO)
// ----------------------------------------------------------------------
class BulletWidget extends WidgetType {
	private color: string;

	constructor(color: string) {
		super();
		this.color = color;
	}

	eq(other: BulletWidget) {
		return other.color === this.color;
	}

	toDOM() {
		const span = document.createElement('span');
		span.innerHTML = '•';
		span.className = 'cm-bullet-widget';
		span.style.color = this.color; // Aplica cor calculada/inteligente
		return span;
	}
}

// Factory para criar widgets cacheados (opcional, mas bom pra performance se fossem muitos)
// Como a cor pode ser arbitrária, criamos on-the-fly, WidgetType é leve.

/**
 * Constrói decorações com base na configuração
 */
function buildBulletDecorations(view: EditorView, markersConfig: Record<string, ListMarkerConfig>, isDark: boolean): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();

	for (const { from, to } of view.visibleRanges) {
		syntaxTree(view.state).iterate({
			from,
			to,
			enter: (node) => {
				if (node.name === 'ListMark') {
					const markText = view.state.sliceDoc(node.from, node.to);
					const char = markText[0];

					// Verifica se é um dos nossos marcadores (*, -, +)
					// E se está HABILITADO na config
					const config = markersConfig[char];

					// Se não tiver config (ex: numero) ou estiver desabilitado, ignora
					if (!config || !config.enabled) return;

					// Lógica Google Docs (Espaço Obrigatório)
					const nextChar = view.state.sliceDoc(node.to, node.to + 1);
					const hasSpace = /[ \t]/.test(markText) || /[ \t]/.test(nextChar);

					if (hasSpace) {
						// Calcula Smart Color
						const finalColor = getSmartColor(config.color, isDark);

						// Cria Widget com a cor específica
						const widget = new BulletWidget(finalColor);
						const deco = Decoration.replace({ widget });

						builder.add(node.from, node.to, deco);
					}
				}
			},
		});
	}

	return builder.finish();
}


/**
 * Factory para criar a extensão com as configurações atuais
 */
export const createBulletPointsExtension = (
	markersConfig: Record<string, ListMarkerConfig>,
	isDark: boolean
) => {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildBulletDecorations(view, markersConfig, isDark);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged || update.selectionSet) {
					this.decorations = buildBulletDecorations(update.view, markersConfig, isDark);
				}
			}
		},
		{
			decorations: (v) => v.decorations,
		}
	);
};

/**
 * Tema Base (Layout)
 * A cor agora é inline via style no Widget, então removemos color daqui para não conflitar
 */
export const bulletPointsTheme = EditorView.baseTheme({
	'.cm-bullet-widget': {
		display: 'inline-block',
		width: '24px',
		textAlign: 'center',
		fontSize: '1.4em',
		lineHeight: '1',
		fontWeight: 'bold',
		verticalAlign: 'middle',
		cursor: 'default',
		userSelect: 'none',
		marginTop: '-2px',
		// Color é gerenciado pelo Widget.style
	}
});
