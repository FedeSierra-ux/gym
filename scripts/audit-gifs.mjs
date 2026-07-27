#!/usr/bin/env node
// Audita los GIF de los ejercicios contra ExerciseDB. Pensado para correr en CI
// (el entorno local no tiene salida a static.exercisedb.dev).
//
// Produce, en audit/:
//   gif-audit.md          reporte: qué ejercicio es realmente cada mediaId
//   sheet-actual-NN.png   hojas de contacto con 2 frames de cada GIF actual
//   sheet-propuesto.png   lo mismo para los candidatos sugeridos
//
// Las hojas de contacto son el punto: el nombre del mediaId puede coincidir y
// el GIF mostrar otra cosa, así que hay que mirarlos.

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'audit')
// La base vieja (www.exercisedb.dev/api/v1) devuelve 404 desde 2026: el proyecto
// movió la versión gratuita a oss.exercisedb.dev.
const APIS = (process.env.EXERCISEDB_API ||
  'https://oss.exercisedb.dev/api/v1,https://v1.exercisedb.dev/api/v1,https://www.exercisedb.dev/api/v1')
  .split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean)
const insecure = new https.Agent({ rejectUnauthorized: false })
let API_USED = APIS[0]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// La API tira 429 con facilidad: reintenta con espera creciente.
async function getRetry(url, binary = false, tries = 5) {
  let wait = 2000
  for (let i = 0; i < tries; i++) {
    try { return await get(url, binary) } catch (e) {
      if (!/HTTP 429|HTTP 5\d\d|timeout/.test(e.message) || i === tries - 1) throw e
      await sleep(wait)
      wait *= 2
    }
  }
  throw new Error(`sin reintentos para ${url}`)
}

function get(url, binary = false, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent: insecure, headers: { accept: binary ? '*/*' : 'application/json' } }, (res) => {
      const { statusCode = 0, headers } = res
      if (statusCode >= 300 && statusCode < 400 && headers.location && redirects < 5) {
        res.resume()
        return resolve(get(new URL(headers.location, url).href, binary, redirects + 1))
      }
      if (statusCode >= 400) { res.resume(); return reject(new Error(`HTTP ${statusCode} ${url}`)) }
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        if (binary) return resolve(buf)
        try { resolve(JSON.parse(buf.toString('utf8'))) } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.setTimeout(45000, () => req.destroy(new Error(`timeout ${url}`)))
  })
}

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
const toks = (s) => new Set(norm(s).split(' ').filter(Boolean))
function score(a, b) {
  const ta = toks(a), tb = toks(b)
  if (!ta.size || !tb.size) return 0
  let inter = 0
  for (const t of ta) if (tb.has(t)) inter++
  const jac = inter / (ta.size + tb.size - inter)
  const na = norm(a), nb = norm(b)
  return Math.min(1, jac + (na.includes(nb) || nb.includes(na) ? 0.15 : 0))
}

