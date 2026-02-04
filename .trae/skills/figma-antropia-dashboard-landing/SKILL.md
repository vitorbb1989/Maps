---
name: "figma-antropia-dashboard-landing"
description: "Aplica designs do Figma no Dashboard/Landing (React/Tailwind) com tokens AntropIA. Use quando houver Figma desses fluxos e precisar implementar/ajustar UI."
---

# Figma AntropIA — Dashboard + Landing Integrator

## Objetivo

Integrar e ajustar **somente** as telas de entrada do produto (Landing, Login, Dashboard e estados vazios) a partir de um design no Figma, gerando código React/Tailwind fiel e seguindo o design system AntropIA.

## Quando invocar

Invoque este skill quando o usuário:
- Enviar link/print/Dev Mode do Figma referente a Landing/Login/Dashboard
- Pedir para “aplicar no código o que está no Figma” nessas telas
- Pedir refinamentos de UI premium (Apple-like) nessas telas sem mexer no editor

## Escopo (o que entra / o que não entra)

**Inclui:**
- Landing (se existir no projeto)
- Login
- Dashboard (lista, cards, header, CTA “Novo Mindmap”, estados vazios, loading)
- Microcomponentes relacionados (botões, chips, cards, modais/drawers usados nessas telas)

**Não inclui:**
- Editor de mindmap (ReactFlow / canvas)
- Nós e menu de criação dentro do editor

## Entradas aceitas

1) Link do Figma (público ou com acesso) para frames:
- Landing
- Login
- Dashboard

2) Export de imagens (PNG/JPG) dos frames

3) Dev Mode:
- CSS / Tailwind / React (se disponível)

4) Requisitos (lista objetiva):
- O que mudar, o que manter, quebras (breakpoints), estados, interações

## Regras AntropIA (obrigatório)

Filosofia:
- Apple-like: silencioso, funcional, elegante via simplicidade
- 80/15/5: neutro predominante, azul apenas para ação, cores funcionais só para estado
- Sem elementos decorativos gratuitos

Tipografia:
- Inter apenas, pesos 400/500/600

Tokens:
- Nunca introduzir HEX direto no código
- Usar tokens em `src/index.css` e classes do Tailwind configuradas

Referências do projeto:
- Tokens e variáveis: [src/index.css]
- Tailwind tokens: [tailwind.config.js]

## Arquivos-alvo mais comuns (ajuste conforme necessidade)

- Dashboard: [src/pages/Dashboard.tsx]
- Login: [src/pages/Login.tsx]
- Landing: procurar em `src/pages` (ex: `Landing.tsx`, `Home.tsx`)
- Componentes compartilhados: `src/components/*`

## Procedimento recomendado

### Passo 1 — Auditoria rápida do Figma

1) Identificar frames e tamanhos (desktop/tablet/mobile).
2) Extrair specs:
   - Grid (margens/gaps)
   - Tipografia (tamanho/weight/line-height)
   - Cores (mapear para tokens)
   - Componentes e estados (hover/focus/disabled/loading/empty)

### Passo 2 — Mapeamento de tokens

Converter tudo para tokens:
- Backgrounds: `bg-bg`, `bg-bg-secondary`, `bg-bg-tertiary`, `bg-surface`
- Texto: `text-text`, `text-text-secondary`, `text-text-tertiary`
- Bordas: `border-border`, `border-border-hover`, `border-primary-border`
- CTA primário: `bg-primary`, `text-primary-foreground`, `hover:bg-primary-hover`, `active:bg-primary-active`
- Estados: `text-danger`, `bg-danger-bg`, etc (apenas para estado)

### Passo 3 — Implementação no código

1) Ajustar layout macro (estrutura e espaçamentos).
2) Ajustar componentes (cards, botões, cabeçalho, listas).
3) Ajustar estados (loading, vazio, erro).
4) Garantir acessibilidade: contraste, foco visível, hit-area.

### Passo 4 — Validação

- `npm run build`
- Validar responsivo (desktop/tablet) e estados principais

## Saída esperada

1) Mudanças no código alinhadas ao Figma e aos tokens AntropIA.
2) Documento curto “Relatório Aplicado (Dashboard/Landing)” com:
   - O que mudou (por tela)
   - Arquivos alterados
   - Decisões de tokenização (principais mapeamentos)
   - Checklist de validação

## Prompt pronto para o Smart Agent Generator (Trae)

> Você é um agente Figma→Código focado em Dashboard/Landing/Login. Leia um frame do Figma (link/print/Dev Mode) e implemente no projeto React/Tailwind em `c:\\Users\\Usuario\\Documents\\trae_projects\\Maps`.  
> Restrições: NÃO mexer no Editor (ReactFlow). Seguir rigorosamente o design system AntropIA (Inter 400/500/600, 80/15/5, tokens em `src/index.css`, Tailwind em `tailwind.config.js`, sem HEX no código).  
> Alvos: `src/pages/Dashboard.tsx`, `src/pages/Login.tsx` e a página Landing (se existir).  
> Entregáveis: alterações no código + `npm run build` ok + relatório objetivo com arquivos, decisões e checklist.

