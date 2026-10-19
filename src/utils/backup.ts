// Manual backup/restore of the app's persisted data (routines, workouts, PRs,
// etc). Everything lives in localStorage tied to the browser/app origin, so
// reinstalling the Android app (or clearing site data) wipes it — this lets
// the user save a copy and bring it back.
import { migrarEstado, serializarParaBackup, STORAGE_KEY, STORAGE_VERSION } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { toDateInputValue } from './dates'
import { pausarEscrituras, reanudarEscrituras } from './safeStorage'

/** Copia de lo que había antes del último import, para poder volver atrás. */
export const PREVIOUS_KEY = 'gympro-storage-v2-previo'

interface BackupFile {
  app: 'gympro'
  exportedAt: number
  data: string
}

export type ExportResult = 'compartido' | 'descargado' | 'cancelado'

function backupFileName(): string {
  // Fecha local: con toISOString, después de las 21 h en Argentina salía la de mañana.
  return `gympro-backup-${toDateInputValue(Date.now())}.json`
}

function isAbortError(e: unknown): boolean {
  return e instanceof Error && (e.name === 'AbortError' || e.name === 'NotAllowedError')
}

/**
 * Descarga clásica con un <a download>. Anda en el navegador de escritorio y
 * en Chrome mobile con la pestaña normal, pero no siempre en una PWA
 * instalada; por eso es el plan B.
 */
function downloadFile(contenido: string, nombre: string): void {
  const blob = new Blob([contenido], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revocar en el mismo tick cancelaba la descarga en Android antes de que
  // llegara a arrancar: la URL se libera un rato después.
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/**
 * Exporta el backup. Primero intenta la hoja de compartir del sistema, que es
 * lo único que funciona de forma confiable en una app instalada (en modo
 * standalone Android y iOS esconden o bloquean las descargas del navegador), y
 * si no está disponible cae en la descarga común.
 */
export async function exportBackup(): Promise<ExportResult> {
  // Sale de lo que está en memoria y no de lo escrito en el teléfono: si el
  // almacenamiento se llenó, lo último que se hizo sólo está en memoria.
  return compartirOBajar(serializarParaBackup())
}

/**
 * El volcado tal como está guardado, sin pasar por el store. Es la salida de
 * emergencia cuando la app no puede arrancar.
 */
export async function exportRawBackup(): Promise<ExportResult> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) throw new Error('No hay datos para exportar todavía')
  return compartirOBajar(sinApiKey(raw))
}

/**
 * Saca la API key del volcado crudo: el backup normal nunca la lleva (ver
 * serializarParaBackup) y el de emergencia tampoco tiene por qué. Si el volcado
 * no se puede parsear se exporta tal cual: es justo el caso en que más vale
 * rescatar lo que haya.
 */
export function sinApiKey(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!esObjeto(parsed) || !esObjeto(parsed.state) || !('anthropicApiKey' in parsed.state)) return raw
    const { anthropicApiKey: _key, ...state } = parsed.state
    void _key
    return JSON.stringify({ ...parsed, state })
  } catch {
    return raw
  }
}

async function compartirOBajar(raw: string): Promise<ExportResult> {
  const backup: BackupFile = { app: 'gympro', exportedAt: Date.now(), data: raw }
  const contenido = JSON.stringify(backup, null, 2)
  const nombre = backupFileName()

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const file = new File([contenido], nombre, { type: 'application/json' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Backup de GymPro' })
        return 'compartido'
      }
    } catch (e) {
      // Si el usuario cerró la hoja de compartir no hay que descargar nada.
      if (isAbortError(e)) return 'cancelado'
      // Cualquier otro error (share no soportado para archivos, etc.) cae en
      // la descarga de abajo.
    }
  }

  downloadFile(contenido, nombre)
  return 'descargado'
}

/** Lee el texto del archivo, con FileReader de respaldo para WebViews viejas. */
async function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    try {
      return await file.text()
    } catch {
      // sigue con FileReader
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsText(file)
  })
}

/** Valida el contenido de un backup (venga de un archivo o pegado a mano). */
export function parseBackup(texto: string): BackupFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(texto)
  } catch {
    throw new Error('El archivo no es un backup válido de GymPro')
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('El archivo no es un backup válido de GymPro')
  }

  const candidato = parsed as Record<string, unknown>

  // Formato normal: { app: 'gympro', data: '<json de zustand>' }
  if (candidato.app === 'gympro' && typeof candidato.data === 'string') {
    const inner = safeParse(candidato.data)
    if (!inner) throw new Error('El archivo no es un backup válido de GymPro')
    return {
      app: 'gympro',
      exportedAt: typeof candidato.exportedAt === 'number' ? candidato.exportedAt : Date.now(),
      data: normalizarDatos(inner),
    }
  }

  // Tolerancia: también aceptamos el volcado crudo de localStorage
  // ({ state: {...}, version: n }), que es lo que se copia desde el navegador.
  if ('state' in candidato) {
    return { app: 'gympro', exportedAt: Date.now(), data: normalizarDatos(candidato) }
  }

  throw new Error('El archivo no es un backup válido de GymPro')
}

const esObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const esNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const esTexto = (v: unknown): v is string => typeof v === 'string'
/** Un número que puede no venir (undefined o null), pero si viene tiene que ser número. */
const esNumeroOpcional = (v: unknown): boolean => v == null || esNumero(v)
const esCantidad = (v: unknown): boolean => esNumero(v) && v >= 0

/** Una serie guardada: kilos y reps numéricos (0 vale: peso corporal, o una serie por tiempo). */
function esSerie(s: unknown): boolean {
  return esObjeto(s) && esCantidad(s.kg) && esCantidad(s.reps)
    && esNumeroOpcional(s.completedAt)
    && (s.durationSec == null || esCantidad(s.durationSec))
}

function esEntreno(w: unknown): boolean {
  return esObjeto(w) && esTexto(w.id) && esNumero(w.startedAt) && w.startedAt > 0
    && esNumeroOpcional(w.finishedAt) && Array.isArray(w.exercises)
    && w.exercises.every((e) => esObjeto(e) && esTexto(e.exerciseId) && Array.isArray(e.sets) && e.sets.every(esSerie))
}

function esEjercicioDeRutina(e: unknown): boolean {
  return esObjeto(e) && esTexto(e.exerciseId) && esNumero(e.sets) && esNumero(e.repsMin) && esNumero(e.repsMax)
}

function esRutina(r: unknown): boolean {
  return esObjeto(r) && esTexto(r.id) && esTexto(r.name) && esTexto(r.emoji)
    && Array.isArray(r.exercises) && r.exercises.every(esEjercicioDeRutina)
}

function esEjercicioPropio(e: unknown): boolean {
  return esObjeto(e) && esTexto(e.id) && esTexto(e.nameEs) && esTexto(e.muscleGroup) && e.muscleGroup in muscleGroupConfig
}

function esMedida(m: unknown): boolean {
  return esObjeto(m) && esTexto(m.id) && esNumero(m.date)
}

/** Se queda con las entradas del objeto que pasan el filtro; las demás se olvidan. */
function filtrarEntradas(obj: unknown, ok: (v: unknown) => boolean): Record<string, unknown> | undefined {
  if (!esObjeto(obj)) return undefined
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => ok(v)))
}

/**
 * Revisa que el estado tenga la forma mínima con la que la app puede arrancar
 * y lo lleva a la versión actual. Antes alcanzaba con que tuviera una clave
 * `state`: un archivo con `workouts: null` pisaba los datos y dejaba la app en
 * blanco en cada arranque, y el volcado del entreno en curso (otra clave)
 * borraba todo el historial.
 *
 * Mira adentro de cada lista, no sólo el primer nivel: `sets: [null]` o
 * `kg: 'abc'` pasaban, y al rehidratar el cálculo de récords reventaba fuera
 * de cualquier pantalla, con la app en la pantalla de error en cada arranque.
 * Lo que es dato del usuario y viene roto (un entreno, una rutina, un
 * ejercicio propio, una medida) rechaza el archivo entero: importar la mitad
 * sería perder cosas sin avisar. Lo que es accesorio y se puede rehacer (un
 * tip, el nombre de una rutina borrada, un récord, que se recalculan solos)
 * se descarta y el import sigue.
 */
