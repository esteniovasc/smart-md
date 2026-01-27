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
 * Refatorado para Tailwind CSS v4
 */
export function SegmentedControl<T extends string>({
	options,
	value,
	onChange
}: SegmentedControlProps<T>) {
	const activeIndex = options.findIndex(opt => opt.value === value);

	return (
		<div className="flex bg-black/5 dark:bg-white/5 rounded-lg p-0.5 relative">
			{/* Indicator animado */}
			<motion.div
				layout
				transition={{ type: 'spring', stiffness: 500, damping: 35 }}
				className="absolute top-0.5 bottom-0.5 bg-white dark:bg-zinc-700 rounded-md shadow-sm"
				style={{
					left: `calc(${activeIndex * (100 / options.length)}% + 2px)`,
					width: `calc(${100 / options.length}% - 4px)`,
				}}
			/>

			{options.map((option) => (
				<button
					key={option.value}
					onClick={() => onChange(option.value)}
					className={`
            flex-1 py-1.5 px-3 text-[13px] font-medium
            border-none bg-transparent rounded-md cursor-pointer relative z-10
            transition-colors duration-150 ease-in-out whitespace-nowrap
            ${value === option.value
							? 'text-gray-900 dark:text-gray-100 font-medium'
							: 'text-gray-500 dark:text-gray-400 font-normal hover:text-gray-700 dark:hover:text-gray-200'}
          `}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}
