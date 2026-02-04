# AntropIA Mindmap Editor - Dev Handoff

## Filosofia de Design

**Apple-like, minimalista, 80/15/5**
- 80% da interface é "silenciosa" (bg, surface, text)
- 15% elementos secundários (borders, secondary text)
- 5% acentos e interações (primary, estados)

## Sistema de Tokens

### Cores Semânticas (CSS Variables)

```css
/* Layout Base */
--bg: #FAFAFA                    /* Fundo principal */
--surface: #FFFFFF               /* Cartões, modais, nós */
--text: #1A1A1A                  /* Texto principal */
--text-secondary: #6B6B6B        /* Texto secundário */
--border: #E5E5E5                /* Bordas sutis */

/* Primary (Interações) */
--primary: #0066CC               /* Ação primária */
--primary-bg: #EBF3FC            /* Background hover/focus */
--primary-border: #B3D7F9        /* Borda destacada */

/* Estados Funcionais */
--success: #28A745
--success-bg: #E8F5E9
--error: #DC3545
--error-bg: #FFEBEE
--warning: #FFA726
--warning-bg: #FFF3E0

/* Canvas */
--canvas-grid: rgba(0, 0, 0, 0.02)
--canvas-connection: #D0D0D0
--node-bg: #FFFFFF
--node-border: #E5E5E5
--node-root-border: #0066CC
```

### Sombras

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.04)
--shadow-md: 0 2px 8px 0 rgba(0, 0, 0, 0.08)
--shadow-lg: 0 8px 24px 0 rgba(0, 0, 0, 0.12)
```

### Raios de Borda

```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

### Espaçamentos (múltiplos de 4px)

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

### Transições

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Componentes e Especificações

### 1. TopBar

**Propósito**: Header sticky com título editável e ações principais.

**Estrutura**:
```tsx
<TopBar
  title="Meu Mindmap"
  saveStatus="saved" | "saving" | "error"
  lastSavedTime="15:32"
  onTitleChange={(title) => {}}
  onBack={() => {}}
  onSave={() => {}}
  onSnapshot={() => {}}
  onHistoryOpen={() => {}}
  onExport={() => {}}
/>
```

**Dimensões**:
- Altura: `56px` (h-14)
- Padding horizontal: `24px` (px-6)
- Sticky: `top-0 z-50`
- Background: `bg-surface/80 backdrop-blur-xl`

**Estados do Título**:
- Default: hover mostra ícone de edição (✏️)
- Editing: input com ring `ring-2 ring-primary/20`
- Ações: Enter salva, Escape cancela

**Classe Tailwind TopBar**:
```css
sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-xl
```

---

### 2. StatusChip

**Estados**:

**Saved**:
```tsx
text-success bg-success-bg
Icon: Check
Text: "Salvo 15:32"
```

**Saving**:
```tsx
text-text-secondary bg-bg
Icon: Clock
Text: "Salvando..."
```

**Error**:
```tsx
text-error bg-error-bg
Icon: AlertCircle
Text: "Erro ao salvar"
```

**Dimensões**:
- Altura: `28px` (h-7)
- Padding: `10px` (px-2.5)
- Border radius: `8px` (rounded-md)
- Font size: `12px` (text-xs)

---

### 3. PrimaryButton

**Propósito**: Ação primária (Salvar).

**Classe Tailwind**:
```css
flex h-9 items-center gap-2 rounded-lg bg-primary px-4 
text-sm font-medium text-white shadow-[var(--shadow-sm)]
transition-all duration-[var(--transition-fast)]
hover:bg-primary/90 hover:shadow-[var(--shadow-md)]
active:scale-[0.98]
disabled:pointer-events-none disabled:opacity-50
```

**Estados**:
- Default: `bg-primary`
- Hover: `bg-primary/90 shadow-md`
- Active: `scale-[0.98]`
- Disabled: `opacity-50 pointer-events-none`

