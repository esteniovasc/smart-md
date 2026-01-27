import { useState } from 'react';
import { Sun, Moon, Settings } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassButton } from '../ui/GlassButton';
import { SettingsModal } from '../ui/SettingsModal';
import { useTheme } from '../../hooks/useTheme';
import { TabBar } from './TabBar';

/**
 * Header - Barra superior fixa com efeito vidro
 * Contém botão de toggle de tema (Sol/Lua) e configurações
 */
export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <GlassPanel 
        as="header" 
        className="flex-shrink-0 px-4 py-3 flex items-center gap-4 rounded-none"
      >
        {/* Logo/Título */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white whitespace-nowrap">
            Smart MD
          </h1>
        </div>

        {/* Tab Bar ocupando espaço central */}
        <div className="flex-1 min-w-0">
          <TabBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <GlassButton
            variant="icon"
            onClick={() => setIsSettingsOpen(true)}
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </GlassButton>

          <GlassButton
            variant="icon"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </GlassButton>
        </div>
      </GlassPanel>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};
