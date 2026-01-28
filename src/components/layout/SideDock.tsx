import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SideDockProps {
	position: 'left' | 'right';
	children: ReactNode;
	className?: string;
}

/**
 * SideDock - Ilha flutuante lateral (Esquerda ou Direita)
 * Estilo pílula vertical de vidro
 */
export const SideDock = ({ position, children, className = '' }: SideDockProps) => {
	const positionClasses = position === 'left'
		? 'left-6'
		: 'right-6';

	return (
		<motion.div
			initial={{ opacity: 0, x: position === 'left' ? -20 : 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.4, ease: 'easeOut' }}
			className={`
				fixed top-24 z-40
				${positionClasses}
				w-16 py-4
				flex flex-col items-center gap-6
				glass-panel rounded-2xl
				border border-white/20 dark:border-white/10
				${className}
			`}
		>
			{children}
		</motion.div>
	);
};
