/**
 * Copia las ilustraciones de @bryllim/workout-guide (CC BY-SA 4.0) a
 * public/exercise-frames/ y genera src/data/exerciseFrames.ts.
 *
 * Usamos dos de los tres frames de cada ejercicio (1 = inicio, 3 = final) para
 * poder animar el movimiento con dos imágenes locales, sin depender de los GIFs
 * remotos de ExerciseDB (que ya nos dieron problemas de TLS y de ejercicio
 * equivocado) ni de la API de wger.
 *
 *   node scripts/sync-exercise-frames.mjs
 *
 * Requiere `npm i --no-save @bryllim/workout-guide` (no queda como dependencia:
 * el paquete pesa 34 MB y sólo lo necesitamos para regenerar los assets).
 */
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const require = createRequire(import.meta.url)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const PKG = 'node_modules/@bryllim/workout-guide'
const OUT_DIR = resolve(root, 'public/exercise-frames')
const FRAME_SIZE = 256
const FRAMES = [1, 3]

const manifest = require(resolve(root, PKG, 'manifest.json'))

/** Muscle del catálogo → grupo muscular de la app. */
const MUSCLE_TO_GROUP = {
  Chest: 'pecho',
  Shoulders: 'hombros',
  'Rear Delts': 'hombros',
  'Upper Back': 'espalda',
  Back: 'espalda',
  Lats: 'espalda',
  'Lower Back': 'espalda',
  'Posterior Chain': 'piernas',
  Hamstrings: 'piernas',
  Quads: 'piernas',
  Calves: 'piernas',
  Legs: 'piernas',
  Adductors: 'piernas',
  Glutes: 'gluteos',
  Hips: 'gluteos',
  Biceps: 'biceps',
  Triceps: 'triceps',
  Forearms: 'biceps',
  Core: 'core',
  Mobility: 'core',
}

/**
 * Ejercicios propios cuyo nameEn no coincide literal con el catálogo.
 * Sin esto quedarían sin ilustración o con una equivocada.
 */
const OVERRIDES = {
  'pecho-04': 'cable-fly',
  'pecho-05': 'dumbbell-fly',
  'pecho-09': 'pec-deck',
  'espalda-03': 'one-arm-dumbbell-row',
  'espalda-06': 'seated-row',
  'espalda-10': 'straight-arm-pulldown',
  'hombros-06': 'rear-delt-fly',
  'biceps-03': 'cable-curl',
  'triceps-02': 'tricep-pushdown',
  'triceps-03': 'skull-crusher',
  'triceps-04': 'single-arm-dumbbell-tricep-extension',
  'piernas-01': 'squat',
  'piernas-05': 'lying-leg-curl',
  'piernas-07': 'forward-lunge',
  'piernas-11': 'calf-raise',
  'piernas-12': 'seated-leg-curl',
  'gluteos-03': 'cable-kickback',
  'core-01': 'ab-wheel',
  'core-06': 'decline-sit-up',
  'core-08': 'dumbbell-side-bend',
  'core-09': 'mountain-climber',
  'core-11': 'cable-crunch',
  'cardio-01': 'running',
  'cardio-02': 'cycling',
  'cardio-03': 'elliptical',
  'cardio-04': 'rowing',
  'cardio-05': 'stair-climber',
  'cardio-06': 'jump-rope',
  'cardio-07': 'battle-ropes',
  'cardio-08': 'burpee',
}

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Carga src/data/exercises.ts sin compilar TypeScript: sólo quita los tipos. */
async function loadExercises() {
  const src = readFileSync(resolve(root, 'src/data/exercises.ts'), 'utf8')
  const js = src
    .replace(/^import type .*$/m, '')
    .replace(/: Exercise\[\]/, '')
    .replace(/\(id: string\)/, '(id)')
  const tmp = resolve(root, 'node_modules/.exercises.tmp.mjs')
  writeFileSync(tmp, js)
  const mod = await import(`file://${tmp}?t=${Date.now()}`)
  rmSync(tmp, { force: true })
  return mod.exercises
}

function bySlug() {
  const map = new Map()
  for (const entry of manifest) map.set(entry.slug, entry)
  return map
}

