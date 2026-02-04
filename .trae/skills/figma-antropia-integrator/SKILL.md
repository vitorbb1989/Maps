---
name: "figma-antropia-integrator"
description: "Integra design do Figma ao app (React/Tailwind) seguindo tokens AntropIA. Use quando houver link/print/Dev Mode do Figma e precisar aplicar ajustes no frontend."
---

# Figma AntropIA Integrator

## Objetivo

Transformar um frame do Figma (link/print/Dev Mode) em alterações reais no projeto, mantendo fidelidade visual **premium** e seguindo o design system AntropIA (tokens, tipografia Inter, 80/15/5).

## Quando invocar

Invoque este skill quando o usuário:
- Enviar link público do Figma / frame
- Enviar screenshot/export do Figma (PNG/JPG)
- Colar CSS/React do Dev Mode
- Pedir para “aplicar no código o que está no Figma”

## Entradas aceitas (fornecidas pelo usuário)

1) **Link do Figma** (público ou com permissão)
- Preferência: link direto do frame e página

2) **Imagem (PNG/JPG)** do frame
- Preferência: desktop 1440px + tablet 834px se existir

3) **Dev Mode (copy as)**:
- CSS / Tailwind / React (se o plugin gerar)

4) **Checklist de mudanças**
- Lista objetiva do que deve mudar (layout, cores, espaçamentos, componentes)

## Regras do Design System AntropIA (obrigatório)

Fonte:
- Inter: pesos permitidos 400/500/600

Cores:
- Manter 80/15/5 e evitar cores fora do sistema
- Nunca introduzir HEX direto no código (usar tokens)

Tokens do projeto (referência):
- Ver [src/index.css] para variáveis `--bg`, `--surface`, `--text`, `--border`, `--primary`, `--primary-bg`, `--primary-border`, `--on-primary`, etc.
- Ver [tailwind.config.js] para mapeamento de tokens em classes Tailwind

Sombras/raios/espaçamento:
- Sombras sutis (sm/md/lg)
- Raio consistente (md/lg/xl/2xl)
- Espaçamento em múltiplos de 4px

## Como executar (procedimento)

### Passo A — Extrair especificações do Figma

1) Identificar o frame alvo (nome, tamanho, breakpoints).
2) Catalogar:
   - Grid/layout (margens, gaps, alturas fixas)
   - Tipografia (tamanho/weight/line-height)
   - Cores (mapear para tokens existentes)
   - Componentes e estados (default/hover/active/disabled/focus)
3) Se só houver print:
   - Inferir espaçamentos e hierarquia usando medidas relativas
   - Confirmar tokens mais próximos do design system

### Passo B — Mapear componentes para o código

Use este mapa como base e ajuste conforme o alvo:

- Editor de mindmap:
  - [src/pages/MindmapEditor.tsx]
  - [src/components/MindmapNode.tsx]
- Dashboard / botão Novo Mindmap:
  - [src/pages/Dashboard.tsx]
- Tokens e classes utilitárias:
  - [src/index.css]
  - [tailwind.config.js]

### Passo C — Implementar no frontend

1) Aplicar tokens (cores/fundo/bordas) antes de refinar detalhes.
2) Ajustar layout macro (grid, alinhamento, tamanhos).
3) Ajustar componentes (botões, cards, menus, drawers) com estados.
4) Garantir acessibilidade:
   - Contraste AA
   - Foco visível
   - Hit-area mínima ~40px em CTAs

### Passo D — Validação

Rodar:
- `npm run build`

Checar no dev:
- Fluxos principais
- Responsividade (desktop/tablet)
- Hover/focus/disabled

## Saída esperada (entregáveis)

1) Alterações no código (componentes, tokens, layout).
2) Um documento curto “Relatório de Aplicação do Figma” contendo:
   - O que foi alterado
   - Arquivos impactados
   - Decisões de mapeamento de tokens
   - Checklist de validação

## Prompt pronto para colar no Smart Agent Generator (Trae)

Use este prompt para criar um agente que lê o Figma e aplica no código:

> Você é um agente de integração Figma→Código. Sua missão é ler um frame do Figma (link/print/Dev Mode), extrair specs e aplicar no projeto React/Tailwind localizado em `c:\\Users\\Usuario\\Documents\\trae_projects\\Maps`.  
> Regras: seguir design system AntropIA (Inter 400/500/600, 80/15/5, tokens em `src/index.css` e mapeamento em `tailwind.config.js`), não introduzir HEX no código.  
> Alvos principais: `src/pages/MindmapEditor.tsx`, `src/components/MindmapNode.tsx`, `src/pages/Dashboard.tsx`.  
> Passos: (1) Extrair specs do Figma; (2) Mapear para tokens; (3) Implementar; (4) Validar com `npm run build`; (5) Gerar relatório objetivo com arquivos/decisões/checklist.  
> Sempre que houver ambiguidade, priorize consistência com o design system e uma UI premium minimalista (Apple-like).

