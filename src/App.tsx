import { AppLayout } from './components/layout/AppLayout';
import { useTheme } from './hooks/useTheme';
import { GlassPanel } from './components/ui/GlassPanel';

/**
 * Smart MD - Editor de Markdown PWA
 * Componente principal da aplicação
 */
export default function App() {
  // Inicializar hook de tema (aplica classe dark ao body)
  useTheme();

  return (
    <AppLayout>
      {/* Área de conteúdo principal - Placeholder de teste */}
      <div className="h-full w-full flex items-center justify-center p-8">
        <GlassPanel className="p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">
            Bem-vindo ao Smart MD
          </h2>
          <p className="text-slate-600 dark:text-gray-300 mb-4">
            Editor de Markdown PWA com estética Liquid Glass
          </p>
          <div className="space-y-2 text-sm text-slate-500 dark:text-gray-400">
            <p>✅ Infraestrutura configurada</p>
            <p>✅ Sistema de temas Light/Dark implementado</p>
            <p>✅ Componentes UI base criados</p>
            <p>✅ Layout principal estruturado</p>
          </div>
          <div className="mt-6 p-4 bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Use o botão Sol/Lua no header para alternar entre os temas!
            </p>
          </div>
        </GlassPanel>
      </div>
    </AppLayout>
  );
}