function matchSlug(exercise, catalog) {
  if (OVERRIDES[exercise.id]) return OVERRIDES[exercise.id]
  const candidates = [exercise.nameEn, exercise.nameEs].filter(Boolean).map(norm)
  for (const name of candidates) {
    // Coincidencia exacta contra el nombre del catálogo.
    const exact = catalog.find((c) => norm(c.name) === name)
    if (exact) return exact.slug
  }
  // Coincidencia por tokens: mejor solapamiento, penalizando tokens sobrantes.
  let best = null
  let bestScore = 0
  for (const name of candidates) {
    const tokens = new Set(name.split(' ').filter((t) => t.length > 2))
    if (!tokens.size) continue
    for (const c of catalog) {
      const cTokens = norm(c.name).split(' ').filter((t) => t.length > 2)
      if (!cTokens.length) continue
      const hits = cTokens.filter((t) => tokens.has(t)).length
      if (!hits) continue
      const score = hits / Math.max(tokens.size, cTokens.length)
      if (score > bestScore) {
        bestScore = score
        best = c.slug
      }
    }
  }
  return bestScore >= 0.6 ? best : null
}

async function copyFrames() {
  rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })
  let written = 0
  let bytes = 0
  for (const entry of manifest) {
    for (const index of FRAMES) {
      const frame = entry.frames.find((f) => f.index === index) ?? entry.frames[0]
      const from = resolve(root, PKG, frame.path)
      const to = resolve(OUT_DIR, `${entry.slug}-${index}.png`)
      const buf = await sharp(from)
        .resize(FRAME_SIZE, FRAME_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9, palette: true, colors: 8, effort: 10 })
        .toBuffer()
      writeFileSync(to, buf)
      written++
      bytes += buf.length
    }
  }
  return { written, bytes }
}

function generateModule(slugByExerciseId) {
  const catalogEntries = manifest.map((e) => ({
    slug: e.slug,
    name: e.name,
    equipment: e.equipment,
    // Los de máquina de cardio van a 'cardio' aunque el músculo sea "Legs".
    group: e.equipment === 'Cardio' ? 'cardio' : (MUSCLE_TO_GROUP[e.primaryMuscle] ?? 'core'),
  }))

  const lines = [
    '// GENERADO POR scripts/sync-exercise-frames.mjs — no editar a mano.',
    '//',
    '// Ilustraciones: Workout Guide de Bryl Lim (https://bryllim.github.io/workout-guide/),',
    '// CC BY-SA 4.0, derivadas en parte de Everkinetic (CC BY-SA 4.0).',
    "import type { MuscleGroup } from '../types'",
    '',
    'export interface FrameCatalogEntry {',
    '  slug: string',
    '  /** Nombre en inglés tal cual viene del catálogo. */',
    '  name: string',
    '  equipment: string',
    '  group: MuscleGroup',
    '}',
    '',
    '/** Ejercicios base de la app → slug de ilustración. */',
    'export const exerciseFrameSlug: Record<string, string> = {',
    ...Object.entries(slugByExerciseId).map(([id, slug]) => `  '${id}': '${slug}',`),
    '}',
    '',
    '/** Catálogo completo, usado para adivinar la ilustración de ejercicios creados a mano. */',
    'export const frameCatalog: FrameCatalogEntry[] = [',
    ...catalogEntries.map(
      (e) => `  { slug: '${e.slug}', name: ${JSON.stringify(e.name)}, equipment: '${e.equipment}', group: '${e.group}' },`
    ),
    ']',
    '',
    '/** Los dos frames que copiamos de cada ejercicio (inicio y final del movimiento). */',
    'export const FRAME_INDEXES = [1, 3] as const',
    '',
    'export function frameUrl(slug: string, index: number): string {',
    '  return `${import.meta.env.BASE_URL}exercise-frames/${slug}-${index}.png`',
    '}',
    '',
  ]
  writeFileSync(resolve(root, 'src/data/exerciseFrames.ts'), lines.join('\n'))
}

const exercises = await loadExercises()
const catalog = manifest
const slugByExerciseId = {}
const unmatched = []
for (const ex of exercises) {
  const slug = matchSlug(ex, catalog)
  if (slug && bySlug().has(slug)) slugByExerciseId[ex.id] = slug
  else unmatched.push(`${ex.id} (${ex.nameEs} / ${ex.nameEn ?? '-'})`)
}

const { written, bytes } = await copyFrames()
generateModule(slugByExerciseId)

console.log(`Frames escritos: ${written} (${(bytes / 1024 / 1024).toFixed(1)} MB) en public/exercise-frames/`)
console.log(`Ejercicios base mapeados: ${Object.keys(slugByExerciseId).length}/${exercises.length}`)
if (unmatched.length) console.log(`Sin ilustración:\n  ${unmatched.join('\n  ')}`)
