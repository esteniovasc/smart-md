import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Tab } from './Tab';
import { useTabsStore } from '../../stores/useTabsStore';

/**
 * TabBar - Renderiza a lista de abas a partir da store
 */
export const TabBar = () => {
	const { tabs, activeTabId, createTab, closeTab, setActiveTab, _hasHydrated } = useTabsStore();

	useEffect(() => {
		// Só cria aba padrão se já carregou do banco (hydration) E não tem nenhuma aba
		if (!_hasHydrated) return;

		if (tabs.length === 0) {
			createTab('Bem-vindo.md');
		}
	}, [_hasHydrated, tabs.length, createTab]);

	return (
		<div className="flex items-center w-full h-full gap-2">
			{/* Lista de Abas com Scroll */}
			<div className="flex-1 overflow-x-auto flex items-center gap-1.5 custom-scrollbar py-1 px-1 mask-fade-right">
				<AnimatePresence mode="popLayout">
					{tabs.map((tab) => (
						<Tab
							key={tab.id}
							title={tab.title}
							isActive={activeTabId === tab.id}
							isDirty={tab.isModified}
							onClick={() => setActiveTab(tab.id)}
							onClose={() => closeTab(tab.id)}
						/>
					))}
				</AnimatePresence>
			</div>

			{/* Botão nova aba (Fixo à direita) */}
			<div className="flex-shrink-0 border-l border-black/5 dark:border-white/5 pl-1">
				<button
					type="button"
					onClick={() => createTab('Sem título')}
					title="Nova aba"
					className="flex items-center justify-center w-8 h-8 rounded-md border-none bg-transparent text-slate-400 cursor-pointer transition-all duration-150 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
				>
					<Plus className="w-4 h-4" strokeWidth={2} />
				</button>
			</div>
		</div>
	);
};
