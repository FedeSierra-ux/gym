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

export function exportBackup(): void {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) throw new Error('No hay datos para exportar')
  const backup: BackupFile = { app: 'gympro', exportedAt: Date.now(), data: raw }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gympro-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function readBackupFile(file: File): Promise<BackupFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (parsed?.app !== 'gympro' || typeof parsed.data !== 'string') {
          throw new Error('El archivo no es un backup válido de GymPro')
        }
        // Make sure the payload itself parses as the shape zustand's persist expects.
        const inner = JSON.parse(parsed.data)
        if (!inner || typeof inner !== 'object' || !('state' in inner)) {
          throw new Error('El archivo no es un backup válido de GymPro')
        }
        resolve(parsed as BackupFile)
      } catch (e) {
        reject(e instanceof Error ? e : new Error('No se pudo leer el archivo'))
      }
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsText(file)
  })
}

export function applyBackup(backup: BackupFile): void {
  localStorage.setItem(STORAGE_KEY, backup.data)
}
