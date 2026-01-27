import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface TabProps {
  title: string;
  isActive: boolean;
  isDirty: boolean;
  onClick: () => void;
  onClose: (e: MouseEvent) => void;
}

/**
 * Tab - bloco visual de aba (isolado)
 * Estilo Liquid Glass com transições suaves
 */
export const Tab = ({ title, isActive, isDirty, onClick, onClose }: TabProps) => {
  return (
    <motion.div
      role="tab"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      className={clsx(
        // Base
        'group relative flex items-center gap-2 h-9 px-4 cursor-pointer select-none',
        'max-w-[200px] min-w-[100px]',
        'rounded-lg transition-all duration-200',
        // Glass effect
        'backdrop-blur-sm',
        // Estados
        isActive
          ? [
              // Ativo - mais visível
              'bg-white/50 dark:bg-white/15',
              'text-slate-800 dark:text-white',
              'shadow-sm',
              'ring-1 ring-black/5 dark:ring-white/10',
            ]
          : [
              // Inativo - sutil
              'bg-white/20 dark:bg-white/5',
              'text-slate-500 dark:text-gray-400',
              'hover:bg-white/35 dark:hover:bg-white/10',
              'hover:text-slate-700 dark:hover:text-gray-200',
            ]
      )}
    >
      {/* Indicador de aba ativa */}
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}

      {/* Título */}
      <span className="truncate text-sm font-medium">
        {title}
      </span>

      {/* Indicador de não salvo */}
      {isDirty && (
        <span 
          className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" 
          title="Alterações não salvas" 
        />
      )}

      {/* Botão fechar - aparece no hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose(e);
        }}
        className={clsx(
          'flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100',
          'flex items-center justify-center w-5 h-5 rounded',
          'text-slate-400 dark:text-gray-500',
          'hover:text-slate-700 dark:hover:text-white',
          'hover:bg-black/10 dark:hover:bg-white/15',
          'transition-all duration-150'
        )}
        aria-label="Fechar aba"
      >
        <X className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
};