function normalizarDatos(inner: Record<string, unknown>): string {
  const invalido = 'El archivo no es un backup válido de GymPro'
  if (!esObjeto(inner.state)) throw new Error(invalido)
  const version = inner.version === undefined ? 0 : inner.version
  if (!esNumero(version)) throw new Error(invalido)
  if (version > STORAGE_VERSION) {
    throw new Error('El backup es de una versión más nueva de la app: actualizala antes de importarlo')
  }
  const state = migrarEstado(inner.state, version)

  if (!Array.isArray(state.routines) && !Array.isArray(state.workouts)) throw new Error(invalido)
  const listas = ['routines', 'workouts', 'prs', 'measures', 'customExercises', 'ciclosPrograma'] as const
  for (const k of listas) {
    if (state[k] !== undefined && !Array.isArray(state[k])) throw new Error(invalido)
  }
  for (const k of ['weekPlan', 'weekOverrides', 'exerciseTips', 'archivedRoutineNames'] as const) {
    if (state[k] !== undefined && state[k] !== null && !esObjeto(state[k])) throw new Error(invalido)
  }
  if (state.inicioUso != null && !esNumero(state.inicioUso)) throw new Error(invalido)
  // Qué tarjetas de Inicio ya se cerraron: si vienen mal, se olvidan (vuelven a aparecer) en vez de rechazar el backup.
  if (state.resumenMesCerrado != null && typeof state.resumenMesCerrado !== 'string') delete state.resumenMesCerrado
  if (state.wrappedCerrado != null && !esNumero(state.wrappedCerrado)) delete state.wrappedCerrado
  const ciclosOk = ((state.ciclosPrograma ?? []) as unknown[]).every((c) => esObjeto(c) && esNumero(c.inicio) && esNumero(c.fin))
  if (!ciclosOk) throw new Error(invalido)
  // Un plan por semanas roto se olvida: la tarjeta vuelve a preguntar en qué semana estás.
  if (state.programa != null && !(esObjeto(state.programa) && esNumero(state.programa.inicio) && (state.programa.fase === 'base' || state.programa.fase === 'alt'))) {
    delete state.programa
  }

  const entrenosOk = ((state.workouts ?? []) as unknown[]).every(esEntreno)
  const rutinasOk = ((state.routines ?? []) as unknown[]).every(esRutina)
  if (!entrenosOk || !rutinasOk) throw new Error('El backup tiene entrenos o rutinas dañados: no se importó nada')
  if (!((state.customExercises ?? []) as unknown[]).every(esEjercicioPropio)) {
    throw new Error('El backup tiene ejercicios propios dañados: no se importó nada')
  }
  if (!((state.measures ?? []) as unknown[]).every(esMedida)) {
    throw new Error('El backup tiene medidas dañadas: no se importó nada')
  }

  // Lo accesorio: se queda lo que sirve y lo demás se descarta.
  if (state.prs !== undefined) {
    state.prs = (state.prs as unknown[]).filter((p) => esObjeto(p) && esTexto(p.exerciseId) && esNumero(p.kg) && esNumero(p.reps))
  }
  if (state.exerciseTips != null) state.exerciseTips = filtrarEntradas(state.exerciseTips, esTexto)
  if (state.archivedRoutineNames != null) {
    state.archivedRoutineNames = filtrarEntradas(state.archivedRoutineNames, (v) => esObjeto(v) && esTexto(v.name) && esTexto(v.emoji))
  }

  return JSON.stringify({ state, version: STORAGE_VERSION })
}

function safeParse(texto: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(texto)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export async function readBackupFile(file: File): Promise<BackupFile> {
  return parseBackup(await readFileText(file))
}

/**
 * Escribe el backup en lugar de los datos actuales. Antes guarda una copia de
 * lo que había, y corta las escrituras del store hasta la recarga: si no, un
 * aviso que se cerraba en el medio volvía a guardar el estado viejo encima.
 */
export function applyBackup(backup: BackupFile): void {
  const parsed = JSON.parse(backup.data) as { state: Record<string, unknown>; version: number }
  // El archivo se generó justo antes de marcar el backup como hecho: lleva la
  // fecha del anterior. La de exportación es la que vale.
  parsed.state.lastBackupAt = backup.exportedAt
  const nuevo = JSON.stringify(parsed)

  const actual = localStorage.getItem(STORAGE_KEY)
  // Si lo guardado ya es este mismo import (un segundo toque en "Reemplazar
  // datos"), la copia de antes se deja como está: pisarla con el import era
  // perder para siempre lo que había antes.
  if (actual && actual !== nuevo) {
    try {
      localStorage.setItem(PREVIOUS_KEY, actual)
    } catch {
      // Sin lugar para la copia: se importa igual, que es lo que se pidió.
    }
  }
  pausarEscrituras()
  try {
    localStorage.setItem(STORAGE_KEY, nuevo)
  } catch (e) {
    reanudarEscrituras()
    throw new Error(e instanceof Error && e.name === 'QuotaExceededError'
      ? 'No hay espacio en el teléfono para importar el backup'
      : 'No se pudo importar el backup', { cause: e })
  }
}

/** Vuelve a los datos que había antes del último import. */
export function restorePreviousBackup(): boolean {
  const previo = localStorage.getItem(PREVIOUS_KEY)
  if (!previo) return false
  pausarEscrituras()
  localStorage.setItem(STORAGE_KEY, previo)
  localStorage.removeItem(PREVIOUS_KEY)
  return true
}

export function hasPreviousBackup(): boolean {
  try {
    return localStorage.getItem(PREVIOUS_KEY) != null
  } catch {
    return false
  }
}
