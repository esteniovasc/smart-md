import { useState, useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { Bold, Italic, Strikethrough, List } from 'lucide-react';
import { toggleFormat } from './extensions/formatting';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorSelection } from '@codemirror/state';
import { createPortal } from 'react-dom';

interface SelectionMenuProps {
	view: EditorView | null;
}

interface ActiveFormats {
	bold: boolean;
	italic: boolean;
	strike: boolean;
	list: boolean;
}

interface MenuPosition {
	top: number;
	left: number;
	visible: boolean;
	isAbove: boolean;
	active: ActiveFormats;
}

export const SelectionMenu = ({ view }: SelectionMenuProps) => {
	const [pos, setPos] = useState<MenuPosition>({ 
		top: 0, left: 0, visible: false, isAbove: true, 
		active: { bold: false, italic: false, strike: false, list: false } 
	});
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!view) return;

		const updateMenu = () => {
			const state = view.state;
			const selection = state.selection.main;

			if (selection.empty) {
				setPos(p => ({ ...p, visible: false }));
				return;
			}

			const nativeSelection = window.getSelection();
			if (!nativeSelection || nativeSelection.rangeCount === 0) {
				setPos(p => ({ ...p, visible: false }));
				return;
			}
			
			const range = nativeSelection.getRangeAt(0);
			const rects = range.getClientRects();
			
			if (rects.length === 0) {
				setPos(p => ({ ...p, visible: false }));
				return;
			}

			// Pega apenas a primeira linha da seleção para não ficar muito alto
			// caso seja um bloco grande de texto.
			const firstRect = rects[0];

			// Centro horizontal da primeira linha da seleção
			const left = firstRect.left + firstRect.width / 2;
			
			let isAbove = true;
			let top = firstRect.top - 8; // 8px acima do texto
			
			// Se ficar muito pra cima na tela (ex: bateu no topo), renderiza embaixo
			if (top < 60) {
				isAbove = false;
				// Pegamos o bottom da última linha da seleção para colocar o menu depois do texto
				const lastRect = rects[rects.length - 1];
				top = lastRect.bottom + 8;
			}

			// Verificar formatos ativos com base nas extremidades da seleção (mesma lógica do toggleFormat)
			const active: ActiveFormats = { bold: false, italic: false, strike: false, list: false };
			
			const hasFormat = (mark: string) => {
				const before = state.sliceDoc(Math.max(0, selection.from - mark.length), selection.from);
				const after = state.sliceDoc(selection.to, Math.min(state.doc.length, selection.to + mark.length));
				return before === mark && after === mark;
			};

			active.bold = hasFormat('**');
			active.italic = hasFormat('*') && !active.bold;
			active.strike = hasFormat('~~');
			
			// Verificação para lista baseada na linha
			const line = state.doc.lineAt(selection.from);
			if (line.text.match(/^([*\-+] )/)) {
				active.list = true;
			}

			setPos({
				top,
				left,
				visible: true,
				isAbove,
				active
			});
		};

		// Escutar o evento de mouseup e keyup para atualizar, 
		// assim como scroll para reposicionar/esconder
		const dom = view.scrollDOM;
		
		const handleUpdate = () => {
			// Usamos setTimeout para garantir que o CodeMirror atualizou a seleção interna
			setTimeout(updateMenu, 10);
		};

		dom.addEventListener('mouseup', handleUpdate);
		dom.addEventListener('keyup', handleUpdate);
		dom.addEventListener('scroll', handleUpdate);
		
		// Evento resize da janela também deve esconder ou reposicionar
		window.addEventListener('resize', handleUpdate);

		return () => {
			dom.removeEventListener('mouseup', handleUpdate);
			dom.removeEventListener('keyup', handleUpdate);
			dom.removeEventListener('scroll', handleUpdate);
			window.removeEventListener('resize', handleUpdate);
		};
	}, [view]);

	// Impede que o clique no menu tire o foco do editor
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
	};

	const applyFormat = (mark: string) => {
		if (!view) return;
		toggleFormat(mark)({ state: view.state, dispatch: view.dispatch });
		view.focus();
		// Força a atualização do menu enviando um evento para o listener existente
		setTimeout(() => view.scrollDOM.dispatchEvent(new Event('mouseup')), 10);
	};

	const applyBulletList = () => {
		if (!view) return;
		const state = view.state;
		
		const changes = state.changeByRange(range => {
			// Encontra a linha atual
			const line = state.doc.lineAt(range.from);
			const lineText = line.text;
			
			// Se já for uma lista (começa com * ou - ou + e espaço), remove
			const listMatch = lineText.match(/^([*\-+] )/);
			
			if (listMatch) {
				return {
					changes: { from: line.from, to: line.from + listMatch[0].length, insert: '' },
					range: EditorSelection.range(range.from - listMatch[0].length, range.to - listMatch[0].length)
				};
			}
			
			// Adiciona o marcador de lista no início da linha
			return {
				changes: { from: line.from, insert: '* ' },
				range: EditorSelection.range(range.from + 2, range.to + 2)
			};
		});
		
		view.dispatch(state.update(changes, { scrollIntoView: true, userEvent: 'input' }));
		view.focus();
		// Força a atualização do menu
		setTimeout(() => view.scrollDOM.dispatchEvent(new Event('mouseup')), 10);
	};

	return createPortal(
		<AnimatePresence>
			{pos.visible && (
				<motion.div
					ref={menuRef}
					initial={{ opacity: 0, x: "-50%", y: pos.isAbove ? "calc(-100% + 10px)" : -10, scale: 0.95 }}
					animate={{ opacity: 1, x: "-50%", y: pos.isAbove ? "-100%" : 0, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					transition={{ duration: 0.15 }}
					className="fixed z-[9999] flex items-center gap-1 p-1 rounded-xl glass-panel border border-white/20 dark:border-white/10 shadow-lg"
					style={{
						top: pos.top,
						left: pos.left,
					}}
					onMouseDown={handleMouseDown}
				>
					<MenuButton icon={<Bold size={16} strokeWidth={2.5} />} onClick={() => applyFormat('**')} title="Negrito (Ctrl+B)" isActive={pos.active.bold} />
					<MenuButton icon={<Italic size={16} strokeWidth={2.5} />} onClick={() => applyFormat('*')} title="Itálico (Ctrl+I)" isActive={pos.active.italic} />
					<MenuButton icon={<Strikethrough size={16} strokeWidth={2.5} />} onClick={() => applyFormat('~~')} title="Riscado (Ctrl+Shift+X)" isActive={pos.active.strike} />
					<div className="w-px h-5 mx-1 bg-black/10 dark:bg-white/10" />
					<MenuButton icon={<List size={16} strokeWidth={2.5} />} onClick={applyBulletList} title="Lista de Marcadores" isActive={pos.active.list} />
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	);
};

interface MenuButtonProps {
	icon: React.ReactNode;
	onClick: () => void;
	title: string;
	isActive?: boolean;
}

const MenuButton = ({ icon, onClick, title, isActive }: MenuButtonProps) => (
	<button
		onClick={onClick}
		data-tooltip={title}
		className={`
			flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer border-none
			${isActive 
				? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' 
				: 'text-slate-600 dark:text-slate-300 hover:bg-black/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white bg-transparent'
			}
		`}
	>
		{icon}
	</button>
);
