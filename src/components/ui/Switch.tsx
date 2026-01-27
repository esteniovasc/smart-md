import { motion } from 'framer-motion';

interface SwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}

/**
 * Switch - Toggle estilo iOS com animação Framer Motion
 * Refatorado para usar Tailwind CSS v4
 */
export const Switch = ({ checked, onChange, disabled = false }: SwitchProps) => {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => !disabled && onChange(!checked)}
			className={`
        relative inline-flex items-center flex-shrink-0
        w-[51px] h-[31px] rounded-full p-[2px] border-none
        transition-colors duration-200 ease-in-out
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${checked ? 'bg-[#34C759]' : 'bg-[#e5e5ea] dark:bg-zinc-700'}
      `}
		>
			<motion.span
				className="block w-[27px] h-[27px] rounded-full bg-white shadow-sm"
				initial={false}
				animate={{ x: checked ? 20 : 0 }}
				transition={{ type: 'spring', stiffness: 500, damping: 30 }}
			/>
		</button>
	);
};
