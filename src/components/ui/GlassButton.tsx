import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'icon';
  className?: string;
}

/**
 * Componente GlassButton - Botão com efeito vidro adaptável a light/dark
 * Hover suave e feedback visual
 */
export const GlassButton = ({ 
  children, 
  variant = 'default',
  className = '', 
  ...props 
}: GlassButtonProps) => {
  const baseClasses = 'glass-button';
  const variantClasses = {
    default: '',
    icon: 'p-2 aspect-square flex items-center justify-center',
  };

  return (
    <button 
      className={twMerge(clsx(
        baseClasses, 
        variantClasses[variant],
        className
      ))} 
      {...props}
    >
      {children}
    </button>
  );
};
