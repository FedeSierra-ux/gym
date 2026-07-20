#!/usr/bin/env node
// Refresca los GIF de los ejercicios matcheando por nombre (nameEn) contra la
// API pública de ExerciseDB, y reescribe los mediaId en src/data/exercises.ts.
//
// Pensado para correr en un entorno CON internet (GitHub Actions). Genera además
// un reporte (gif-refresh-report.md) con los cambios y los que no matchearon,
// para poder revisar el PR con confianza.
//
// Config por env:
//   EXERCISEDB_API  base de la API (default https://www.exercisedb.dev/api/v1)
//   MATCH_THRESHOLD score mínimo de similitud para aplicar (default 0.55)

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import https from 'node:https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const EXERCISES_FILE = join(ROOT, 'src/data/exercises.ts')
const REPORT_FILE = process.env.GIF_REPORT || join(ROOT, 'gif-refresh-report.md')
// Se puede pasar una o varias bases separadas por coma; se prueban en orden.
const APIS = (process.env.EXERCISEDB_API ||
  'https://www.exercisedb.dev/api/v1,https://exercisedb-api.vercel.app/api/v1')
  .split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean)
const THRESHOLD = parseFloat(process.env.MATCH_THRESHOLD || '0.55')
// El cert TLS de exercisedb.dev suele estar vencido. La validación se desactiva
// a nivel de proceso vía NODE_TLS_REJECT_UNAUTHORIZED=0 (lo setea el workflow);
// esto es solo para reflejarlo en el reporte.
const INSECURE_TLS = /^(1|true|yes)$/i.test(process.env.INSECURE_TLS || '') ||
  process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0'
// Agente que ignora el cert vencido de exercisedb.dev de forma garantizada
// (node:https lo respeta, a diferencia del fetch global en algunas versiones).
const insecureAgent = INSECURE_TLS ? new https.Agent({ rejectUnauthorized: false }) : undefined
if (INSECURE_TLS) {
  console.warn('⚠  Validación de certificado TLS desactivada (solo para este refresco en CI).')
}

// ── helpers de texto ────────────────────────────────────────────────────────
const norm = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const tokens = (s) => new Set(norm(s).split(' ').filter(Boolean))

function score(a, b) {
  // Jaccard de tokens + bonus si uno contiene al otro
  const ta = tokens(a), tb = tokens(b)
  if (!ta.size || !tb.size) return 0
  let inter = 0
  for (const t of ta) if (tb.has(t)) inter++
  const jac = inter / (ta.size + tb.size - inter)
  const na = norm(a), nb = norm(b)
  const contains = na.includes(nb) || nb.includes(na) ? 0.15 : 0
  return Math.min(1, jac + contains)
}

// ── traer todo el dataset de ExerciseDB ─────────────────────────────────────
// Usamos node:https (no el fetch global) para poder pasar un agente que ignore
// el cert vencido de forma confiable en cualquier versión de Node.
function fetchJson(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent: insecureAgent, headers: { accept: 'application/json' } }, (res) => {
      const { statusCode = 0, headers } = res
      if (statusCode >= 300 && statusCode < 400 && headers.location && redirects < 5) {
        res.resume()
        return resolve(fetchJson(new URL(headers.location, url).href, redirects + 1))
      }
      if (statusCode >= 400) { res.resume(); return reject(new Error(`API ${statusCode} en ${url}`)) }
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (c) => { body += c })
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(new Error(`JSON inválido de ${url}: ${e.message}`)) }
      })
    })
    req.on('error', reject)
    req.setTimeout(30000, () => req.destroy(new Error(`timeout en ${url}`)))
  })
}

async function fetchAllFrom(API) {
  const all = []
  let offset = 0
  const limit = 100
  for (let page = 0; page < 100; page++) {
    const json = await fetchJson(`${API}/exercises?limit=${limit}&offset=${offset}`)
    const data = Array.isArray(json) ? json : (json.data ?? json.exercises ?? [])
    if (!data.length) break
    all.push(...data)
    if (data.length < limit) break
    offset += limit
  }
  return all
}

