# Design de Páginas — MVP Mindmap (Desktop-first)

## 0. Global Styles (Design System AntropIA com tokens semânticos)

### Tokens semânticos (CSS variables sugeridas)
- Cores base
  - `--color-bg`: fundo principal (ex.: #0B0F17)
  - `--color-surface`: cards/superfícies (ex.: #121A2A)
  - `--color-border`: bordas (ex.: rgba(255,255,255,0.10))
  - `--color-text`: texto primário (ex.: rgba(255,255,255,0.92))
  - `--color-text-muted`: texto secundário (ex.: rgba(255,255,255,0.68))
- Ações
  - `--color-primary`: ação principal (ex.: #7C5CFF)
  - `--color-primary-hover`: hover (ex.: #6A4FFF)
  - `--color-danger`: destrutivo/erro (ex.: #FF4D4F)
  - `--color-success`: sucesso (ex.: #2ECC71)
- Tipografia
  - `--font-sans`: família (ex.: Inter, system-ui)
  - `--text-h1`: 28/36 semibold
  - `--text-h2`: 20/28 semibold
  - `--text-body`: 14/22 regular
  - `--text-caption`: 12/18 regular
- Layout
  - `--radius-sm`: 8px; `--radius-md`: 12px
  - `--space-1`: 4px; `--space-2`: 8px; `--space-3`: 12px; `--space-4`: 16px; `--space-6`: 24px
  - `--shadow-elev-1`: sombra suave para cards

### Componentes e estados
- Botão primário: fundo `--color-primary`, texto branco; hover `--color-primary-hover`; disabled com opacidade 0.5.
- Links: cor `--color-primary` com underline ao hover.
- Inputs: superfície `--color-surface`, borda `--color-border`, foco com outline em `--color-primary`.

### Responsividade (desktop-first)
- Breakpoints de referência: 1280+ (desktop), 768–1279 (tablet), <768 (mobile).
- No mobile, o Editor prioriza canvas; painéis viram drawer.

---

## 1) Página: Login

### Layout
- CSS Grid (2 colunas no desktop): esquerda (branding/benefícios), direita (card do formulário).
- Centralização vertical via flex no container do card.

### Meta Information
- Title: "Entrar — Mindmap"
- Description: "Acesse seu dashboard e edite mindmaps com autosave."
- OG: `og:title`, `og:description`, `og:type=website`

### Page Structure
1. Header minimal (logo AntropIA)
2. Coluna de branding (texto curto + lista de benefícios)
3. Card de autenticação

### Sections & Components
- Branding
  - Logo + nome do produto
  - Lista curta (ex.: autosave; export JSON)
- Auth Card
  - Campo Email
  - Campo Senha
  - Botão "Entrar"
  - Área de erro (alert inline)
  - Estado loading (spinner no botão)

---

## 2) Página: Dashboard

### Layout
- Layout em coluna com header fixo (top bar) + área de conteúdo.
- Conteúdo em CSS Grid de cards (3 colunas desktop, 2 tablet, 1 mobile).

### Meta Information
- Title: "Dashboard — Mindmaps"
- Description: "Seus mindmaps e acesso rápido ao editor."
- OG: `og:title`, `og:description`

### Page Structure
1. Top bar
2. Seção "Meus mindmaps"

### Sections & Components
- Top bar
  - Logo + nome
  - Botão primário "Novo mindmap"
  - Menu de usuário: "Sair"
- Lista de Mindmaps
  - Card por mindmap: título; "última atualização"; ação "Abrir"
  - Estado vazio: ilustração simples + CTA "Criar primeiro mindmap"
  - Estado loading: skeleton cards

Interações
- Criar: cria e navega direto para `/mindmap/:id`.
- Abrir: navega para o editor.

---

## 3) Página: Editor de Mindmap

### Layout
- Layout híbrido: Flexbox (colunas) + canvas central.
- Desktop: 3 áreas
  1) Top bar (fixo)
  2) Painel lateral esquerdo (inspector/ações)
  3) Canvas (expande)
  4) Painel lateral direito (snapshots)
- Tablet/mobile: painéis viram drawers (ícones na top bar).

### Meta Information
- Title: "Editor — Mindmap"
- Description: "Edite seu mindmap com snapshots automáticos e exporte JSON."
- OG: `og:title`, `og:description`

### Page Structure
1. Top bar (navegação + status de salvamento)
2. Editor body (painéis + canvas)

### Sections & Components
- Top bar
  - Breadcrumb/voltar: "Dashboard"
  - Título editável do mindmap
  - Indicador de autosave: "Salvando…" / "Salvo" / "Erro ao salvar"
  - Ações: "Exportar JSON" (botão secundário)
- Painel esquerdo (Ações / Inspector)
  - Botões: "Novo nó", "Nova conexão" (se aplicável)
  - Propriedades do nó selecionado: texto (textarea), excluir nó
  - Dicas de atalhos (caption)
- Canvas
  - Pan/zoom
  - Nós como cards (radius, shadow leve)
  - Conexões como linhas
  - Seleção com destaque (borda `--color-primary`)
- Painel direito (Snapshots)
  - Lista (mais recente primeiro): timestamp + label "Auto"
  - Ação "Restaurar" por item (com confirmação modal)
  - Estado vazio: "Nenhum snapshot ainda"

Estados e regras de interação
- Autosave
  - Debounce (ex.: ~1–3s) após alterações; evita salvar continuamente durante drag.
  - Em erro: manter edição local e permitir retry automático ou ao interagir.
- Export JSON
  - Gera download local com nome do mindmap + data.
- Restauração
  - Ao restaurar: substitui documento atual e dispara autosave.
