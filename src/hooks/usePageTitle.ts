import { useEffect } from 'react';
import { useTabsStore } from '../stores/useTabsStore';

/**
 * Hook para atualizar o título da página baseado no arquivo ativo.
 * Formato: "NomeDoArquivo | Smart MD"
 * Remove a extensão .md para visual mais limpo.
 */
export const usePageTitle = () => {
	const activeTabId = useTabsStore((state) => state.activeTabId);
	const tabs = useTabsStore((state) => state.tabs);

	useEffect(() => {
		const activeTab = tabs.find((tab) => tab.id === activeTabId);

		if (activeTab) {
			// Remove extensão .md ou .markdown (case insensitive)
			const cleanTitle = activeTab.title.replace(/\.(md|markdown)$/i, '');
			document.title = `${cleanTitle} | Smart MD`;
		} else {
			document.title = 'Smart MD';
		}
	}, [activeTabId, tabs]); // Re-executa se mudar de aba ou se os dados das abas (título) mudarem
};
