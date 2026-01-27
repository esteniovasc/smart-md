import { useState } from 'react';
import { Sun, Moon, Settings } from 'lucide-react';
import { SettingsModal } from '../ui/SettingsModal';
import { useTheme } from '../../hooks/useTheme';
import { TabBar } from './TabBar';

/**
 * Header - Barra superior com efeito vidro
 */
export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const iconButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.3)',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  return (
    <>
      <header
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Logo/Título */}
        <h1 
          style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: '#1e293b',
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Smart MD
        </h1>

        {/* Tab Bar ocupando espaço central */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <TabBar />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Configurações"
            style={iconButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Settings style={{ width: '20px', height: '20px' }} />
          </button>

          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            style={iconButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {theme === 'light' ? (
              <Moon style={{ width: '20px', height: '20px' }} />
            ) : (
              <Sun style={{ width: '20px', height: '20px' }} />
            )}
          </button>
        </div>
      </header>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};
