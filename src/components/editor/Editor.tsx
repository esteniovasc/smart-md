import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import CodeMirror, { EditorView, keymap } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { useTabsStore } from '../../stores/useTabsStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { createLivePreviewExtension, livePreviewTheme } from './extensions/livePreview';
import { statusLinesExtension, statusLinesTheme } from './extensions/statusLines';
import { bulletPointsExtension, bulletPointsTheme } from './extensions/bulletPoints';

/**
 * Cria tema transparente para efeito Liquid Glass
 */
const createGlassTheme = (isDark: boolean, highlightActiveLine: boolean, fontSize: number) => {
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
			fontSize: `${fontSize}px`,
			lineHeight: '1.6',
		},
		'.cm-line': {
			padding: '0 4px',
		},
		'.cm-activeLine': {
			backgroundColor: highlightActiveLine
				? (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)')
				: 'transparent',
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
	const showLineNumbers = useSettingsStore((s) => s.showLineNumbers);
	const enableWordWrap = useSettingsStore((s) => s.enableWordWrap);
	const markdownViewMode = useSettingsStore((s) => s.markdownViewMode);
	const enableStatusColors = useSettingsStore((s) => s.enableStatusColors);
	const enableHighlightActiveLine = useSettingsStore((s) => s.enableHighlightActiveLine);
	const restoreCursorPosition = useSettingsStore((s) => s.restoreCursorPosition);
	const editorFontSize = useSettingsStore((s) => s.editorFontSize);
	const setEditorFontSize = useSettingsStore((s) => s.setEditorFontSize);

	const tabs = useTabsStore((s) => s.tabs);
	const activeTabId = useTabsStore((s) => s.activeTabId);
	const updateTabContent = useTabsStore((s) => s.updateTabContent);
	const updateTabSelection = useTabsStore((s) => s.updateTabSelection);
	const updateTabScroll = useTabsStore((s) => s.updateTabScroll);

	const activeTab = useMemo(() => {
		return tabs.find((t) => t.id === activeTabId);
	}, [tabs, activeTabId]);

	const isDark = theme === 'dark';

	// Estado local para a view (garante que o efeito rode quando a view for criada)
	const [view, setView] = useState<EditorView | null>(null);
	// Ref redundante para acesso síncrono em callbacks/listeners sem re-render excessivo (opcional, mas bom pra guards)
	const viewRef = useRef<EditorView | null>(null);

	// Atualiza refs quando o state muda
	useEffect(() => {
		viewRef.current = view;
	}, [view]);

	// Efeito para restaurar foco, cursor e scroll de forma SEMÂNTICA
	// Agora depende de 'view', então roda garantidamente APÓS o mount do CodeMirror
	useEffect(() => {
		if (activeTabId && restoreCursorPosition && view) {
			view.focus();

			if (activeTab) {
				const currentTabId = activeTabId; // Capture ID for closure

				// requestAnimationFrame garante que rodamos logo após o paint inicial
				requestAnimationFrame(() => {
					// RACE CONDITION CHECK:
					if (useTabsStore.getState().activeTabId !== currentTabId) return;

					// 1. Restaurar SCROLL SEMÂNTICO
					if (typeof activeTab.scrollPosition === 'number') {
						view.dispatch({
							effects: EditorView.scrollIntoView(activeTab.scrollPosition, { y: 'start' })
						});
					}

					// 2. Restaurar CURSOR (Modo Seguro / Clamped)
					if (activeTab.selection) {
						let { anchor, head } = activeTab.selection;
						const docLength = view.state.doc.length;

						// Segurança: Se o documento ainda estiver vazio (mas não deveria ser), evitamos restaurar
						// a menos que a seleção também seja 0.
						if (docLength === 0 && anchor > 0) return;

						// CLAMPING: Garantimos que o cursor nunca ultrapasse o tamanho do doc atual.
						anchor = Math.min(anchor, docLength);
						head = Math.min(head, docLength);

						view.dispatch({
							selection: { anchor, head },
							scrollIntoView: false,
						});
					}
				});
			}
		}
	}, [activeTabId, restoreCursorPosition, view]); // Dependência em VIEW é a chave

	// Extensões reativas baseadas nas configurações
	const extensions = useMemo(() => {
		const exts = [
			markdown(),
			createGlassTheme(isDark, enableHighlightActiveLine, editorFontSize),

			// Listener unificado para Salvar Estado (Seleção + Scroll)
			// Inclui proteção contra "System Resets" (Tab Switching)
			EditorView.updateListener.of((update) => {
				if (!activeTabId) return;

				// Identificar se houve interação do usuário
				const isUserEvent = update.transactions.some((tr) =>
					tr.isUserEvent('select') ||
					tr.isUserEvent('input') ||
					tr.isUserEvent('delete') ||
					tr.isUserEvent('undo') ||
					tr.isUserEvent('redo')
				);

				// 1. GUARD GERAL (Doc Change)
				// Se o documento mudou DRASTICAMENTE (ex: troca de aba) 
				// e NÃO foi interação do usuário, ignoramos.
				if (update.docChanged && !isUserEvent) {
					return;
				}

				const selection = update.state.selection.main;

				// 2. GUARD DE ZERO (Seleção Resetada)
				// Se a seleção foi para 0,0 e NÃO foi o usuário (click/touch),
				// assumimos que é um reset de sistema e NÃO salvamos.
				if (selection.anchor === 0 && selection.head === 0 && !isUserEvent) {
					return;
				}

				// 3. Salvar Seleção
				if (update.selectionSet) {
					updateTabSelection(activeTabId, { anchor: selection.anchor, head: selection.head });
				}

				// 4. Salvar Scroll Semântico
				if (update.viewportChanged) {
					const scrollTop = update.view.scrollDOM.scrollTop;

					// GUARD DE SCROLL ZERO:
					// Se o scroll foi para 0, mas NÃO foi detectado evento de usuário,
					// é muito provável que seja um reset de sistema (load de arquivo).
					// Ignoramos para não perder a posição salva anterior.
					// (Exceção: se o doc estiver vazio, ok ser 0).
					if (scrollTop === 0 && !isUserEvent && update.view.state.doc.length > 0) {
						return;
					}

					const topBlock = update.view.lineBlockAtHeight(scrollTop);
					updateTabScroll(activeTabId, topBlock.from);
				}
			}),

			// Atalhos de teclado para zoom
			keymap.of([
				{
					key: 'Mod-=',
					run: () => {
						setEditorFontSize(editorFontSize + 1);
						return true;
					},
					preventDefault: true,
				},
				{
					key: 'Mod-+', // Shift-= geralmente
					run: () => {
						setEditorFontSize(editorFontSize + 1);
						return true;
					},
					preventDefault: true,
				},
				{
					key: 'Mod--',
					run: () => {
						if (editorFontSize > 6) {
							setEditorFontSize(editorFontSize - 1);
						}
						return true;
					},
					preventDefault: true,
				},
			]),
		];

		// Quebra de linha
		if (enableWordWrap) {
			exts.push(EditorView.lineWrapping);
		}

		// Live Preview - baseado no modo selecionado
		if (markdownViewMode !== 'visible') {
			exts.push(createLivePreviewExtension(markdownViewMode), livePreviewTheme);
		}

		// Status Colors - pinta linhas com emojis
		if (enableStatusColors) {
			exts.push(statusLinesExtension, statusLinesTheme);
		}

		// Visual Bullet Points - sempre ativo (por enquanto)
		exts.push(bulletPointsExtension, bulletPointsTheme);

		return exts;
	}, [isDark, enableWordWrap, markdownViewMode, enableStatusColors, enableHighlightActiveLine, activeTabId, updateTabSelection, updateTabScroll, editorFontSize, setEditorFontSize]);

	const handleChange = useCallback((value: string, viewUpdate: any) => {
		if (activeTabId) {
			// Atualiza conteúdo
			updateTabContent(activeTabId, value);

			// Atualiza seleção ATOMICAMENTE com o conteúdo
			// Isso garante que se o usuário digitar e trocar de aba, 
			// a posição do cursor acompanha o novo texto imediatamente.
			if (viewUpdate && viewUpdate.state && viewUpdate.state.selection) {
				const selection = viewUpdate.state.selection.main;
				updateTabSelection(activeTabId, { anchor: selection.anchor, head: selection.head });
			}
		}
	}, [activeTabId, updateTabContent, updateTabSelection]);

	// Callback para capturar a referência da view
	const handleCreateEditor = useCallback((view: EditorView) => {
		setView(view);
	}, []);

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
				key={activeTabId} // FORÇA O REMOUNT AO TROCAR DE ABA (ISOLAMENTO TOTAL)
				value={activeTab.content}
				onChange={handleChange}
				onCreateEditor={handleCreateEditor}
				extensions={extensions}
				autoFocus={true}
				basicSetup={{
					lineNumbers: showLineNumbers,
					highlightActiveLineGutter: showLineNumbers && enableHighlightActiveLine,
					highlightActiveLine: enableHighlightActiveLine,
					foldGutter: showLineNumbers,
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
