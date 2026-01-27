import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Switch - Toggle estilo iOS com animação Framer Motion
 */
export const Switch = ({ checked, onChange, disabled = false }: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '51px',
        height: '31px',
        borderRadius: '31px',
        padding: '2px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: checked ? '#34C759' : '#e5e5ea',
        transition: 'background-color 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      <motion.span
        style={{
          display: 'block',
          width: '27px',
          height: '27px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.16)',
        }}
        initial={false}
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
};
