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
	return (
		<motion.div
			role="tab"
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.15, ease: 'easeOut' }}
			onClick={onClick}
			className={`
        relative flex items-center gap-2 h-8 px-3 rounded-lg cursor-pointer select-none
        transition-all duration-150 max-w-[180px] min-w-[120px] shrink-0
        ${isActive
					? 'bg-white/70 dark:bg-white/10 shadow-sm border-none'
					: 'bg-white/25 dark:bg-white/5 hover:bg-white/45 dark:hover:bg-white/10 border border-transparent'}
      `}
		>
			{/* Indicador de aba ativa */}
			{isActive && (
				<motion.div
					layoutId="activeTabIndicator"
					className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
					transition={{ type: 'spring', stiffness: 500, damping: 35 }}
				/>
			)}

			{/* Título */}
			<span className={`
        overflow-hidden text-ellipsis whitespace-nowrap text-[13px]
        ${isActive ? 'font-medium text-slate-800 dark:text-slate-100' : 'font-normal text-slate-500 dark:text-slate-400'}
      `}>
				{title}
			</span>

			{/* Indicador de não salvo */}
			{isDirty && (
				<span
					className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400"
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
				className="
          flex-shrink-0 ml-auto flex items-center justify-center
          w-4.5 h-4.5 rounded bg-transparent border-none text-slate-400 opacity-60
          cursor-pointer transition-all duration-150
          hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-200 hover:opacity-100
        "
				aria-label="Fechar aba"
			>
				<X className="w-3 h-3" strokeWidth={2.5} />
			</button>
		</motion.div>
	);
};
