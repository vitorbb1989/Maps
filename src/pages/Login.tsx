import { supabase } from '@/lib/supabase'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
})

export const Login = () => {
  const isDev = import.meta.env.DEV
  const testEmail = (import.meta.env.VITE_TEST_EMAIL as string | undefined) ?? ''
  const testPassword = (import.meta.env.VITE_TEST_PASSWORD as string | undefined) ?? ''

  const defaultEmail = isDev ? (testEmail || 'teste@antropia.local') : ''
  const defaultPassword = isDev ? (testPassword || 'antropia123') : ''

  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState(defaultPassword)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    const result = authSchema.safeParse({ email, password })
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Dados inválidos'
      setError(errorMessage)
      toast.error(errorMessage)
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success('Conta criada com sucesso! Verifique seu email.')
        // Auto sign-in usually happens, but sometimes email confirmation is needed.
        // For MVP, we'll assume it works or show a message.
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('Login realizado com sucesso!')
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-bg text-text">

      {/* Branding Section */}
      <div className="bg-bg-secondary p-8 md:p-12 flex flex-col justify-center border-r border-border">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-primary-bg flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Mindmap</span>
          </div>

          <h1 className="text-4xl font-semibold mb-6 tracking-tight">
            Organize suas ideias com clareza e elegância.
          </h1>

          <ul className="space-y-4 text-text-secondary">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Autosave inteligente com snapshots</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Interface minimalista e focada</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Exportação simples para JSON</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="bg-bg p-8 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-text-secondary">
              {isSignUp
                ? 'Comece a criar seus mapas mentais hoje.'
                : 'Entre para acessar seus mindmaps.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition duration-200 ease-[var(--ease-standard)] placeholder:text-text-tertiary"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition duration-200 ease-[var(--ease-standard)] placeholder:text-text-tertiary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-danger-bg border border-danger-border text-danger text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground font-medium rounded-xl transition duration-150 ease-[var(--ease-standard)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px active:translate-y-0 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isSignUp ? 'Criar conta' : 'Entrar'
              )}
            </button>

            {isDev && !isSignUp ? (
              <div className="rounded-2xl border border-border bg-bg-tertiary p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Credenciais de teste</div>
                    <div className="mt-1 text-xs text-text-secondary truncate">{defaultEmail}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(defaultEmail)
                        setPassword(defaultPassword)
                      }}
                      className="px-3 py-2 bg-surface border border-border hover:border-border-hover rounded-xl transition duration-150 ease-[var(--ease-standard)] text-sm font-medium"
                    >
                      Preencher
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(defaultEmail)
                        setPassword(defaultPassword)
                        const fakeEvent = { preventDefault: () => {} } as any
                        handleAuth(fakeEvent)
                      }}
                      className="px-3 py-2 bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground rounded-xl transition duration-150 ease-[var(--ease-standard)] text-sm font-medium"
                    >
                      Entrar teste
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-text-secondary">
                  Para customizar, defina `VITE_TEST_EMAIL` e `VITE_TEST_PASSWORD` no `.env`.
                </div>
              </div>
            ) : null}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-text-secondary">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-primary hover:text-primary-hover font-medium hover:underline focus:outline-none"
            >
              {isSignUp ? 'Entrar' : 'Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
