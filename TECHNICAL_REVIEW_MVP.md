# Review Técnico: MVP Mindmap AntropIA 🧠

Este documento detalha a implementação do MVP, as decisões arquiteturais e os cenários de uso para avaliação técnica.

---

## 1. Stack Tecnológica & Cenário de Deploy

**Decisão**: React + Vite + TypeScript no Frontend; Supabase (Auth/DB) no Backend.
**Justificativa**: Velocidade máxima de prototipagem com persistência robusta. O Supabase elimina a necessidade de um backend manual (Node/Express) nesta fase, permitindo focar no core (o editor).

**Cenário de Infra (VPS)**:
- **Docker**: Containerização para consistência entre dev/prod.
- **Traefik**: Reverse proxy com SSL automático e suporte nativo a Docker labels.
- **Nginx**: Servindo o build estático dentro do container frontend.

---

## 2. Design System: AntropIA (Tokens Semânticos)

A interface segue a filosofia "Apple-like": limpa, tipografia Inter e cores profundas. Implementamos via **CSS Variables** no `index.css` mapeadas para o **Tailwind**.

### Configuração Tailwind
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',           // #0B0F17
        surface: 'var(--color-surface)', // #121A2A
        border: 'var(--color-border)',   // rgba(255,255,255,0.10)
        primary: {
          DEFAULT: 'var(--color-primary)', // #7C5CFF
          hover: 'var(--color-primary-hover)',
        }
      },
      borderRadius: { md: '12px' },
      boxShadow: { 'elev-1': 'var(--shadow-elev-1)' }
    }
  }
}
```

---

## 3. Modelo de Dados & Backend (Supabase)

O banco PostgreSQL foi estruturado para suportar o histórico de versões exigido no MVP.

### Esquema SQL
```sql
-- Tabela principal de Mindmaps
CREATE TABLE mindmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Novo mindmap',
  current_doc_json JSONB NOT NULL DEFAULT '{}'::jsonb, -- Estado atual do grafo
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Snapshots (Imutáveis)
CREATE TABLE mindmap_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mindmap_id UUID REFERENCES mindmaps(id) ON DELETE CASCADE,
  doc_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
*Observação: Row Level Security (RLS) habilitado para garantir que um usuário só acesse seus próprios mapas.*

---

## 4. O Core: Editor de Mindmap (React Flow)

O editor é construído sobre o `reactflow`, que gerencia o canvas, nodes e edges de forma performática.

### Mecanismo de Autosave & Snapshots
Para evitar sobrecarga no banco e garantir a segurança dos dados, usamos um **Debounce de 2 segundos**.

```typescript
// Cenário: O usuário move um nó ou edita um texto.
// 1. O estado local do React Flow muda.
// 2. O hook useDebounce aguarda 2s de inatividade.
// 3. Ao disparar, o efeito executa duas ações:
//    a) Update no 'current_doc_json' do Mindmap (estado rápido).
//    b) Insert em 'mindmap_snapshots' (histórico/versão).

const debouncedData = useDebounce({ nodes, edges }, 2000);

useEffect(() => {
  if (isFirstRender.current || !id) return;

  const save = async () => {
    setSaving(true);
    // Atualiza o mapa principal
    await supabase.from('mindmaps').update({ current_doc_json: debouncedData }).eq('id', id);
    // Cria ponto de restauração
    await supabase.from('mindmap_snapshots').insert({ mindmap_id: id, doc_json: debouncedData });
    setSaving(false);
  };
  save();
}, [debouncedData]);
```

---

## 5. Exportação JSON
A exportação é feita inteiramente no cliente, gerando um Blob a partir do estado atual do grafo.
```typescript
const handleExport = () => {
  const data = JSON.stringify({ title, nodes, edges }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // Trigger download...
};
```

---

## 6. Pontos para Avaliação (Refinamento)

1.  **Granularidade dos Snapshots**: Atualmente, cada salvamento automático gera um snapshot. Em mapas complexos, isso pode gerar muitos registros. *Sugestão: Criar snapshots apenas em mudanças significativas ou a cada X minutos.*
2.  **Performance do Grafo**: Para +100 nós, podemos precisar de custom nodes otimizados ou virtualização (nativa do React Flow).
3.  **Segurança**: O `user_id` no insert de snapshots é pego do contexto. Validar se a política de RLS do Supabase é suficiente ou se precisamos de um Trigger no banco para forçar o `auth.uid()`.

---

## Como Validar Localmente
1.  `npm install`
2.  Configurar `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3.  Rodar migrações no dashboard do Supabase.
4.  `npm run dev`