async function fetchDataset() {
  for (const API of APIS) {
    try {
      // La API capa el limit (pide 100, devuelve 25) y según la versión pagina
      // por offset, por page o por un puntero en la metadata. Probamos las tres
      // y nos quedamos con la que acumule más ejercicios distintos.
      const items = (json) => Array.isArray(json) ? json : (json.data ?? json.exercises ?? [])
      const keyOf = (e) => e.exerciseId || e.id || e.name

      const probe = await get(`${API}/exercises?limit=10&offset=0`)
      await writeFile(join(OUT, 'probe-envelope.json'), JSON.stringify(
        Array.isArray(probe) ? { shape: 'array', length: probe.length }
          : { shape: 'object', keys: Object.keys(probe), metadata: probe.metadata ?? probe.meta ?? null },
        null, 2))

      // La API pagina por cursor (meta.nextCursor + meta.hasNextPage), pero el
      // nombre del parámetro varía según la versión: probamos los candidatos y
      // dejamos traza de cuál anduvo.
      // El parámetro de cursor es `after` (lo devuelve como meta.nextCursor).
      // Hay rate limiting agresivo, así que vamos con pausa entre páginas.
      const byCursor = []
      const seen = new Set()
      let cursor = ''
      let lastErr = ''
      for (let n = 0; n < 200; n++) {
        const url = `${API}/exercises?limit=100${cursor ? `&after=${encodeURIComponent(cursor)}` : ''}`
        let json
        try { json = await getRetry(url) } catch (e) { lastErr = e.message; break }
        const data = items(json)
        if (!data.length) break
        let added = 0
        for (const e of data) {
          const k = keyOf(e)
          if (!seen.has(k)) { seen.add(k); byCursor.push(e); added++ }
        }
        const meta = json.meta ?? json.metadata ?? {}
        if (!added || !meta.hasNextPage || !meta.nextCursor) break
        cursor = meta.nextCursor
        await sleep(1200)
      }
      console.log(`  cursor "after": ${byCursor.length} ejercicios ${lastErr ? `(cortó en: ${lastErr})` : ''}`)
      await writeFile(join(OUT, 'pagination-trace.json'), JSON.stringify({ total: byCursor.length, lastErr }, null, 2))

      const strategies = [
        { name: 'offset', url: (n, size) => `${API}/exercises?limit=100&offset=${n * size}` },
        { name: 'page', url: (n) => `${API}/exercises?limit=100&page=${n + 1}` },
        { name: 'page0', url: (n) => `${API}/exercises?limit=100&page=${n}` },
      ]
      let all = byCursor
      for (const st of (byCursor.length > 500 ? [] : strategies)) {
        const acc = []
        const seen = new Set()
        let size = 25
        for (let n = 0; n < 200; n++) {
          let data
          try { data = items(await get(st.url(n, size))) } catch { break }
          if (!data.length) break
          size = data.length
          let added = 0
          for (const e of data) {
            const k = keyOf(e)
            if (seen.has(k)) continue
            seen.add(k); acc.push(e); added++
          }
          if (!added) break
        }
        console.log(`  paginación "${st.name}": ${acc.length} ejercicios`)
        if (acc.length > all.length) all = acc
        if (all.length > 1000) break
      }
      if (all.length) {
        API_USED = API
        console.log(`Dataset: ${all.length} ejercicios desde ${API}`)
        // Guardamos un par de registros crudos: los nombres de campo y el host
        // de los gifUrl cambian entre versiones de la API.
        await writeFile(join(OUT, 'sample-raw.json'), JSON.stringify(all.slice(0, 3), null, 2))
        return all.map((e) => {
          const gifUrl = e.gifUrl || e.gif || e.image || ''
          const mid = (gifUrl.match(/media\/([^./]+)\.gif/) || [])[1] || e.exerciseId || e.id || ''
          return {
            name: e.name || e.exerciseName || '',
            mid,
            gifUrl,
            target: (e.targetMuscles || [e.target]).filter(Boolean).join(', '),
            equipment: (e.equipments || [e.equipment]).filter(Boolean).join(', '),
            bodyParts: (e.bodyParts || [e.bodyPart]).filter(Boolean).join(', '),
          }
        }).filter((e) => e.name && e.mid)
      }
    } catch (e) { console.warn(`falló ${API}: ${e.message}`) }
  }
  throw new Error('No se pudo bajar el dataset')
}

// ── frames ──────────────────────────────────────────────────────────────────
const TILE = 150
const COLS = 4
const ROWS = 5
const LABEL_H = 26

async function framesOf(url) {
  const buf = await get(url, true)
  const meta = await sharp(buf, { animated: true }).metadata()
  const pages = meta.pages || 1
  const pick = [0, Math.floor(pages / 2)]
  const out = []
  for (const p of pick) {
    const png = await sharp(buf, { page: p })
      .resize(TILE, TILE, { fit: 'contain', background: '#ffffff' })
      .png().toBuffer()
    out.push(png)
  }
  return out
}

function labelSvg(text, width) {
  const safe = text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  return Buffer.from(
    `<svg width="${width}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${LABEL_H}" fill="#111827"/>
      <text x="6" y="18" font-family="DejaVu Sans, sans-serif" font-size="13" fill="#ffffff">${safe}</text>
    </svg>`
  )
}

