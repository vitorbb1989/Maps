import { useAuth } from '@/components/AuthProvider'
import { Mindmap, supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, FileText, LogOut, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ITEMS_PER_PAGE = 9

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchMindmaps(1)
  }, [user])

  const fetchMindmaps = async (pageNumber: number) => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)

      const from = (pageNumber - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from('mindmaps')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Erro ao buscar mindmaps:', error)
        setError('Erro ao carregar mindmaps')
        return
      }

      setMindmaps(data || [])
      setTotalCount(count || 0)
      setHasMore((count || 0) > to + 1)
      setPage(pageNumber)

    } catch (error) {
      console.error('Erro crítico:', error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleNextPage = () => {
    if (hasMore) fetchMindmaps(page + 1)
  }

  const handlePrevPage = () => {
    if (page > 1) fetchMindmaps(page - 1)
  }

  const handleCreate = async () => {
    if (!user) return
    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('mindmaps')
        .insert([
          {
            user_id: user.id,
            title: 'Novo Mindmap',
            current_doc_json: { nodes: [], edges: [] },
          },
        ])
        .select()
        .single()

      if (error) throw error
      navigate(`/mindmap/${data.id}`)
    } catch (error) {
      console.error('Error creating mindmap:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent navigation when clicking delete
    if (!confirm('Tem certeza que deseja excluir este mindmap?')) return

    try {
      const { error } = await supabase.from('mindmaps').delete().eq('id', id)
      if (error) throw error
      setMindmaps(mindmaps.filter((m) => m.id !== id))
    } catch (error) {
      console.error('Error deleting mindmap:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Top Bar */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-sm sticky top-0 z-10">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-bg flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
            <span className="font-semibold tracking-tight">Mindmap</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary hidden sm:inline-block">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-text-secondary hover:text-text transition duration-150 ease-[var(--ease-standard)] p-2 rounded-xl hover:bg-surface-hover"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Meus Mindmaps</h1>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground rounded-xl font-medium transition duration-150 ease-[var(--ease-standard)] disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-px active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Mindmap</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-surface rounded-md animate-pulse border border-border" />
            ))}
          </div>
        ) : mindmaps.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-bg-tertiary">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface border border-border mb-4">
              <FileText className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-text mb-2">Nenhum mindmap ainda</h3>
            <p className="text-text-secondary mb-6">Crie seu primeiro mapa mental para começar.</p>
            <button
              onClick={handleCreate}
              className="px-4 py-3 bg-surface border border-border hover:border-primary-border text-text rounded-xl transition duration-150 ease-[var(--ease-standard)] hover:shadow-md"
            >
              Criar agora
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mindmaps.map((map) => (
                <div
                  key={map.id}
                  onClick={() => navigate(`/mindmap/${map.id}`)}
                  className="group relative bg-surface border border-border rounded-2xl p-6 hover:border-border-hover transition duration-150 ease-[var(--ease-standard)] cursor-pointer shadow-md hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary-bg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition duration-150 ease-[var(--ease-standard)]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, map.id)}
                      className="text-text-secondary hover:text-danger p-1.5 rounded-xl hover:bg-surface-hover opacity-0 group-hover:opacity-100 transition duration-150 ease-[var(--ease-standard)]"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold mb-2 truncate group-hover:text-primary transition duration-150 ease-[var(--ease-standard)]">
                    {map.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span>
                      Atualizado {formatDistanceToNow(new Date(map.updated_at), { locale: ptBR, addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {(page > 1 || hasMore) && (
              <div className="flex justify-center mt-8 gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg disabled:opacity-50 hover:bg-surface-hover transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <span className="flex items-center text-sm text-text-secondary">
                  Página {page}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg disabled:opacity-50 hover:bg-surface-hover transition"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
