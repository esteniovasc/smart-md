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
		<div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-hide mask-fade-right">
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

			{/* Botão nova aba */}
			<button
				type="button"
				onClick={() => createTab('Sem título')}
				title="Nova aba"
				className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent text-slate-400 cursor-pointer transition-all duration-150 hover:bg-white/40 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
			>
				<Plus className="w-4 h-4" strokeWidth={2} />
			</button>
		</div>
	);
};