---

### 4. GhostButton

**Propósito**: Ações secundárias (Histórico, Exportar, Salvar Versão).

**Classe Tailwind**:
```css
flex h-9 items-center gap-2 rounded-lg px-3 
text-sm font-medium text-text-secondary
transition-all duration-[var(--transition-fast)]
hover:bg-bg hover:text-text
active:scale-[0.98]
disabled:pointer-events-none disabled:opacity-50
```

**Área Clicável Mínima**: `40px` (h-9 = 36px, padding compensa)

---

### 5. MindmapNode

**Propósito**: Nó retangular arredondado no canvas.

**Estrutura**:
```tsx
<MindmapNode
  node={{ id, text, parentId, x, y, isRoot }}
  onTextChange={(id, text) => {}}
  onAddSubtopic={(parentId) => {}}
  onAddSibling={(nodeId) => {}}
/>
```

**Dimensões**:
- Min width: `160px`
- Max width: `280px`
- Min height: `48px`
- Padding: `16px 16px` (px-4 py-3)
- Border radius: `12px` (rounded-lg)

**Variantes**:

**Nó Normal**:
```css
border border-border bg-surface text-text
shadow-[var(--shadow-md)]
hover:shadow-[var(--shadow-lg)]
```

**Nó Raiz**:
```css
border-[2px] border-primary bg-surface
font-semibold text-text
shadow-[var(--shadow-md)]
```

**Estados**:
- Default: subtle shadow
- Hover: shadow-lg
- Editing: input com outline-none

---

### 6. NodeAddButton

**Propósito**: Botão + à direita do nó para abrir menu.

**Classe Tailwind**:
```css
flex h-8 w-8 items-center justify-center rounded-md
border border-border bg-surface text-text-secondary
opacity-0 shadow-[var(--shadow-sm)]
transition-all duration-[var(--transition-fast)]
hover:border-primary hover:bg-primary-bg hover:text-primary hover:shadow-[var(--shadow-md)]
group-hover:opacity-100
```

**Comportamento**:
- Invisível por padrão
- Aparece no hover do grupo (nó)
- Hover do botão: borda e fundo primary

---

### 7. NodeAddMenu (Popover)

**Propósito**: Menu com 2 opções: Subtópico e Novo Tópico.

**Estrutura**:
```tsx
<Popover side="right" sideOffset={8}>
  <MenuItem>
    <Title>Subtópico</Title>
    <Description>Cria um detalhe dentro deste item</Description>
  </MenuItem>
  
  {!isRoot && (
    <MenuItem>
      <Title>Novo Tópico</Title>
      <Description>Cria outro item neste mesmo nível</Description>
    </MenuItem>
  )}
  
  {isRoot && (
    <Note>A ideia central não possui "Novo Tópico"</Note>
  )}
</Popover>
```

**Dimensões**:
- Width: `288px` (w-72)
- Padding: `4px` (p-1)
- Border radius: `12px` (rounded-lg)
- Shadow: `var(--shadow-lg)`

**MenuItem**:
```css
flex flex-col items-start gap-0.5 rounded-md
px-3 py-2.5 text-left
transition-colors duration-[var(--transition-fast)]
hover:bg-primary-bg
```

**Animação**:
- Duration: `200ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Motion: `scale(0.95) → scale(1)`, `opacity(0) → opacity(1)`

---

### 8. HistoryDrawer

**Propósito**: Drawer lateral com lista de versões salvas.

**Estrutura**:
```tsx
<HistoryDrawer
  isOpen={true}
  onClose={() => {}}
  versions={[
    { id, timestamp, nodeCount }
  ]}
  isLoading={false}
  onVersionSelect={(id) => {}}
