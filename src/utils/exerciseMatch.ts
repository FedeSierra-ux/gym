import type { Exercise, ExerciseEquipment, MuscleGroup } from '../types'
import { exerciseFrameSlug, frameCatalog, type FrameCatalogEntry } from '../data/exerciseFrames'
import { muscleGroupConfig } from '../data/muscleGroups'

/**
 * Traducción mínima castellano → inglés de los términos que aparecen en los
 * nombres de ejercicios. Sirve para que un ejercicio escrito a mano ("press
 * militar con mancuernas") encuentre solo su ilustración y su grupo muscular
 * dentro del catálogo de Workout Guide, que está en inglés.
 */
const ES_EN: Record<string, string[]> = {
  // Patrones de empuje
  press: ['press'],
  banca: ['bench', 'press'],
  banco: ['bench'],
  pecho: ['chest'],
  pectoral: ['chest'],
  inclinado: ['incline'],
  inclinada: ['incline'],
  declinado: ['decline'],
  declinada: ['decline'],
  plano: ['bench'],
  apertura: ['fly'],
  aperturas: ['fly'],
  cruce: ['cable', 'fly'],
  cruces: ['cable', 'fly'],
  contractora: ['pec', 'deck'],
  flexion: ['push', 'up'],
  flexiones: ['push', 'up'],
  lagartijas: ['push', 'up'],
  fondo: ['dip'],
  fondos: ['dip'],
  paralelas: ['dip'],
  militar: ['overhead', 'press'],
  hombro: ['shoulder'],
  hombros: ['shoulder'],
  // Tirones
  remo: ['row'],
  jalon: ['lat', 'pulldown'],
  jalones: ['lat', 'pulldown'],
  polea: ['cable'],
  dominada: ['pull', 'up'],
  dominadas: ['pull', 'up'],
  pullover: ['straight', 'arm', 'pulldown'],
  dorsal: ['lat'],
  dorsales: ['lat'],
  espalda: ['back'],
  encogimiento: ['shrug'],
  encogimientos: ['shrug'],
  trapecio: ['shrug'],
  trapecios: ['shrug'],
  // Piernas
  sentadilla: ['squat'],
  sentadillas: ['squat'],
  prensa: ['leg', 'press'],
  pierna: ['leg'],
  piernas: ['leg'],
  cuadriceps: ['leg', 'extension'],
  femoral: ['leg', 'curl'],
  femorales: ['leg', 'curl'],
  isquio: ['leg', 'curl'],
  isquios: ['leg', 'curl'],
  isquiotibiales: ['leg', 'curl'],
  zancada: ['lunge'],
  zancadas: ['lunge'],
  estocada: ['lunge'],
  estocadas: ['lunge'],
  bulgara: ['bulgarian', 'split', 'squat'],
  escalon: ['step', 'up'],
  peso: ['deadlift'],
  muerto: ['deadlift'],
  rumano: ['romanian'],
  rumana: ['romanian'],
  pantorrilla: ['calf', 'raise'],
  pantorrillas: ['calf', 'raise'],
  gemelo: ['calf', 'raise'],
  gemelos: ['calf', 'raise'],
  gluteo: ['glute'],
  gluteos: ['glute'],
  puente: ['bridge'],
  patada: ['kickback'],
  patadas: ['kickback'],
  abductor: ['hip', 'abduction'],
  abduccion: ['hip', 'abduction'],
  aductor: ['hip', 'adduction'],
  aduccion: ['hip', 'adduction'],
  cadera: ['hip'],
  // Brazos
  curl: ['curl'],
  biceps: ['bicep', 'curl'],
  martillo: ['hammer', 'curl'],
  predicador: ['preacher', 'curl'],
  scott: ['preacher', 'curl'],
  concentrado: ['concentration', 'curl'],
  triceps: ['tricep'],
  frances: ['skull', 'crusher'],
  arana: ['spider', 'curl'],
  muneca: ['wrist'],
  rompecraneos: ['skull', 'crusher'],
  copa: ['overhead', 'tricep', 'extension'],
  extension: ['extension'],
  extensiones: ['extension'],
  antebrazo: ['wrist', 'curl'],
  antebrazos: ['wrist', 'curl'],
  // Core
  plancha: ['plank'],
  abdominal: ['crunch'],
  abdominales: ['crunch'],
  abdomen: ['crunch'],
  rueda: ['ab', 'wheel'],
  colgante: ['hanging'],
  colgado: ['hanging'],
  ruso: ['russian', 'twist'],
  rusos: ['russian', 'twist'],
  escaladores: ['mountain', 'climber'],
  elevacion: ['raise'],
  elevaciones: ['raise'],
  // Cardio
  cinta: ['running'],
  correr: ['running'],
  trote: ['running'],
  caminar: ['walking'],
  caminando: ['walking'],
  caminata: ['walking'],
  bici: ['cycling'],
  bicicleta: ['cycling'],
  eliptica: ['elliptical'],
  escaladora: ['stair', 'climber'],
  soga: ['jump', 'rope'],
  cuerda: ['jump', 'rope'],
  saltar: ['jump'],
  salto: ['jump'],
  tijera: ['jumping', 'jack'],
  natacion: ['swimming'],
  // Modificadores
  maquina: ['machine'],
  mancuerna: ['dumbbell'],
  mancuernas: ['dumbbell'],
  db: ['dumbbell'],
  barra: ['barbell'],
  smith: ['smith', 'machine'],
  kettlebell: ['kettlebell'],
  rusa: ['kettlebell'],
  banda: ['banded'],
  bandas: ['banded'],
  elastico: ['banded'],
  goma: ['banded'],
  disco: ['plate'],
  sentado: ['seated'],
  sentada: ['seated'],
  acostado: ['lying'],
  tumbado: ['lying'],
  parado: ['standing'],
  pie: ['standing'],
  lateral: ['lateral'],
  laterales: ['lateral'],
  frontal: ['front'],
  frontales: ['front'],
  posterior: ['rear', 'delt'],
  pajaro: ['rear', 'delt', 'fly'],
  pajaros: ['rear', 'delt', 'fly'],
  unilateral: ['single', 'arm'],
  alterno: ['dumbbell'],
  agarre: ['grip'],
  cerrado: ['close', 'grip'],
  ancho: ['wide', 'grip'],
  neutro: ['neutral', 'grip'],
  invertido: ['inverted'],
  inverso: ['reverse'],
  asistida: ['assisted'],
  asistido: ['assisted'],
  lastrada: ['weighted'],
  lastrado: ['weighted'],
  corporal: ['bodyweight'],
  libre: ['bodyweight'],
  pared: ['wall'],
  silla: ['chair'],
  pelota: ['stability', 'ball'],
  cajon: ['box'],
  estiramiento: ['stretch'],
}