async function fetchAll() {
  let lastErr
  for (const API of APIS) {
    try {
      console.log(`Bajando dataset de ${API} ...`)
      const all = await fetchAllFrom(API)
      if (all.length) return mapDataset(all)
      console.warn(`  (vacío en ${API}, pruebo el siguiente)`)
    } catch (e) {
      lastErr = e
      console.warn(`  falló ${API}: ${e.message}`)
    }
  }
  throw lastErr || new Error('Ninguna API devolvió datos')
}

function mapDataset(all) {
  return all.map((e) => {
    const gifUrl = e.gifUrl || e.gif || e.image || ''
    const mid = (gifUrl.match(/media\/([^./]+)\.gif/) || [])[1] || e.exerciseId || e.id || ''
    return { name: e.name || e.exerciseName || '', mediaId: mid, gifUrl }
  }).filter((e) => e.name && e.mediaId)
}

// ── parsear nuestros ejercicios ─────────────────────────────────────────────
const BLOCK_RE =
  /id:\s*'([^']+)',\s*nameEs:\s*'[^']*',(?:\s*nameArg:\s*'[^']*',)?\s*nameEn:\s*'([^']*)'[\s\S]*?image:\s*IMG\('([^']+)'\)/g

async function main() {
  let text = await readFile(EXERCISES_FILE, 'utf8')
  const ours = []
  for (const m of text.matchAll(BLOCK_RE)) {
    ours.push({ id: m[1], nameEn: m[2], oldMid: m[3] })
  }
  console.log(`Ejercicios en la app: ${ours.length}`)

  const db = await fetchAll()
  console.log(`Dataset ExerciseDB: ${db.length} ejercicios`)
  if (!db.length) throw new Error('Dataset vacío — revisá EXERCISEDB_API')

  const changes = []
  const misses = []
  for (const ex of ours) {
    let best = null
    let bestScore = 0
    for (const cand of db) {
      const s = score(ex.nameEn, cand.name)
      if (s > bestScore) { bestScore = s; best = cand }
    }
    if (best && bestScore >= THRESHOLD) {
      if (best.mediaId !== ex.oldMid) {
        changes.push({ ...ex, newMid: best.mediaId, match: best.name, score: bestScore })
      }
    } else {
      misses.push({ ...ex, best: best?.name ?? '—', score: bestScore })
    }
  }

  // aplicar cambios (reemplazo dentro del bloque exacto de cada id)
  for (const c of changes) {
    const re = new RegExp(
      `(id:\\s*'${c.id.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}'[\\s\\S]*?image:\\s*IMG\\(')${c.oldMid}('\\))`
    )
    text = text.replace(re, `$1${c.newMid}$2`)
  }
  await writeFile(EXERCISES_FILE, text)

  // reporte
  const lines = []
  lines.push(`# Refresco de GIFs — reporte`)
  lines.push('')
  lines.push(`- API: \`${APIS.join(', ')}\`${INSECURE_TLS ? ' (TLS sin validar)' : ''}`
    + `\n- Umbral de match: ${THRESHOLD}`
    + `\n- Ejercicios: ${ours.length} · Cambios: ${changes.length} · Sin match confiable: ${misses.length}`)
  lines.push('')
  lines.push(`## GIFs actualizados (${changes.length})`)
  lines.push('')
  lines.push('| id | nombre EN | match ExerciseDB | score | mediaId viejo → nuevo |')
  lines.push('|---|---|---|---|---|')
  for (const c of changes) lines.push(`| ${c.id} | ${c.nameEn} | ${c.match} | ${c.score.toFixed(2)} | \`${c.oldMid}\` → \`${c.newMid}\` |`)
  lines.push('')
  lines.push(`## Sin match confiable — revisar a mano (${misses.length})`)
  lines.push('')
  lines.push('| id | nombre EN | mejor candidato | score |')
  lines.push('|---|---|---|---|')
  for (const m of misses) lines.push(`| ${m.id} | ${m.nameEn} | ${m.best} | ${m.score.toFixed(2)} |`)
  await writeFile(REPORT_FILE, lines.join('\n') + '\n')

  console.log(`Cambios: ${changes.length} · Sin match: ${misses.length}`)
  console.log(`Reporte: ${REPORT_FILE}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
