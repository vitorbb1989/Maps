# AntropIA Mindmap Editor

Editor de mindmap premium com design Apple-like, minimalista e elegante.

## 🎨 Filosofia de Design

**Apple-like, 80/15/5, Silencioso e Organizado**

- **80%** da interface é "silenciosa" (backgrounds, superfícies, textos)
- **15%** elementos secundários (bordas, textos secundários)
- **5%** acentos e interações (primary, estados ativos)

### Princípios

- ✨ **Minimalismo**: Sem elementos decorativos desnecessários
- 🎯 **Hierarquia Clara**: Tipografia e espaçamento bem definidos
- 🌊 **Espaçamento Generoso**: Respiro visual em múltiplos de 4px
- 🎭 **Microinterações Suaves**: Animações de 150-300ms com easing natural

## 🚀 Features Principais

### Editor de Mindmap
- Canvas infinito com zoom/pan suave
- Nós retangulares arredondados com hierarquia visual
- Conexões curvas (Bézier) entre nós pai-filho
- Auto-centralização ao adicionar nós (irmãos se redistribuem)
- Edição inline de texto (clique no nó)

### Ações do Topo
- **Voltar**: Navegação para tela anterior
- **Título Editável**: Clique para editar (Enter salva, Esc cancela)
- **Status de Salvamento**: Indicadores visuais (Saved/Saving/Error)
- **Salvar**: Ação primária
- **Salvar Versão**: Cria snapshot do estado atual
- **Histórico**: Abre drawer lateral com versões
- **Exportar**: Download em JSON

### Interações do Nó
- **Botão +**: Aparece no hover do nó
- **Menu Popover**: 2 opções
  - **Subtópico**: Cria filho (detalhe dentro)
  - **Novo Tópico**: Cria irmão (mesmo nível)
- **Nó Raiz**: Apenas permite Subtópico

### Componentes

- **TopBar**: Header sticky com ações
- **StatusChip**: Indicador de salvamento
- **MindmapNode**: Nó editável com menu
- **NodeAddMenu**: Popover com opções
- **HistoryDrawer**: Drawer lateral animado
- **EmptyHint**: Dica para primeiro uso
- **ZoomControls**: Controles de zoom no canto
- **HelpButton**: Ajuda e atalhos (tecla ?)
- **KeyboardShortcuts**: Modal com atalhos

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| `?` | Abrir/fechar atalhos |
| `Enter` | Confirmar edição |
| `Esc` | Cancelar edição |
| `Scroll` | Zoom in/out |
| `Arrastar` | Pan no canvas |

## 🎨 Sistema de Design

### Cores Semânticas

```css
--bg: #FAFAFA              /* Fundo principal */
--surface: #FFFFFF         /* Cartões, nós */
--text: #1A1A1A            /* Texto principal */
--text-secondary: #6B6B6B  /* Texto secundário */
--border: #E5E5E5          /* Bordas sutis */

--primary: #0066CC         /* Ação primária */
--primary-bg: #EBF3FC      /* Hover/focus */
--primary-border: #B3D7F9  /* Destaque */
```

### Sombras

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.04)
--shadow-md: 0 2px 8px 0 rgba(0, 0, 0, 0.08)
--shadow-lg: 0 8px 24px 0 rgba(0, 0, 0, 0.12)
```

### Tipografia

- **Família**: Inter (400, 500, 600)
- **Pesos**: Normal (400), Medium (500), Semibold (600)
- **Suavização**: -webkit-font-smoothing: antialiased

### Espaçamentos

Múltiplos de 4px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

## 📱 Responsividade

| Breakpoint | Adaptações |
|------------|------------|
| **1440px+** | Layout desktop padrão |
| **1280px+** | Laptop (espaçamentos reduzidos) |
| **834px+** | Tablet (drawer → modal full-screen, labels escondidos) |

## ♿ Acessibilidade

- ✅ Contraste AA/AAA (WCAG 2.1)
- ✅ Foco visível (ring 2px)
- ✅ Área clicável mínima 40px
- ✅ ARIA labels em botões
- ✅ Navegação por teclado

## 🛠️ Tecnologias

- **React 18.3**: Framework principal
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Styling system
- **Motion (Framer Motion)**: Animações
- **Radix UI**: Componentes acessíveis (Popover, Tooltip)
- **React Zoom Pan Pinch**: Canvas interativo
- **Lucide React**: Ícones

## 📦 Estrutura de Componentes

```
/src/app
├── App.tsx                      # Componente principal
├── components/
│   ├── TopBar.tsx               # Header com ações
│   ├── MindmapNode.tsx          # Nó editável
│   ├── HistoryDrawer.tsx        # Drawer de histórico
│   ├── EmptyHint.tsx            # Hint de onboarding
│   ├── ZoomControls.tsx         # Controles de zoom
│   ├── HelpButton.tsx           # Botão de ajuda
│   └── KeyboardShortcuts.tsx    # Modal de atalhos
└── /styles
    ├── theme.css                # Tokens de design
    └── fonts.css                # Import da Inter
```

## 🎯 Algoritmo de Layout

### Espaçamento
- **Horizontal**: 280px entre níveis
- **Vertical**: 100px entre irmãos

### Lógica
1. Nó raiz sempre em `(0, 0)`
2. Filhos à direita do pai (`x + 280`)
3. Irmãos distribuídos verticalmente
4. Grupo centralizado em relação ao pai

## 📝 Exportação JSON

Exemplo de estrutura exportada:

```json
{
  "title": "Meu Mindmap",
  "nodes": [
    {
      "id": "root",
      "text": "Ideia Central",
      "parentId": null,
      "x": 0,
      "y": 0,
      "isRoot": true
    },
    {
      "id": "node-1234567890",
      "text": "Subtópico 1",
      "parentId": "root",
      "x": 280,
      "y": -50
    }
  ]
}
```

## 🎨 Microinterações

### Animações
- **Fast** (150ms): Hover de botões
- **Base** (200ms): Popover, nós
- **Slow** (300ms): Drawer, modais

### Estados
- **Hover**: Mudança de cor, shadow
- **Active**: Scale 0.98
- **Focus**: Ring 2px primary/20
- **Disabled**: Opacity 50%, pointer-events none

## 📚 Documentação Adicional

- **DEV_HANDOFF.md**: Especificação completa para desenvolvedores
  - Componentização detalhada
  - Mapeamento CSS → Tailwind
  - Guidelines de implementação

## 🎉 Próximas Funcionalidades

Sugestões para expandir o editor:

- **Arrastar nós**: Reorganização manual
- **Deletar nós**: Botão de delete com confirmação
- **Cores personalizadas**: Customização por nó
- **Templates**: Mindmaps pré-configurados
- **Colaboração**: Múltiplos usuários
- **Imagens em nós**: Upload de ícones/imagens
- **Exportação**: PDF, PNG, SVG

---

**Design System**: AntropIA  
**Versão**: 1.0  
**Data**: Fevereiro 2026
