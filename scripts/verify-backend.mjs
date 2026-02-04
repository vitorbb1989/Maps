import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const projectRoot = process.cwd()

function parseDotenvLine(line) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null
  const eqIndex = trimmed.indexOf('=')
  if (eqIndex === -1) return null
  const key = trimmed.slice(0, eqIndex).trim()
  let value = trimmed.slice(eqIndex + 1).trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }
  return { key, value }
}

function loadDotenvFiles() {
  const candidates = ['.env.local', '.env']
  for (const file of candidates) {
    const fullPath = path.join(projectRoot, file)
    if (!fs.existsSync(fullPath)) continue
    const content = fs.readFileSync(fullPath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const parsed = parseDotenvLine(line)
      if (!parsed) continue
      if (process.env[parsed.key] == null) process.env[parsed.key] = parsed.value
    }
  }
}

function requireEnv(key) {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Variável de ambiente ausente: ${key}. Defina em .env/.env.local ou no shell.`
    )
  }
  return value
}

function ms(n) {
  return `${Math.round(n)}ms`
}

function nowIso() {
  return new Date().toISOString()
}

async function main() {
  loadDotenvFiles()

  const supabaseUrl = requireEnv('VITE_SUPABASE_URL')
  const supabaseAnonKey = requireEnv('VITE_SUPABASE_ANON_KEY')

  const iterations = Number(process.env.VERIFY_ITERATIONS ?? '25')
  const argMode = process.argv.includes('--health') ? 'health' : null
  const mode = (argMode ?? process.env.VERIFY_MODE ?? 'auth').toLowerCase()
  const email =
    process.env.TEST_USER_EMAIL ??
    process.env.VITE_TEST_EMAIL ??
    'accounts@antrop-ia.com'
  const password =
    process.env.TEST_USER_PASSWORD ??
    process.env.VITE_TEST_PASSWORD ??
    '123456'

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const apikeyHeaderValue = supabaseAnonKey

  const healthCheck = async () => {
    const authHealthUrl = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/health`
    const restMindmapsUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/mindmaps?select=id&limit=5`
    const restSnapshotsUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/mindmap_snapshots?select=id&limit=5`

    const healthStart = performance.now()
    const authHealthRes = await fetch(authHealthUrl, {
      headers: {
        apikey: apikeyHeaderValue,
      },
    })
    const authHealthElapsed = performance.now() - healthStart

    const restStart = performance.now()
    const restMindmapsRes = await fetch(restMindmapsUrl, {
      headers: {
        apikey: apikeyHeaderValue,
        Authorization: `Bearer ${apikeyHeaderValue}`,
      },
    })
    const restElapsed = performance.now() - restStart

    const snapshotsStart = performance.now()
    const restSnapshotsRes = await fetch(restSnapshotsUrl, {
      headers: {
        apikey: apikeyHeaderValue,
        Authorization: `Bearer ${apikeyHeaderValue}`,
      },
    })
    const snapshotsElapsed = performance.now() - snapshotsStart

    const parseJsonSafely = async (res) => {
      try {
        const text = await res.text()
        if (!text) return null
        return JSON.parse(text)
      } catch {
        return null
      }
    }

    const mindmapsJson = await parseJsonSafely(restMindmapsRes)
    const snapshotsJson = await parseJsonSafely(restSnapshotsRes)

    return {
      authHealth: { ok: authHealthRes.ok, status: authHealthRes.status, elapsedMs: authHealthElapsed },
      restMindmaps: {
        ok: restMindmapsRes.ok,
        status: restMindmapsRes.status,
        elapsedMs: restElapsed,
        rows: Array.isArray(mindmapsJson) ? mindmapsJson.length : null,
      },
      restSnapshots: {
        ok: restSnapshotsRes.ok,
        status: restSnapshotsRes.status,
        elapsedMs: snapshotsElapsed,
        rows: Array.isArray(snapshotsJson) ? snapshotsJson.length : null,
      },
    }
  }

  if (mode === 'health') {
    console.log(`[backend-verify] mode=health start=${nowIso()} iterations=${iterations}`)
    const totalStart = performance.now()
    let okAuthHealth = 0
    let okRlsNoLeak = 0
    let failures = 0

    for (let i = 1; i <= iterations; i++) {
      try {
        const { authHealth, restMindmaps, restSnapshots } = await healthCheck()
        if (authHealth.ok) okAuthHealth += 1

        const mindmapsNoLeak = restMindmaps.ok && restMindmaps.status === 200 && restMindmaps.rows === 0
        const snapshotsNoLeak = restSnapshots.ok && restSnapshots.status === 200 && restSnapshots.rows === 0
        if (mindmapsNoLeak && snapshotsNoLeak) okRlsNoLeak += 1

        console.log(
          `[ok] #${i}/${iterations} authHealth=${authHealth.status}(${ms(
            authHealth.elapsedMs
          )}) mindmaps=${restMindmaps.status}/rows=${restMindmaps.rows}(${ms(
            restMindmaps.elapsedMs
          )}) snapshots=${restSnapshots.status}/rows=${restSnapshots.rows}(${ms(restSnapshots.elapsedMs)})`
        )
      } catch (err) {
        failures += 1
        console.log(`[fail] #${i}/${iterations} ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const elapsedTotalMs = performance.now() - totalStart
    console.log(`[backend-verify] done end=${nowIso()}`)
    console.log(
      `[backend-verify] summary authHealth_ok=${okAuthHealth}/${iterations} rls_no_leak_ok=${okRlsNoLeak}/${iterations} failures=${failures}/${iterations} totalTime=${ms(elapsedTotalMs)}`
    )
    if (failures > 0) process.exit(1)
    return
  }

  const trySignIn = async (e, p) => {
    const authStart = performance.now()
    const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: p })
    return { data, error, elapsedMs: performance.now() - authStart }
  }

  let authLabel = 'signin'
  let authElapsed = 0
  let user = null

  const signInAttempt = await trySignIn(email, password)
  authElapsed = signInAttempt.elapsedMs

  if (signInAttempt.data?.session?.user) {
    user = signInAttempt.data.session.user
  } else {
    // Tenta login com o usuário criado
    const fallbackEmail = `verify${Date.now()}@antrop-ia.com`
    authLabel = 'signup_then_signin'
    const signUpStart = performance.now()
    
    // Tentar criar o usuário principal se o erro for de credenciais
    let targetEmail = email
    if (signInAttempt.error?.message?.includes('Invalid login credentials')) {
       // Tentar criar o usuário principal
       const { data: signUpMain, error: signUpMainError } = await supabase.auth.signUp({
          email: targetEmail,
          password
       })
       
       if (signUpMain?.session?.user) {
          user = signUpMain.session.user
          authElapsed = performance.now() - signUpStart
       } else if (signUpMain?.user && !signUpMain.session) {
           // Usuário criado mas requer confirmação
           throw new Error(`Usuário ${targetEmail} criado, mas requer confirmação de email. Confirme no Supabase Dashboard.`)
       } else {
           // Falha ao criar usuário principal (rate limit, já existe, etc)
           // Vamos tentar criar um usuário randômico de fallback
           console.log(`[backend-verify] Falha ao criar usuário principal (${targetEmail}): ${signUpMainError?.message}. Tentando fallback...`)
           targetEmail = fallbackEmail
       }
    } else {
        targetEmail = fallbackEmail
    }

    if (!user) {
        // Tenta criar usuário randômico
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: targetEmail,
            password,
        })
        authElapsed = performance.now() - signUpStart

        if (signUpError) {
        throw new Error(
            `Falha no login (${email}) e não foi possível criar usuário de teste (${targetEmail}). ` +
            `signin_msg=${signInAttempt.error?.message ?? 'desconhecido'}; ` +
            `signup_msg=${signUpError.message}.`
        )
        }

        if (!signUpData?.session?.user) {
        throw new Error(
            `Falha no login (${email}) e o Supabase retornou signup sem sessão para ${targetEmail} (provável confirmação de email ativa). ` +
            `Verifique configurações de Auth > Email Auth > Confirm email no Supabase.`
        )
        }

        user = signUpData.session.user
    }
  }

  const stats = {
    iterations,
    ok: 0,
    failures: 0,
    rlsMindmapInsertBlocked: 0,
    rlsSnapshotInsertBlocked: 0,
    lastError: null,
    elapsedTotalMs: 0,
  }

  console.log(`[backend-verify] start=${nowIso()} iterations=${iterations}`)
  console.log(`[backend-verify] user=${user.id}`)
  console.log(`[backend-verify] auth=${authLabel} ${ms(authElapsed)}`)

  const totalStart = performance.now()

  for (let i = 1; i <= iterations; i++) {
    const iterStart = performance.now()
    const title = `verify-${Date.now()}-${i}`

    try {
      const insertStart = performance.now()
      const { data: inserted, error: insertError } = await supabase
        .from('mindmaps')
        .insert({
          user_id: user.id,
          title,
          current_doc_json: { nodes: [], edges: [] },
        })
        .select('id,user_id,title')
        .single()
      const insertElapsed = performance.now() - insertStart

      if (insertError || !inserted?.id) {
        throw new Error(`insert mindmap falhou (${ms(insertElapsed)}): ${insertError?.message}`)
      }

      const selectStart = performance.now()
      const { data: selected, error: selectError } = await supabase
        .from('mindmaps')
        .select('id,user_id,title')
        .eq('id', inserted.id)
        .single()
      const selectElapsed = performance.now() - selectStart

      if (selectError || !selected?.id) {
        throw new Error(`select mindmap falhou (${ms(selectElapsed)}): ${selectError?.message}`)
      }

      const updateStart = performance.now()
      const nextTitle = `${title}-updated`
      const { error: updateError } = await supabase
        .from('mindmaps')
        .update({ title: nextTitle })
        .eq('id', inserted.id)
      const updateElapsed = performance.now() - updateStart

      if (updateError) {
        throw new Error(`update mindmap falhou (${ms(updateElapsed)}): ${updateError.message}`)
      }

      const snapshotStart = performance.now()
      const { data: snapshot, error: snapshotError } = await supabase
        .from('mindmap_snapshots')
        .insert({
          mindmap_id: inserted.id,
          user_id: user.id,
          doc_json: { nodes: [{ id: 'n1', position: { x: 0, y: 0 }, data: { label: 'ok' } }], edges: [] },
        })
        .select('id,mindmap_id')
        .single()
      const snapshotElapsed = performance.now() - snapshotStart

      if (snapshotError || !snapshot?.id) {
        throw new Error(
          `insert snapshot falhou (${ms(snapshotElapsed)}): ${snapshotError?.message}`
        )
      }

      const negativeMindmapStart = performance.now()
      const { error: negMindmapError } = await supabase
        .from('mindmaps')
        .insert({
          user_id: randomUUID(),
          title: `rls-negative-${title}`,
          current_doc_json: { nodes: [], edges: [] },
        })
        .select('id')
        .single()
      const negativeMindmapElapsed = performance.now() - negativeMindmapStart

      if (negMindmapError) stats.rlsMindmapInsertBlocked += 1

      const negativeSnapshotStart = performance.now()
      const { error: negSnapshotError } = await supabase
        .from('mindmap_snapshots')
        .insert({
          mindmap_id: randomUUID(),
          user_id: user.id,
          doc_json: { nodes: [], edges: [] },
        })
        .select('id')
        .single()
      const negativeSnapshotElapsed = performance.now() - negativeSnapshotStart

      if (negSnapshotError) stats.rlsSnapshotInsertBlocked += 1

      const deleteStart = performance.now()
      const { error: deleteError } = await supabase.from('mindmaps').delete().eq('id', inserted.id)
      const deleteElapsed = performance.now() - deleteStart

      if (deleteError) {
        throw new Error(`delete mindmap falhou (${ms(deleteElapsed)}): ${deleteError.message}`)
      }

      stats.ok += 1
      const iterElapsed = performance.now() - iterStart
      console.log(
        `[ok] #${i}/${iterations} iter=${ms(iterElapsed)} insert=${ms(insertElapsed)} select=${ms(
          selectElapsed
        )} update=${ms(updateElapsed)} snapshot=${ms(snapshotElapsed)} rlsMindmap=${
          negMindmapError ? `blocked(${ms(negativeMindmapElapsed)})` : `NOT_BLOCKED(${ms(negativeMindmapElapsed)})`
        } rlsSnapshot=${
          negSnapshotError
            ? `blocked(${ms(negativeSnapshotElapsed)})`
            : `NOT_BLOCKED(${ms(negativeSnapshotElapsed)})`
        }`
      )
    } catch (err) {
      stats.failures += 1
      stats.lastError = err instanceof Error ? err.message : String(err)
      console.log(`[fail] #${i}/${iterations} ${stats.lastError}`)
    }
  }

  stats.elapsedTotalMs = performance.now() - totalStart

  console.log(`[backend-verify] done end=${nowIso()}`)
  console.log(
    `[backend-verify] summary ok=${stats.ok} failures=${stats.failures} total=${iterations} totalTime=${ms(
      stats.elapsedTotalMs
    )}`
  )
  console.log(
    `[backend-verify] rls negative insert blocked: mindmaps=${stats.rlsMindmapInsertBlocked}/${iterations}, snapshots=${stats.rlsSnapshotInsertBlocked}/${iterations}`
  )

  if (stats.failures > 0) process.exit(1)
}

main().catch((err) => {
  console.error(`[backend-verify] fatal: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