/** Palabras que no aportan nada al matching. */
const STOP = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'con', 'en', 'a', 'al', 'para', 'y', 'un', 'una', 'sobre'])

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Formas singulares candidatas: "burpees" → "burpee", "flexiones" → "flexion". */
function singulars(token: string): string[] {
  const out: string[] = []
  if (token.endsWith('s') && token.length > 3) out.push(token.slice(0, -1))
  if (token.endsWith('es') && token.length > 4) out.push(token.slice(0, -2))
  return out
}

function queryTokens(name: string): string[] {
  const raw = normalize(name).split(' ').filter(t => t && !STOP.has(t))
  const out = new Set<string>()
  for (const token of raw) {
    const forms = [token, ...singulars(token)]
    for (const form of forms) {
      ES_EN[form]?.forEach(t => out.add(t))
      // El token original también entra: muchos nombres ya son en inglés
      // ("hip thrust", "face pull", "burpee") o coinciden por raíz.
      out.add(form)
    }
  }
  return [...out]
}

const catalogTokens = new Map<string, string[]>()
function tokensOf(entry: FrameCatalogEntry): string[] {
  let tokens = catalogTokens.get(entry.slug)
  if (!tokens) {
    tokens = normalize(entry.name).split(' ').filter(Boolean)
    catalogTokens.set(entry.slug, tokens)
  }
  return tokens
}

export interface FrameGuess {
  entry: FrameCatalogEntry
  score: number
}

/**
 * Busca en el catálogo la ilustración que mejor describe un nombre escrito a
 * mano. Devuelve null si ninguna coincide con confianza suficiente: preferimos
 * el ícono genérico del grupo muscular antes que una ilustración equivocada.
 */
export function guessFrame(name: string, group?: MuscleGroup): FrameGuess | null {
  const query = queryTokens(name)
  if (!query.length) return null
  const querySet = new Set(query)

  let best: FrameGuess | null = null
  for (const entry of frameCatalog) {
    const tokens = tokensOf(entry)
    if (!tokens.length) continue
    const hits = tokens.filter(t => querySet.has(t)).length
    if (!hits) continue
    // Recompensa cubrir el nombre del catálogo y, en menor medida, el del
    // usuario: así "press banca" gana a "press" suelto sin que un nombre largo
    // arrastre el puntaje al piso.
    let score = (hits / tokens.length) * 0.65 + (hits / query.length) * 0.35
    if (group && entry.group !== group) score -= 0.12
    if (!best || score > best.score) best = { entry, score }
  }

  return best && best.score >= 0.5 ? best : null
}

