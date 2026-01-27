import { motion } from 'framer-motion';

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * SegmentedControl - Seletor de múltiplas opções estilo iOS
 */
export function SegmentedControl<T extends string>({ 
  options, 
  value, 
  onChange 
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: '8px',
        padding: '2px',
        position: 'relative',
      }}
    >
      {/* Indicator animado */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{
          position: 'absolute',
          top: '2px',
          bottom: '2px',
          left: `calc(${activeIndex * (100 / options.length)}% + 2px)`,
          width: `calc(${100 / options.length}% - 4px)`,
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        }}
      />

      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          style={{
            flex: 1,
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: value === option.value ? 500 : 400,
            color: value === option.value ? '#111827' : '#6b7280',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1,
            transition: 'color 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
