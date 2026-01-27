import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TabProps {
  title: string;
  isActive: boolean;
  isDirty: boolean;
  onClick: () => void;
  onClose: (e: MouseEvent) => void;
}

/**
 * Tab - bloco visual de aba com estilo Liquid Glass
 */
export const Tab = ({ title, isActive, isDirty, onClick, onClose }: TabProps) => {
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '32px',
    padding: '0 12px',
    cursor: 'pointer',
    userSelect: 'none',
    maxWidth: '180px',
    minWidth: '80px',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
    border: 'none',
    background: isActive 
      ? 'rgba(255, 255, 255, 0.7)' 
      : 'rgba(255, 255, 255, 0.25)',
    boxShadow: isActive 
      ? '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)' 
      : 'none',
  };

  return (
    <motion.div
      role="tab"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.45)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
        }
      }}
    >
      {/* Indicador de aba ativa */}
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          style={{
            position: 'absolute',
            bottom: 0,
            left: '8px',
            right: '8px',
            height: '2px',
            background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
            borderRadius: '2px',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}

      {/* Título */}
      <span 
        style={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '13px',
          fontWeight: isActive ? 500 : 400,
          color: isActive ? '#1e293b' : '#64748b',
        }}
      >
        {title}
      </span>

      {/* Indicador de não salvo */}
      {isDirty && (
        <span 
          style={{
            flexShrink: 0,
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#fbbf24',
          }}
          title="Alterações não salvas" 
        />
      )}

      {/* Botão fechar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose(e);
        }}
        style={{
          flexShrink: 0,
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          border: 'none',
          background: 'transparent',
          color: '#94a3b8',
          cursor: 'pointer',
          opacity: 0.6,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.color = '#475569';
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#94a3b8';
          e.currentTarget.style.opacity = '0.6';
        }}
        aria-label="Fechar aba"
      >
        <X style={{ width: '12px', height: '12px' }} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
};
