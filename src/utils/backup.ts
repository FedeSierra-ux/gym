// Manual backup/restore of the app's persisted data (routines, workouts, PRs,
// etc). Everything lives in localStorage tied to the browser/app origin, so
// reinstalling the Android app (or clearing site data) wipes it — this lets
// the user save a copy and bring it back.
const STORAGE_KEY = 'gympro-storage-v2'

interface BackupFile {
  app: 'gympro'
  exportedAt: number
  data: string
}

export type ExportResult = 'compartido' | 'descargado' | 'cancelado'

function backupFileName(): string {
  return `gympro-backup-${new Date().toISOString().slice(0, 10)}.json`
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
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) throw new Error('No hay datos para exportar todavía')

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
    if (!inner || !('state' in inner)) throw new Error('El archivo no es un backup válido de GymPro')
    return {
      app: 'gympro',
      exportedAt: typeof candidato.exportedAt === 'number' ? candidato.exportedAt : Date.now(),
      data: candidato.data,
    }
  }

  // Tolerancia: también aceptamos el volcado crudo de localStorage
  // ({ state: {...}, version: n }), que es lo que se copia desde el navegador.
  if ('state' in candidato) {
    return { app: 'gympro', exportedAt: Date.now(), data: texto }
  }

  throw new Error('El archivo no es un backup válido de GymPro')
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

export function applyBackup(backup: BackupFile): void {
  localStorage.setItem(STORAGE_KEY, backup.data)
}
