import { useEffect } from 'react';
import { useTabsStore } from './stores/useTabsStore';
import { useSettingsStore } from './stores/useSettingsStore';

/**
 * Smart MD - Editor de Markdown PWA
 * Componente principal da aplicação
 */
export default function App() {
  const { tabs, activeTabId, createTab } = useTabsStore();
  const { theme } = useSettingsStore();

  // Criar primeira aba ao montar
  useEffect(() => {
    if (tabs.length === 0) {
      createTab('Bem-vindo');
    }
  }, []);

  return (
    <div className={`flex flex-col h-full w-full ${theme === 'dark' ? 'dark' : 'light'}`}>
      {/* Header com info da infraestrutura */}
      <header className="glass-panel-dark border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gradient">Smart MD</h1>
            <span className="text-xs text-gray-400 px-2 py-1 bg-black/30 rounded">
              v0.1.0 - Infrastructure Ready
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {tabs.length} aba{tabs.length !== 1 ? 's' : ''}
          </div>
        </div>
      </header>

      {/* Tab Bar - Espaço reservado */}
      <nav className="glass-panel-dark border-b border-white/10 h-12 px-4 flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`px-3 py-1 rounded-t-lg whitespace-nowrap text-sm transition-all ${
              activeTabId === tab.id
                ? 'glass-light border border-white/20 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.title}
            {tab.isModified && <span className="ml-1">●</span>}
          </div>
        ))}
      </nav>

      {/* Editor Area - Espaço reservado */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full w-full glass-panel-dark border-0 rounded-none flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg mb-2">🚀 Infraestrutura Pronta</p>
            <p className="text-sm">
              Editor será implementado aqui
            </p>
          </div>
        </div>
      </main>

      {/* Status Bar - Footer */}
      <footer className="glass-panel-dark border-t border-white/10 px-6 py-2 text-xs text-gray-400 flex justify-between">
        <div>Smart MD • Offline-first PWA</div>
        <div>{activeTabId ? 'Editor ativo' : 'Sem editor ativo'}</div>
      </footer>
    </div>
  );
}