/** Slug de ilustración de cualquier ejercicio (base, propio o recién creado). */
export function frameSlugFor(exercise: Exercise): string | null {
  if (exercise.frameSlug) return exercise.frameSlug
  const builtIn = exerciseFrameSlug[exercise.id]
  if (builtIn) return builtIn
  // Ejercicios propios creados antes de que existieran las ilustraciones:
  // los resolvemos por nombre al vuelo.
  return guessFrame(exercise.nameEs, exercise.muscleGroup)?.entry.slug ?? null
}

const EQUIPMENT_LABEL: Record<string, { label: string; type: ExerciseEquipment }> = {
  Barbell: { label: 'Barra', type: 'barra' },
  Dumbbell: { label: 'Mancuernas', type: 'mancuernas' },
  Machine: { label: 'Máquina', type: 'maquina' },
  Cable: { label: 'Cable', type: 'cable' },
  Bodyweight: { label: 'Peso corporal', type: 'peso_corporal' },
  Cardio: { label: 'Cardio', type: 'cardio_maquina' },
  Plate: { label: 'Disco', type: 'barra' },
  Kettlebell: { label: 'Kettlebell', type: 'kettlebell' },
  'Pull-up Bar': { label: 'Barra dominadas', type: 'peso_corporal' },
  Bench: { label: 'Banco', type: 'peso_corporal' },
  Wall: { label: 'Pared', type: 'peso_corporal' },
  Chair: { label: 'Silla', type: 'peso_corporal' },
  Doorway: { label: 'Marco de puerta', type: 'peso_corporal' },
  Towel: { label: 'Toalla', type: 'peso_corporal' },
  Box: { label: 'Cajón', type: 'peso_corporal' },
  'Stability Ball': { label: 'Pelota', type: 'peso_corporal' },
  'Resistance Band': { label: 'Banda', type: 'banda' },
}

/** Equipamiento escrito a mano → tipo interno. */
export function inferEquipmentType(equipment: string): ExerciseEquipment {
  const lower = normalize(equipment)
  if (lower.includes('barra') || lower.includes('bar')) return 'barra'
  if (lower.includes('cable') || lower.includes('polea')) return 'cable'
  if (lower.includes('maquin')) return 'maquina'
  if (lower.includes('kettlebell') || lower.includes('pesa rusa')) return 'kettlebell'
  if (lower.includes('banda') || lower.includes('elast')) return 'banda'
  if (lower.includes('cardio') || lower.includes('cinta') || lower.includes('bici')) return 'cardio_maquina'
  if (lower.includes('corporal') || lower.includes('libre') || lower.includes('sin')) return 'peso_corporal'
  return 'mancuernas'
}

export interface DraftExercise {
  group: MuscleGroup
  equipment: string
  equipmentType: ExerciseEquipment
  frameSlug: string | null
  /** Nombre del ejercicio del catálogo que se usó como referencia, si hubo. */
  matchedName: string | null
}

/**
 * Deduce grupo muscular, equipamiento e ilustración a partir del nombre. Es lo
 * que permite crear un ejercicio escribiendo solamente cómo se llama.
 */
export function draftFromName(name: string, groupHint?: MuscleGroup): DraftExercise {
  const guess = guessFrame(name, groupHint)
  const equipment = guess ? EQUIPMENT_LABEL[guess.entry.equipment] : undefined
  return {
    group: groupHint ?? guess?.entry.group ?? 'pecho',
    equipment: equipment?.label ?? 'Libre',
    equipmentType: equipment?.type ?? 'peso_corporal',
    frameSlug: guess?.entry.slug ?? null,
    matchedName: guess?.entry.name ?? null,
  }
}

/** Crea el ejercicio propio a partir de un nombre (y, si el usuario los tocó, grupo/equipo). */
export function buildCustomExercise(
  name: string,
  opts: { group?: MuscleGroup; equipment?: string } = {}
): Exercise {
  const trimmed = name.trim()
  const draft = draftFromName(trimmed, opts.group)
  const equipment = opts.equipment?.trim() || draft.equipment
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nameEs: trimmed,
    muscleGroup: draft.group,
    primaryMuscles: [muscleGroupConfig[draft.group].label],
    equipment,
    equipmentType: opts.equipment ? inferEquipmentType(equipment) : draft.equipmentType,
    frameSlug: draft.frameSlug ?? undefined,
    isCustom: true,
  }
}