async function contactSheets(items, prefix) {
  const cellW = TILE * 2
  const cellH = TILE + LABEL_H
  const perSheet = COLS * ROWS
  const sheets = []
  for (let s = 0; s * perSheet < items.length; s++) {
    const slice = items.slice(s * perSheet, (s + 1) * perSheet)
    const composites = []
    for (let i = 0; i < slice.length; i++) {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const x = col * cellW
      const y = row * cellH
      composites.push({ input: labelSvg(slice[i].label, cellW), top: y, left: x })
      slice[i].frames.forEach((f, k) => {
        composites.push({ input: f, top: y + LABEL_H, left: x + k * TILE })
      })
    }
    const name = `${prefix}-${String(s + 1).padStart(2, '0')}.png`
    await sharp({
      create: {
        width: COLS * cellW, height: ROWS * cellH,
        channels: 3, background: '#e5e7eb',
      },
    }).composite(composites).png().toFile(join(OUT, name))
    sheets.push(name)
    console.log(`hoja ${name} (${slice.length} ejercicios)`)
  }
  return sheets
}

// ── main ────────────────────────────────────────────────────────────────────
const text = await readFile(join(ROOT, 'src/data/exercises.ts'), 'utf8')
const BLOCK = /id:\s*'([^']+)',\s*nameEs:\s*'([^']*)',(?:\s*nameArg:\s*'[^']*',)?\s*nameEn:\s*'([^']*)'[\s\S]*?image:\s*IMG\('([^']+)'\)/g
const ours = [...text.matchAll(BLOCK)].map((m) => ({ id: m[1], es: m[2], en: m[3], mid: m[4] }))
console.log(`Ejercicios en la app: ${ours.length}`)

await mkdir(OUT, { recursive: true })
const db = await fetchDataset()
// Se commitea el dataset: con él se puede elegir el GIF correcto sin depender
// de CI ni de la disponibilidad de la API.
await writeFile(join(OUT, 'dataset.json'), JSON.stringify(db, null, 1))

// Si la paginación no trajo el catálogo completo, buscamos ejercicio por
// ejercicio: para elegir el GIF correcto alcanza con los candidatos de cada uno.
const mapOne = (e) => {
  const gifUrl = e.gifUrl || e.gif || e.image || ''
  const mid = (gifUrl.match(/media\/([^./]+)\.gif/) || [])[1] || e.exerciseId || e.id || ''
  return {
    name: e.name || '', mid, gifUrl,
    target: (e.targetMuscles || [e.target]).filter(Boolean).join(', '),
    equipment: (e.equipments || [e.equipment]).filter(Boolean).join(', '),
  }
}
async function searchByName(q) {
  const urls = [
    `${API_USED}/exercises/search?q=${encodeURIComponent(q)}&limit=25`,
    `${API_USED}/exercises/search?query=${encodeURIComponent(q)}&limit=25`,
    `${API_USED}/exercises?search=${encodeURIComponent(q)}&limit=25`,
    `${API_USED}/exercises?name=${encodeURIComponent(q)}&limit=25`,
  ]
  for (const url of urls) {
    try {
      const json = await get(url)
      const data = Array.isArray(json) ? json : (json.data ?? json.exercises ?? [])
      if (data.length) return data.map(mapOne).filter((e) => e.name && e.mid)
    } catch { /* probamos la siguiente forma */ }
  }
  return []
}

if (db.length < 500) {
  console.log('Dataset incompleto: busco candidatos por nombre para cada ejercicio...')
  const found = new Map(db.map((e) => [e.mid, e]))
  for (const ex of ours) {
    for (const cand of await searchByName(ex.en)) found.set(cand.mid, cand)
    await sleep(800)
  }
  db.length = 0
  db.push(...found.values())
  console.log(`Dataset ampliado por búsqueda: ${db.length} ejercicios`)
}

const byMid = new Map()
for (const e of db) if (!byMid.has(e.mid)) byMid.set(e.mid, e)

const rows = []
for (const ex of ours) {
  const actual = byMid.get(ex.mid) || null
  let best = null, bestScore = 0
  for (const cand of db) {
    const s = score(ex.en, cand.name)
    if (s > bestScore) { bestScore = s; best = cand }
  }
  rows.push({
    ...ex,
    actualName: actual?.name ?? '(mediaId no está en el dataset)',
    actualTarget: actual?.target ?? '',
    actualEquipment: actual?.equipment ?? '',
    matchScore: actual ? score(ex.en, actual.name) : 0,
    bestName: best?.name ?? '—',
    bestMid: best?.mid ?? '',
    bestGifUrl: best?.gifUrl ?? '',
    bestScore,
  })
}

// Hojas de contacto de los GIF actuales. Se bajan desde la URL exacta que arma
// la app (IMG() en exercises.ts), no desde la que devuelve la API: si ese host
// dejó de servir, los GIF están rotos en producción y hay que saberlo.
const APP_URL = (mid) => `https://static.exercisedb.dev/media/${mid}.gif`
const currentItems = []
for (const r of rows) {
  try {
    currentItems.push({ label: `${r.id} · ${r.es}`.slice(0, 46), frames: await framesOf(APP_URL(r.mid)) })
    r.appUrlOk = true
  } catch (e) {
    console.warn(`sin frames para ${r.id} (${r.mid}): ${e.message}`)
    r.appUrlOk = false
    r.gifError = e.message
  }
}
const sheetsActual = await contactSheets(currentItems, 'sheet-actual')

// hojas de los candidatos, solo donde el nombre no coincide bien
const suspects = rows.filter((r) => (r.matchScore < 0.6 || !r.appUrlOk) && r.bestMid && r.bestMid !== r.mid)
const propItems = []
for (const r of suspects) {
  try {
    propItems.push({ label: `${r.id} → ${r.bestName}`.slice(0, 46), frames: await framesOf(r.bestGifUrl || APP_URL(r.bestMid)) })
  } catch (e) { console.warn(`sin frames candidato ${r.id}: ${e.message}`) }
}
const sheetsProp = propItems.length ? await contactSheets(propItems, 'sheet-propuesto') : []

// Hoja extra con los candidatos elegidos a mano (audit/candidates.json), para
// mirarlos antes de aplicarlos en exercises.ts.
let sheetsPicked = []
try {
  const picked = JSON.parse(await readFile(join(OUT, 'candidates.json'), 'utf8'))
  const pickedItems = []
  for (const c of picked) {
    try {
      pickedItems.push({ label: `${c.id} · ${c.note}`.slice(0, 46), frames: await framesOf(APP_URL(c.mid)) })
    } catch (e) { console.warn(`sin frames candidato ${c.id} (${c.mid}): ${e.message}`) }
  }
  if (pickedItems.length) sheetsPicked = await contactSheets(pickedItems, 'sheet-elegidos')
} catch { console.log('(sin audit/candidates.json, salteo la hoja de elegidos)') }

// duplicados: mismo mediaId en dos ejercicios distintos
const midCount = new Map()
for (const r of rows) midCount.set(r.mid, (midCount.get(r.mid) || 0) + 1)
const dupes = rows.filter((r) => midCount.get(r.mid) > 1)

const md = []
md.push('# Auditoría de GIFs\n')
md.push(`- Ejercicios en la app: **${rows.length}**`)
md.push(`- Dataset ExerciseDB: **${db.length}**`)
md.push(`- GIF que **no cargan** desde la URL que usa la app: **${rows.filter((r) => !r.appUrlOk).length}**`)
md.push(`- Nombre del mediaId no coincide con el nuestro (score < 0.6): **${rows.filter((r) => r.matchScore < 0.6).length}**`)
md.push(`- mediaId repetidos entre ejercicios: **${dupes.length}**`)
md.push(`\nHojas de contacto: ${[...sheetsActual, ...sheetsProp, ...sheetsPicked].join(', ')}\n`)
md.push('## Qué ejercicio es realmente cada mediaId\n')
md.push('| id | nuestro nombre EN | mediaId | ExerciseDB dice que es | músculo | equipo | score |')
md.push('|---|---|---|---|---|---|---|')
for (const r of rows) {
  md.push(`| ${r.id} | ${r.en} | \`${r.mid}\` | ${r.actualName} | ${r.actualTarget} | ${r.actualEquipment} | ${r.matchScore.toFixed(2)} |`)
}
md.push('\n## Candidatos para los que no coinciden\n')
md.push('| id | nuestro nombre EN | mejor candidato | mediaId candidato | score |')
md.push('|---|---|---|---|---|')
for (const r of suspects) md.push(`| ${r.id} | ${r.en} | ${r.bestName} | \`${r.bestMid}\` | ${r.bestScore.toFixed(2)} |`)
md.push('\n## mediaId repetidos\n')
for (const r of dupes) md.push(`- \`${r.mid}\` → ${r.id} (${r.es})`)

await writeFile(join(OUT, 'gif-audit.md'), md.join('\n') + '\n')
await writeFile(join(OUT, 'gif-audit.json'), JSON.stringify(rows, null, 2))
console.log('\nListo: audit/gif-audit.md')
