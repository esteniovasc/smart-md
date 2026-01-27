# Smart MD - Editor de Markdown PWA

Um editor de markdown offline-first com design **Liquid Glass**, focado em substituir o Bloco de Notas do Windows com recursos modernos e sincronização em nuvem.

## 🎯 Características Principais

- ✅ **PWA Offline-First** - Funciona completamente offline
- ✅ **Abas Nativas** - Suporte para múltiplos arquivos abertos
- ✅ **Design Liquid Glass** - Estética moderna e fluida
- ✅ **Persistência Local** - IndexedDB para armazenamento
- ✅ **Editor Poderoso** - CodeMirror 6 com suporte a Markdown
- ✅ **Responsivo** - Mobile-first design com Tailwind CSS
- ✅ **Sincronização** - Pronto para integração com nuvem

## 🏗️ Arquitetura

### Stack Tecnológico

```
Frontend Framework:   React 19 + TypeScript
Build Tool:          Vite 6
Styling:             Tailwind CSS 4 + Custom Glass Utilities
State Management:    Zustand
UI Components:       Lucide React (ícones)
Editor:              CodeMirror 6 + @uiw/react-codemirror
Persistência:        IndexedDB (idb-keyval)
PWA:                 vite-plugin-pwa
Animações:           Framer Motion
Utilitários:         date-fns, dompurify
```

### Estrutura de Arquivos

```
src/
├── assets/              # SVGs e recursos estáticos
├── components/
│   ├── ui/             # Botões, Cards, Inputs, Badges
│   ├── layout/         # Header, Sidebar, TabBar, Footer
│   └── editor/         # EditorPanel, PreviewPanel
├── hooks/
│   ├── usePWA.ts       # Gerenciamento de PWA
│   └── useIndexedDB.ts # Persistência de dados
├── stores/
│   ├── useTabsStore.ts       # Gerenciamento de abas
│   └── useSettingsStore.ts   # Configurações do usuário
├── utils/
│   └── helpers.ts      # Funções utilitárias
├── styles/
│   └── index.css       # Tailwind + Liquid Glass classes
├── types/
│   └── index.ts        # Tipos globais TypeScript
├── App.tsx             # Componente raiz
└── main.tsx            # Entry point

docs/
└── logs/
    ├── general.md      # Changelog geral
    └── current.md      # Detalhes técnicos da sessão atual
```

## 🚀 Começando

### Pré-requisitos

- Node.js 20.19+ ou 22.12+
- npm 10.8.2+

### Instalação

```bash
# Clonar repositório
git clone <url-do-repo> smart-md
cd smart-md

# Instalar dependências
npm install

# Iniciar dev server
npm run dev
```

O servidor estará disponível em `http://localhost:5173`

### Comandos Disponíveis

```bash
npm run dev      # Iniciar servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Verificar código (quando ESLint for configurado)
npm run type-check  # Verificar tipos TypeScript
```

## 🎨 Design System

### Liquid Glass Utilities

```html
<!-- Painel vidro claro -->
<div class="glass-panel">Conteúdo</div>

<!-- Painel vidro escuro -->
<div class="glass-panel-dark">Conteúdo</div>

<!-- Botão vidro -->
<button class="glass-button">Clique</button>

<!-- Input vidro -->
<input type="text" class="glass-input" />

<!-- Texto gradiente -->
<h1 class="text-gradient">Smart MD</h1>
```

### Cores

- **Dark Background**: Gradiente Deep Space (#0f0f1e → #1a1a2e)
- **Glass Light**: rgba(255, 255, 255, 0.05)
- **Glass Dark**: rgba(0, 0, 0, 0.5)
- **Border Glass**: rgba(255, 255, 255, 0.1)

## 📦 Zustand Stores

### useTabsStore

```typescript
import { useTabsStore } from '@/stores/useTabsStore';

const { tabs, activeTabId, createTab, closeTab, updateTabContent } = useTabsStore();
```

**Métodos:**
- `createTab(title?)` - Criar nova aba
- `closeTab(id)` - Fechar aba
- `setActiveTab(id)` - Ativar aba
- `updateTabContent(id, content)` - Atualizar conteúdo
- `updateTabTitle(id, title)` - Renomear aba
- `getActiveTab()` - Obter aba ativa

### useSettingsStore

```typescript
import { useSettingsStore } from '@/stores/useSettingsStore';

const { theme, fontSize, autoSave, setTheme, setFontSize } = useSettingsStore();
```

**Configurações:**
- `theme` - 'dark' | 'light'
- `fontSize` - Tamanho da fonte (padrão: 14)
- `autoSave` - Auto salvar (padrão: true)
- `autoSaveInterval` - Intervalo de auto save em ms (padrão: 5000)

## 🪝 Hooks Customizados

### usePWA()

Gerencia estado da PWA:

```typescript
const { isOnline, isInstalled, installApp } = usePWA();
```

### useIndexedDB<T>()

Persistência com IndexedDB:

```typescript
const { data, isLoading, save, delete: deleteData } = useIndexedDB('my-key', initialValue);

await save(newData);
```

### useLocalStorage<T>()

Persistência local simplificada:

```typescript
const [value, setValue, deleteValue] = useLocalStorage('my-key', initialValue);
```

## 🔧 Configuração PWA

O `vite.config.ts` está pré-configurado com:

- ✅ Auto-update strategy
- ✅ Workbox para caching inteligente
- ✅ Manifest.json com metadados
- ✅ Suporte para ícones maskable
- ✅ Screenshots para install prompt

## 📝 Logging

Os logs de desenvolvimento estão em:

- `docs/logs/general.md` - Changelog geral do projeto
- `docs/logs/current.md` - Detalhes técnicos da sessão atual

## 🚧 Próximas Etapas

1. [ ] Implementar componentes base (Button, Card, Input)
2. [ ] Integrar editor CodeMirror
3. [ ] Criar TabBar interativa
4. [ ] Implementar persistência com IndexedDB
5. [ ] Setup de sincronização com backend
6. [ ] PWA instalação e offline
7. [ ] Testes unitários e E2E
8. [ ] Build e otimização

## 📄 Licença

MIT

## 👨‍💻 Autor

**Desenvolvido como Arquiteto de Software Sênior**

---

**Status**: 🟢 Infraestrutura Pronta | Pronto para Desenvolvimento
