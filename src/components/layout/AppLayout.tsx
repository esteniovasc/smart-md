import type { ReactNode } from 'react';
import { Header } from './Header';

interface AppLayoutProps {
	children: ReactNode;
}

/**
 * AppLayout - Container principal que aplica o layout completo
 * Inclui Header fixo e área de conteúdo
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
	return (
		<div className="flex flex-col h-screen w-full overflow-hidden bg-transparent">
			<Header />

			{/* Main Content */}
			<main className="flex-1 overflow-hidden p-4 relative z-10">
				{children}
			</main>
		</div>
	);
};
