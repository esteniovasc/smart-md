import { useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, GripHorizontal } from 'lucide-react';
import { Switch } from './Switch';
import { SegmentedControl } from './SegmentedControl';
import { useSettingsStore, type MarkdownViewMode } from '../../stores/useSettingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingRowProps {
  label: string;
  children: React.ReactNode;
}

const SettingRow = ({ label, children }: SettingRowProps) => (
  <div 
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      gap: '16px',
    }}
  >
    <span 
      style={{ 
        fontSize: '14px', 
        color: '#374151',
        userSelect: 'text',
        cursor: 'text',
        flexShrink: 1,
        minWidth: 0,
      }}
    >
      {label}
    </span>
    <div style={{ flexShrink: 0 }}>
      {children}
    </div>
  </div>
);

const markdownViewOptions: { value: MarkdownViewMode; label: string }[] = [
  { value: 'visible', label: 'Visível' },
  { value: 'current-line', label: 'Na Linha' },
  { value: 'hidden', label: 'Oculto' },
];

/**
 * SettingsModal - Janela flutuante de configurações (draggable pelo header)
 */
export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const {
    showLineNumbers,
    markdownViewMode,
    enableStatusColors,
    enableHighlightActiveLine,
    updateSettings,
  } = useSettingsStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Constraints container (tela toda) */}
          <div 
            ref={constraintsRef}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 50,
            }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={constraintsRef}
            style={{
              position: 'fixed',
              top: '80px',
              right: '24px',
              zIndex: 51,
              width: '320px',
              maxWidth: 'calc(100vw - 48px)',
            }}
          >
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Header - Drag Handle ONLY */}
              <div 
                onPointerDown={(e) => dragControls.start(e)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  cursor: 'grab',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GripHorizontal style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                  <h2 style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#111827',
                    margin: 0,
                  }}>
                    Configurações
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    padding: '4px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              </div>

              {/* Settings List */}
              <div style={{ padding: '4px 14px 14px' }}>
                <SettingRow label="Números de Linha">
                  <Switch 
                    checked={showLineNumbers} 
                    onChange={(v) => updateSettings({ showLineNumbers: v })} 
                  />
                </SettingRow>

                <SettingRow label="Destacar Linha Ativa">
                  <Switch 
                    checked={enableHighlightActiveLine} 
                    onChange={(v) => updateSettings({ enableHighlightActiveLine: v })} 
                  />
                </SettingRow>

                <SettingRow label="Cores de Status (✅ ⚠️ 💡)">
                  <Switch 
                    checked={enableStatusColors} 
                    onChange={(v) => updateSettings({ enableStatusColors: v })} 
                  />
                </SettingRow>

                {/* Markdown View Mode - 3 estados */}
                <div style={{ paddingTop: '12px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#374151',
                    marginBottom: '10px',
                    userSelect: 'text',
                    cursor: 'text',
                  }}>
                    Marcadores Markdown (#, *, **)
                  </div>
                  <SegmentedControl
                    options={markdownViewOptions}
                    value={markdownViewMode}
                    onChange={(v) => updateSettings({ markdownViewMode: v })}
                  />
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    marginTop: '6px',
                    lineHeight: 1.4,
                  }}>
                    {markdownViewMode === 'visible' && 'Sempre mostra #, *, ** no texto'}
                    {markdownViewMode === 'current-line' && 'Mostra marcadores só na linha do cursor'}
                    {markdownViewMode === 'hidden' && 'Oculta completamente os marcadores'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
