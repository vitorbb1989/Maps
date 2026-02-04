
# Checklist de Validação Manual (MVP Mindmap AntropIA)

1. Banco: no Supabase SQL Editor, execute `supabase/migrations/20240101000000_init_schema.sql`.
2. Banco: no Supabase SQL Editor, execute `supabase/migrations/20260203_fix_rls_policies.sql`.
3. Local: rode `npm install` e depois `npm run dev`.
4. UI: abra `/login` e valide tema light (fundo branco/cinzas) com accent azul e tipografia Inter.
5. UI: no login, inspecione a página e confirme que não há HEX/`text-white`/`bg-white` nos componentes.
6. Auth: crie conta e faça login; recarregar o browser deve manter sessão e ir para `/dashboard`.
7. Dashboard: crie um mindmap; ele deve abrir o editor e exibir um nó inicial.
8. Editor: clique no texto de um nó para editar; Enter salva; Escape cancela; blur salva.
9. Editor: selecione um nó e use atalhos:
   - Enter cria novo nó conectado ao selecionado.
   - Tab cria subnó conectado ao selecionado.
   - Delete/Backspace remove nó e conexões.
10. Persistência: mova/crie nós e observe status "Salvando…" → "Salvo"; o histórico não deve crescer a cada edição.
11. Snapshots: clique em "Salvar versão"; o painel "Histórico" deve mostrar a nova versão e restaurar deve substituir o canvas.
12. Segurança (RLS): com 2 usuários diferentes, confirme que o usuário B não consegue listar/abrir mindmaps do usuário A.

## Checklist rápido (edges/tree) — 5 minutos

1. Abrir um mindmap existente e confirmar que as **linhas (edges)** aparecem visíveis no tema light.
2. Clicar em um nó: ele vira contexto; `Tab` cria **filho** conectado.
3. Clicar em um nó que não é root: `Enter` cria **irmão** conectado ao mesmo pai.
4. Clicar no root: `Enter` cria um **filho** (fallback de tree).
5. Arrastar conexão manual (handle → handle): cria edge e o target passa a ter **apenas 1 pai**.
6. Conectar manualmente um nó target que já tem pai: a conexão anterior do target some e só fica a nova.
7. Tentar criar ciclo: conectar um nó para um descendente (ex: pai → neto como filho do neto). Deve ser bloqueado (nada acontece).
8. Clicar em uma aresta: ela fica em destaque; `Delete` remove a aresta.
9. Selecionar um nó e `Delete`: remove o nó (e descendentes) e seleciona automaticamente o pai/root.
10. Recarregar a página: o mindmap mantém **nodes + edges + parentId** idênticos ao que estava.
