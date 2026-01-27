import { useState } from 'react';
import { Sun, Moon, Settings } from 'lucide-react';
import { SettingsModal } from '../ui/SettingsModal';
import { useTheme } from '../../hooks/useTheme';
import { TabBar } from './TabBar';

/**
 * Header - Barra superior com efeito vidro
 * Refatorado para Tailwind CSS v4
 */
export const Header = () => {
	const { theme, toggleTheme } = useTheme();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const iconButtonClass = `
    flex items-center justify-center w-9 h-9 rounded-lg border-none
    bg-white/30 text-slate-600 dark:text-slate-300 cursor-pointer transition-all duration-150 ease-in-out
    hover:bg-white/50 hover:shadow-sm dark:bg-white/10 dark:hover:bg-white/20
  `;

	return (
		<>
			<header className="flex-shrink-0 flex items-center gap-4 px-4 py-3 bg-white/50 dark:bg-black/30 backdrop-blur-md border-b border-white/30 dark:border-white/10 shadow-sm z-40 relative">
				{/* Logo/Título */}
				<h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 m-0 whitespace-nowrap">
					Smart MD
				</h1>

				{/* Tab Bar ocupando espaço central */}
				<div className="flex-1 min-w-0">
					<TabBar />
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<button
						onClick={() => setIsSettingsOpen(!isSettingsOpen)}
						title="Configurações"
						className={`${iconButtonClass} ${isSettingsOpen ? 'bg-white/60 dark:bg-white/30 text-slate-800 dark:text-white' : ''}`}
					>
						<Settings className="w-5 h-5" />
					</button>

					<button
						onClick={toggleTheme}
						title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
						className={iconButtonClass}
					>
						{theme === 'light' ? (
							<Moon className="w-5 h-5" />
						) : (
							<Sun className="w-5 h-5" />
						)}
					</button>
				</div>
			</header>

			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
			/>
		</>
	);
};