/>
```

**Dimensões**:
- Width: `448px` (max-w-md)
- Height: `100vh`
- Position: `fixed right-0 top-0`
- Backdrop: `bg-text/20 backdrop-blur-sm`

**Animação de Entrada/Saída**:
```tsx
// Drawer
initial: x: '100%'
animate: x: 0
exit: x: '100%'
duration: 300ms
easing: cubic-bezier(0.4, 0, 0.2, 1)

// Backdrop
initial: opacity: 0
animate: opacity: 1
exit: opacity: 0
duration: 200ms
```

**VersionItem**:
```css
rounded-lg border border-border bg-surface p-4
transition-all duration-[var(--transition-fast)]
hover:border-primary hover:bg-primary-bg hover:shadow-[var(--shadow-sm)]
```

**Estados**:
- Loading: Loader2 animado + texto "Carregando histórico..."
- Empty: Ícone Clock + mensagem "Nenhuma versão salva ainda"
- List: Itens de versão clicáveis

---

### 9. EmptyHint

**Propósito**: Dica discreta no estado inicial (apenas 1 nó raiz).

**Classe Tailwind**:
```css
flex items-center gap-2 rounded-lg
border border-primary/20 bg-primary-bg/50 px-4 py-2.5
shadow-[var(--shadow-sm)] backdrop-blur-sm
```

**Posição**: À direita do nó raiz (+200px X)

**Animação**:
```tsx
initial: opacity: 0, y: -10
animate: opacity: 1, y: 0
duration: 400ms
delay: 500ms
```

---

## Layout e Canvas

### Canvas

**Background Grid**:
```svg
<pattern id="grid" width="40" height="40">
  <circle cx="1" cy="1" r="1" fill="var(--canvas-grid)" />
</pattern>
```
- Opacity: `0.4` (bem sutil)

**Conexões (Linhas entre nós)**:
```svg
<path
  d="M x1 y1 Q midX y1, midX midY T x2 y2"
  stroke="var(--canvas-connection)"
  strokeWidth="2"
  strokeLinecap="round"
  fill="none"
/>
```

**Zoom/Pan**:
- Library: `react-zoom-pan-pinch`
- Initial scale: `1`
- Min scale: `0.5`
- Max scale: `2`
- Center on init: `true`

---

## Algoritmo de Layout

### Cálculo de Posições

**Espaçamento**:
- Horizontal: `280px` entre níveis
- Vertical: `100px` entre irmãos

**Lógica**:
1. Root sempre em `(0, 0)`
2. Filhos são posicionados à direita do pai (`x + 280`)
3. Irmãos são distribuídos verticalmente com espaçamento de 100px
4. Grupo de irmãos é centralizado em relação ao pai

**Pseudo-código**:
```js
function layoutTree(node, x, y, level) {
  const result = [{ ...node, x, y }];
  
  if (node.children.length === 0) return result;
  
  const totalHeight = (node.children.length - 1) * VERTICAL_SPACING;
  let currentY = y - totalHeight / 2;
  
  node.children.forEach(child => {
    const childX = x + HORIZONTAL_SPACING;
    result.push(...layoutTree(child, childX, currentY, level + 1));
    currentY += VERTICAL_SPACING;
  });
  
  return result;
}
```

---

## Responsividade

### Breakpoints

- **Desktop**: 1440px+ (layout padrão)
- **Laptop**: 1280px+ (reduz espaçamentos)
- **Tablet**: 834px+ (drawer vira modal full-screen)

### Adaptações Tablet (834px)

```tsx
// TopBar
<div className="px-4 md:px-6">
  // Esconde labels de botões, mostra apenas ícones
</div>

// HistoryDrawer
<motion.div className="w-full md:max-w-md">
  // Full width no tablet
</motion.div>
```

---

## Acessibilidade

### Contraste
- Texto principal: `#1A1A1A` em `#FAFAFA` = **17.8:1** (AAA)
- Texto secundário: `#6B6B6B` em `#FAFAFA` = **5.8:1** (AA)
- Primary: `#0066CC` em branco = **4.6:1** (AA)

