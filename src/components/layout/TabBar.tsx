import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Tab } from './Tab';
import { useTabsStore } from '../../stores/useTabsStore';

/**
 * TabBar - Renderiza a lista de abas a partir da store
 */
export const TabBar = () => {
  const { tabs, activeTabId, createTab, closeTab, setActiveTab } = useTabsStore();

  useEffect(() => {
    if (tabs.length === 0) {
      createTab('Bem-vindo.md');
    }
  }, [tabs.length, createTab]);

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        overflowX: 'auto',
        padding: '4px 0',
      }}
    >
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
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          border: 'none',
          background: 'transparent',
          color: '#94a3b8',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
          e.currentTarget.style.color = '#64748b';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#94a3b8';
        }}
      >
        <Plus style={{ width: '16px', height: '16px' }} strokeWidth={2} />
      </button>
    </div>
  );
};
