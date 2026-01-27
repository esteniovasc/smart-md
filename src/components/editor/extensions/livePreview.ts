import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import type { MarkdownViewMode } from '../../../stores/useSettingsStore';

/**
 * Widget vazio para substituir marcadores Markdown
 */
class HiddenMarkerWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span');
    span.className = 'cm-hidden-marker';
    return span;
  }
}

const hiddenWidget = new HiddenMarkerWidget();
const replaceDecoration = Decoration.replace({ widget: hiddenWidget });

// Tipos de nós que queremos ocultar
const HIDDEN_NODE_TYPES = new Set([
  'HeaderMark',
  'EmphasisMark', 
  'StrikethroughMark',
  'CodeMark',
]);

/**
 * Cria decorações para ocultar marcadores Markdown
 * Otimizado para documentos grandes - processa apenas viewport visível
 */
function buildDecorations(view: EditorView, mode: MarkdownViewMode): DecorationSet {
  const decorations: { from: number; to: number }[] = [];
  const cursorLine = view.state.doc.lineAt(view.state.selection.main.head).number;
  
  // Processar apenas o viewport visível + margem
  const { from: viewFrom, to: viewTo } = view.viewport;
  
  try {
    syntaxTree(view.state).iterate({
      from: viewFrom,
      to: viewTo,
      enter(node) {
        if (!HIDDEN_NODE_TYPES.has(node.name)) return;
        
        // Evitar erro se node.from está fora do documento
        if (node.from >= view.state.doc.length) return;
        
        const line = view.state.doc.lineAt(node.from).number;
        
        // Se modo 'current-line', não ocultar na linha ativa
        if (mode === 'current-line' && line === cursorLine) return;

        // Headers: incluir espaço após o #
        const to = node.name === 'HeaderMark' 
          ? Math.min(node.to + 1, view.state.doc.length)
          : node.to;

        decorations.push({ from: node.from, to });
      },
    });
  } catch {
    // Se houver erro ao processar, retornar vazio
    return Decoration.none;
  }

  // Ordenar por posição (necessário para RangeSet)
  decorations.sort((a, b) => a.from - b.from);

  // Criar RangeSet a partir do array ordenado
  return Decoration.set(
    decorations.map(d => replaceDecoration.range(d.from, d.to))
  );
}

/**
 * Cria extensão Live Preview com modo configurável
 */
export function createLivePreviewExtension(mode: MarkdownViewMode) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view, mode);
      }

      update(update: ViewUpdate) {
        // No modo 'hidden', só atualiza se doc mudou
        // No modo 'current-line', atualiza também quando cursor move
        if (mode === 'hidden') {
          if (update.docChanged) {
            this.decorations = buildDecorations(update.view, mode);
          }
        } else {
          if (update.docChanged || update.selectionSet || update.viewportChanged) {
            this.decorations = buildDecorations(update.view, mode);
          }
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

/**
 * Tema para marcadores ocultos
 */
export const livePreviewTheme = EditorView.baseTheme({
  '.cm-hidden-marker': {
    display: 'none',
  },
});
