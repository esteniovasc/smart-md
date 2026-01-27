import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'aside' | 'header' | 'footer' | 'nav';
}

/**
 * Componente GlassPanel - Painel com efeito vidro adaptável a light/dark
 * Light: Frosty (branco translúcido)
 * Dark: Smoked (preto translúcido)
 */
export const GlassPanel = ({ 
  children, 
  className = '', 
  as: Component = 'div' 
}: GlassPanelProps) => {
  return (
    <Component className={twMerge(clsx('glass-panel', className))}>
      {children}
    </Component>
  );
};
