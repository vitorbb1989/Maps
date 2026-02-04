# Correções Imediatas - Código Pronto para MVP

## 🚨 Correções Críticas - Aplicar Agora

### 1. Fix ReactFlow NodeTypes - MindmapEditor.tsx

**Arquivo**: `src/pages/MindmapEditor.tsx`

```typescript
// ADICIONAR APÓS OS IMPORTS (linha ~55)
const nodeTypes = useMemo(() => ({ mindmap: MindmapNode }), [])

// MODIFICAR O RETURN DO ReactFlow (linha ~712)
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  fitView
  className="bg-bg"
  minZoom={0.1}
  nodeTypes={nodeTypes} // ADICIONAR ESTA LINHA
  deleteKeyCode={null}
  // ... resto das props
>
```

### 2. Fix Error Handling - MindmapEditor.tsx

**Adicionar após a função `loadMindmap` (linha ~247)**:

```typescript
const loadMindmap = async () => {
  try {
    const { data, error } = await supabase
      .from('mindmaps')
      .select('id,title,current_doc_json')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao carregar mindmap:', error)
      alert('Erro ao carregar mindmap. Redirecionando...')
      navigate('/dashboard')
      return
    }

    if (!data) {
      alert('Mindmap não encontrado')
      navigate('/dashboard')
      return
    }

    setTitle(data.title)
    // ... resto do código existente
  } catch (error) {
    console.error('Erro crítico ao carregar:', error)
    alert('Erro ao carregar mindmap')
    navigate('/dashboard')
  }
}
```

### 3. Fix Error Handling - Dashboard.tsx

**Modificar função `fetchMindmaps` (linha ~20)**:

```typescript
const fetchMindmaps = async () => {
  if (!user) return
  try {
    setLoading(true) // ADICIONAR
    setError(null) // ADICIONAR
    
    const { data, error } = await supabase
      .from('mindmaps')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar mindmaps:', error)
      setError('Erro ao carregar mindmaps') // ADICIONAR
      return
    }
    
    setMindmaps(data || [])
  } catch (error) {
    console.error('Erro crítico:', error)
    setError('Erro ao conectar com o servidor') // ADICIONAR
  } finally {
    setLoading(false)
  }
}
```

**Adicionar estado de erro no componente (linha ~12)**:
```typescript
const [error, setError] = useState<string | null>(null) // ADICIONAR
```

**Adicionar exibição de erro (após linha ~120)**:
```typescript
{error && (
  <div className="mb-4 p-4 rounded-lg bg-danger-bg border border-danger-border text-danger text-sm">
    {error}
  </div>
)}
```

### 4. Fix Snapshot Performance - MindmapEditor.tsx

**Modificar debounce (linha ~254)**:
```typescript
// MUDAR DE:
const debouncedDoc = useDebounce(flowDoc, 1200)

// PARA:
const debouncedDoc = useDebounce(flowDoc, 3000) // 3 segundos
```

**Adicionar lógica de mudanças significativas (linha ~260)**:
```typescript
const hasSignificantChanges = (prev: any, next: any) => {
  if (!prev || !next) return true
  const prevStr = JSON.stringify(prev)
  const nextStr = JSON.stringify(next)
  return prevStr !== nextStr
}

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false
    return
  }

  if (!id || !debouncedDoc) return
  
  // Verificar se há mudanças significativas
  const currentDoc = serializeDoc(nodes, edges)
  if (!hasSignificantChanges(lastSavedDoc, currentDoc)) return

  const save = async () => {
    setSaveStatus('saving')
    try {
      const { error } = await supabase
        .from('mindmaps')
        .update({
          current_doc_json: debouncedDoc,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setLastSaved(new Date())
      setSaveStatus('saved')
      setDirtySinceSnapshot(true)
      setLastSavedDoc(currentDoc) // Guardar referência
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSaveStatus('error')
    }
  }

  save()
}, [debouncedDoc, id, nodes, edges])
```

**Adicionar estado (linha ~115)**:
```typescript
const [lastSavedDoc, setLastSavedDoc] = useState<any>(null) // ADICIONAR
```

### 5. Fix CSS Classes - index.css

**Adicionar ao final do arquivo**:
```css
/* Classes faltantes */
.text-text-tertiary {
  color: rgb(var(--text-tertiary));
}

.bg-surface-muted {
  background-color: rgb(var(--surface-muted));
}

.border-danger-border {
  border-color: rgb(var(--danger-border));
}

.bg-danger-bg {
  background-color: rgb(var(--danger-bg));
}

.text-danger {
  color: rgb(var(--danger));
}

.border-primary-border {
  border-color: rgb(var(--primary-border));
}

.bg-primary-bg {
  background-color: rgb(var(--primary-bg));
}
```

### 6. Fix Auth Error Handling - AuthProvider.tsx

**Modificar useEffect (linha ~26)**:
```typescript
useEffect(() => {
  const initAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Erro ao obter sessão:', error)
        setLoading(false)
        return
      }
      
      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Erro crítico na autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  initAuth()

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session)
    setUser(session?.user ?? null)
    setLoading(false)
  })

  return () => subscription.unsubscribe()
}, [])
```

### 7. Fix MindmapNode Error Handling

**Modificar função commit (linha ~38)**:
```typescript
const commit = () => {
  try {
    const nextLabel = draft.trim()
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n
        return {
          ...n,
          data: {
            ...(n.data ?? {}),
            label: nextLabel.length ? nextLabel : 'Sem título',
          },
        }
      })
    )
    setEditing(false)
  } catch (error) {
    console.error('Erro ao salvar nó:', error)
    setEditing(false)
  }
}
```

---

## 🎯 Testes Rápidos para Validar

### Teste 1: Login
```bash
# Usar credenciais do .env
Email: accounts@antrop-ia.com
Senha: 123456
```

### Teste 2: Criar Mindmap
1. Login → Dashboard
2. Clicar "Novo Mindmap"
3. Verificar se abre editor
4. Adicionar 2-3 nós
5. Verificar autosave (status)

### Teste 3: Exportar
1. No editor, clicar "Exportar"
2. Verificar se baixa JSON válido

### Teste 4: Snapshots
1. Fazer mudanças
2. Clicar "Salvar versão"
3. Verificar histórico
4. Restaurar versão

### Teste 5: Logout
1. Sair do editor
2. Voltar ao dashboard
3. Fazer logout
4. Verificar redirecionamento

---

## ⏱️ Timeline para MVP Funcional

- **0-30min**: Aplicar correções 1-3 (ReactFlow, Error Handling)
- **30-60min**: Aplicar correções 4-6 (Performance, CSS, Auth)
- **60-90min**: Testar fluxo completo
- **90-120min**: Ajustes finais e deploy

**Total: 2 horas para MVP