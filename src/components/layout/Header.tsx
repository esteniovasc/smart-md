import { useState } from 'react';
import { Sun, Moon, Settings, HelpCircle, Home, FolderOpen, Search, Eye, LayoutDashboard } from 'lucide-react';
import { SettingsModal } from '../ui/SettingsModal';
import { HelpModal } from '../ui/HelpModal';
import { useTheme } from '../../hooks/useTheme';
import { TabBar } from './TabBar';

/**
 * Header - Ilhas flutuantes superiores (3 Ilhas)
 * 1. Nav Island (Files/Tools) - Esquerda
 * 2. Tabs Island (Active Documents) - Centro
 * 3. System Island (Theme/Settings/Help) - Direita
 */
export const Header = () => {
	const { theme, toggleTheme } = useTheme();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isHelpOpen, setIsHelpOpen] = useState(false);

	const iconButtonClass = `
    flex items-center justify-center w-9 h-9 rounded-lg border-none
    bg-transparent text-slate-600 dark:text-slate-400 cursor-pointer transition-all duration-150 ease-in-out
    hover:bg-black/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white
  `;

	const navButtonClass = `
		flex items-center justify-center w-8 h-8 rounded-lg border-none
		bg-transparent text-slate-500 dark:text-slate-400 
		hover:bg-black/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white
		transition-colors cursor-pointer
	`;

	return (
		<>
			{/* Container Principal "Fantasma" - Permite clicar através dos gaps */}
			<header className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between p-6 pointer-events-none gap-4">

				{/* 1. Nav Island: Arquivos e Ferramentas */}
				<div className="glass-panel rounded-2xl h-14 flex items-center gap-1 p-2 pointer-events-auto border border-white/20 dark:border-white/10 shrink-0">
					{/* Logo e Home */}
					<div className="flex items-center pl-2 pr-1 gap-2 h-full">
						<span className="text-sm font-bold text-slate-800 dark:text-slate-100 hidden xl:block mr-2">
							Smart MD
						</span>
						<button className={navButtonClass} title="Tela Inicial">
							<Home className="w-4 h-4" />
						</button>
					</div>

					<div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-1" />

					{/* Ferramentas de Arquivo */}
					<div className="flex items-center gap-0.5 h-full">
						<button className={navButtonClass} title="Abrir Projeto">
							<FolderOpen className="w-4 h-4" />
						</button>
						<button className={navButtonClass} title="Pesquisar">
							<Search className="w-4 h-4" />
						</button>
						<button className={navButtonClass} title="Modo de Visualização">
							<Eye className="w-4 h-4" />
						</button>
						<button className={navButtonClass} title="Dashboard">
							<LayoutDashboard className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* 2. Tabs Island: Documentos Ativos */}
				{/* Flex-1 para ocupar o espaço central, overflow-hidden para conter a TabBar */}
				<div className="group glass-panel rounded-2xl h-14 flex items-center p-2 pointer-events-auto border border-white/20 dark:border-white/10 flex-1 min-w-0 max-w-4xl mx-auto overflow-hidden relative">
					<div className="flex-1 overflow-hidden min-w-0 h-full">
						<TabBar />
					</div>
				</div>

				{/* 3. System Island: Configurações e Ajuda */}
				<div className="glass-panel rounded-2xl h-14 flex items-center gap-1 p-2 pointer-events-auto border border-white/20 dark:border-white/10 shrink-0">
					<button
						onClick={() => setIsHelpOpen(!isHelpOpen)}
						title="Ajuda"
						className={`${iconButtonClass} ${isHelpOpen ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white' : ''}`}
					>
						<HelpCircle className="w-5 h-5" />
					</button>

					<button
						onClick={() => setIsSettingsOpen(!isSettingsOpen)}
						title="Configurações"
						className={`${iconButtonClass} ${isSettingsOpen ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white' : ''}`}
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

			<HelpModal
				isOpen={isHelpOpen}
				onClose={() => setIsHelpOpen(false)}
			/>
		</>
	);
};
