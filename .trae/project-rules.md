# Regras do Projeto: Maps (Mindmap AntropIA)

## 1. Princípios de UX/UI (AntropIA)
- **Identidade Visual**:
  - Cores: Neutras (brancos, cinzas) com acentos em Azul (#1A73E8).
  - Filosofia: 80% Branco/Gelo, 15% Cinza/Bordas, 5% Acento (Ação).
  - Tipografia: Inter (limpa, moderna).
- **Componentes**:
  - Use bordas arredondadas (`rounded-xl` ou `rounded-2xl`).
  - Sombras suaves (`shadow-sm`, `shadow-md`).
  - Feedback visual constante (loading states, toasts de erro).

## 2. Padrões de Código (React + TypeScript)
- **Estilo**: Functional Components com Hooks.
- **Estado**: Priorize `useState` local para UI e `ReactFlow` hooks para o grafo.
- **Tipagem**: SEMPRE use interfaces/types. Evite `any`.
- **Estilização**: Tailwind CSS. Use as classes semânticas definidas no `index.css` (ex: `bg-surface`, `text-secondary`).

## 3. Regras de Negócio Críticas
- **Estrutura de Árvore**: Cada nó tem APENAS UM pai (exceto a raiz).
- **Prevenção de Ciclos**: Não permitir conexões que criem loops (usar `isAncestor`).
- **Segurança**:
  - Todo acesso a dados deve ser protegido por RLS no Supabase.
  - Usuários só veem seus próprios mapas.

## 4. Fluxo de Salvamento
- **Autosave**: Debounce de 3s + Verificação de mudança real (`hasSignificantChanges`).
- **Snapshots**: Criados manualmente ou a cada 3 min se houver mudanças.
