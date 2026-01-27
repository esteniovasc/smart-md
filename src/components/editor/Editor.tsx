import { useMemo, useCallback } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { useTabsStore } from '../../stores/useTabsStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

/**
 * Cria tema transparente para efeito Liquid Glass
 */
const createGlassTheme = (isDark: boolean) => {
  return EditorView.theme({
    '&': {
      backgroundColor: 'transparent',
      height: '100%',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      borderRight: 'none',
      color: isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.5)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
      color: isDark ? 'rgba(148, 163, 184, 0.8)' : 'rgba(100, 116, 139, 0.8)',
    },
    '.cm-content': {
      caretColor: isDark ? '#60a5fa' : '#3b82f6',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      fontSize: '14px',
      lineHeight: '1.6',
    },
    '.cm-line': {
      padding: '0 4px',
    },
    '.cm-activeLine': {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
      backgroundColor: isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(59, 130, 246, 0.2)',
    },
    '.cm-cursor': {
      borderLeftColor: isDark ? '#60a5fa' : '#3b82f6',
      borderLeftWidth: '2px',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
    // Markdown syntax highlighting ajustes
    '.cm-header': {
      color: isDark ? '#c084fc' : '#7c3aed',
      fontWeight: '600',
    },
    '.cm-strong': {
      color: isDark ? '#f472b6' : '#db2777',
      fontWeight: '700',
    },
    '.cm-emphasis': {
      color: isDark ? '#34d399' : '#059669',
      fontStyle: 'italic',
    },
    '.cm-link': {
      color: isDark ? '#60a5fa' : '#2563eb',
      textDecoration: 'underline',
    },
    '.cm-url': {
      color: isDark ? 'rgba(96, 165, 250, 0.7)' : 'rgba(37, 99, 235, 0.7)',
    },
    '.cm-meta': {
      color: isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.6)',
    },
  }, { dark: isDark });
};

/**
 * Editor - CodeMirror com estilo Liquid Glass
 * Sincronizado com a aba ativa da store
 */
export const Editor = () => {
  const theme = useSettingsStore((s) => s.theme);
  const tabs = useTabsStore((s) => s.tabs);
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const updateTabContent = useTabsStore((s) => s.updateTabContent);

  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId);
  }, [tabs, activeTabId]);

  const isDark = theme === 'dark';

  const extensions = useMemo(() => [
    markdown(),
    EditorView.lineWrapping,
    createGlassTheme(isDark),
  ], [isDark]);

  const handleChange = useCallback((value: string) => {
    if (activeTabId) {
      updateTabContent(activeTabId, value);
    }
  }, [activeTabId, updateTabContent]);

  // Estado vazio - sem aba ativa
  if (!activeTab) {
    return (
      <div className="h-full w-full flex items-center justify-center glass-panel">
        <div className="text-center">
          <p className="text-lg text-slate-400 dark:text-gray-500 mb-2">
            Nenhuma aba aberta
          </p>
          <p className="text-sm text-slate-300 dark:text-gray-600">
            Crie uma nova aba para começar a escrever
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden glass-panel">
      <CodeMirror
        value={activeTab.content}
        onChange={handleChange}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
          searchKeymap: true,
        }}
        className="h-full text-slate-800 dark:text-gray-100"
      />
    </div>
  );
};
