import { Sun, Moon } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassButton } from '../ui/GlassButton';
import { useTheme } from '../../hooks/useTheme';
import { TabBar } from './TabBar';

/**
 * Header - Barra superior fixa com efeito vidro
 * Contém botão de toggle de tema (Sol/Lua)
 */
export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <GlassPanel 
      as="header" 
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center gap-4"
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
  );
};
