import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Tab } from './Tab';
import { useTabsStore } from '../../stores/useTabsStore';

/**
 * TabBar - Renderiza a lista de abas a partir da store
 * Inclui fallback para criar a primeira aba "Bem-vindo.md" se estiver vazio
 */
export const TabBar = () => {
  const { tabs, activeTabId, createTab, closeTab, setActiveTab } = useTabsStore();

  useEffect(() => {
    if (tabs.length === 0) {
      createTab('Bem-vindo.md');
    }
  }, [tabs.length, createTab]);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
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

      {/* Botão nova aba - minimalista */}
      <button
        type="button"
        onClick={() => createTab('Sem título')}
        title="Nova aba"
        className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md
                   text-slate-400 dark:text-gray-500
                   hover:text-slate-600 dark:hover:text-gray-300
                   hover:bg-white/30 dark:hover:bg-white/10
                   transition-colors duration-150"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
};