### Foco Visível
- Ring: `ring-2 ring-primary/20`
- Outline: `outline-ring/50`

### Área Clicável Mínima
- Botões principais: `40px` (h-9 + padding)
- Ícones: `32px` (h-8 w-8)

### Atalhos de Teclado
- **Enter**: Confirma edição de texto
- **Escape**: Cancela edição
- **Tab**: Navegação entre nós (acessibilidade)

### ARIA
```tsx
<button aria-label="Adicionar nó">
<button aria-label="Fechar drawer">
<button aria-label="Voltar">
```

---

## Mapeamento CSS → Tailwind

| Token CSS | Classe Tailwind |
|-----------|-----------------|
| `var(--bg)` | `bg-bg` |
| `var(--surface)` | `bg-surface` |
| `var(--text)` | `text-text` |
| `var(--text-secondary)` | `text-text-secondary` |
| `var(--border)` | `border-border` |
| `var(--primary)` | `bg-primary` / `text-primary` / `border-primary` |
| `var(--primary-bg)` | `bg-primary-bg` |
| `var(--shadow-sm)` | `shadow-[var(--shadow-sm)]` |
| `var(--shadow-md)` | `shadow-[var(--shadow-md)]` |
| `var(--shadow-lg)` | `shadow-[var(--shadow-lg)]` |
| `var(--radius-md)` | `rounded-md` |
| `var(--radius-lg)` | `rounded-lg` |
| `var(--radius-xl)` | `rounded-xl` |

---

## Microinterações

### Transições
- **Fast** (150ms): Hover de botões, mudança de cor
- **Base** (200ms): Popover, animações de entrada
- **Slow** (300ms): Drawer, modais

### Animações Motion
```tsx
// Fade + Scale In
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.15 }}

// Slide from Right (Drawer)
initial={{ x: '100%' }}
animate={{ x: 0 }}
exit={{ x: '100%' }}
transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}

// Node Appear
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.2 }}
```

### Active States
```css
active:scale-[0.98]
```

---

## Exemplos de Uso

### Criar um novo nó
```tsx
const newNode = {
  id: `node-${Date.now()}`,
  text: 'Novo subtópico',
  parentId: 'parent-id',
  x: 0,
  y: 0,
};

setNodes(current => {
  const updated = [...current, newNode];
  return calculatePositions(updated);
});
```

### Exportar JSON
```tsx
const data = { title, nodes };
const blob = new Blob([JSON.stringify(data, null, 2)], {
  type: 'application/json',
});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${title}.json`;
a.click();
```

---

## Checklist de Implementação

- [ ] Configurar tokens CSS em `/src/styles/theme.css`
- [ ] Importar fonte Inter (400, 500, 600)
- [ ] Implementar TopBar com título editável
- [ ] Criar StatusChip com 3 estados
- [ ] Implementar MindmapNode com edição inline
- [ ] Criar NodeAddButton com popover
- [ ] Implementar algoritmo de layout (auto-centering)
- [ ] Adicionar conexões SVG entre nós
- [ ] Criar HistoryDrawer com animações
- [ ] Implementar EmptyHint para onboarding
- [ ] Configurar react-zoom-pan-pinch
- [ ] Testar responsividade (1440, 1280, 834)
- [ ] Validar acessibilidade (contraste, foco, ARIA)
- [ ] Implementar auto-save (simulado)
- [ ] Adicionar exportação JSON

---

## Referências de Design

- **Apple Human Interface Guidelines**: https://developer.apple.com/design/
- **Princípio 80/15/5**: Maioria silenciosa, minoria funcional, acentos raros
- **Motion**: Usar `motion/react` para animações suaves e performáticas
- **Radix UI**: Componentes acessíveis (Popover, etc)

---

**Data de Criação**: Fevereiro 2026  
**Versão**: 1.0  
**Designer**: AntropIA Design System
