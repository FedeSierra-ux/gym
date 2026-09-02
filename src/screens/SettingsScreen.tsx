import { useState } from 'react'
import { useStore } from '../store/useStore'
import { exportBackup, readBackupFile, applyBackup } from '../utils/backup'

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const { anthropicApiKey, setAnthropicApiKey, userName, updateUserName, addToast } = useStore()
  const [key, setKey] = useState(anthropicApiKey ?? '')
  const [name, setName] = useState(userName)
  const [saved, setSaved] = useState(false)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [exportando, setExportando] = useState(false)

  const handleSave = () => {
    setAnthropicApiKey(key.trim())
    updateUserName(name.trim() || 'Atleta')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = async () => {
    if (exportando) return
    setExportando(true)
    try {
      const resultado = await exportBackup()
      if (resultado === 'compartido') addToast('Backup listo: guardalo donde quieras', 'success')
      else if (resultado === 'descargado') addToast('Backup descargado', 'success')
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'No se pudo exportar el backup', 'info')
    } finally {
      setExportando(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!pendingImportFile) return
    try {
      const backup = await readBackupFile(pendingImportFile)
      applyBackup(backup)
      window.location.reload()
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'No se pudo importar el backup', 'info')
    } finally {
      setPendingImportFile(null)
    }
  }

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col screen-enter" style={{ background: 'var(--bg)' }}>
      <div className="flex-shrink-0 px-4 safe-top pb-4 border-b border-border flex items-center gap-3">
        <button onClick={onClose} aria-label="Volver" className="text-gray-400 text-2xl leading-none">‹</button>
        <h1 className="text-lg font-bold text-white">Ajustes</h1>
      </div>

      <div className="flex-1 min-h-0 scroll-area px-4 py-4 flex flex-col gap-5">
        {/* Nombre */}
        <div>
          <p className="section-label mb-2">Tu nombre</p>
          <input
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        {/* Anthropic API Key */}
        <div>
          <p className="section-label mb-2">API Key de Anthropic</p>
          <p className="text-xs text-gray-500 mb-3">
            Necesaria para las sugerencias de IA personalizadas. Se guarda solo en tu dispositivo.{' '}
            <span className="text-primary">Conseguí tu key en console.anthropic.com</span>
          </p>
          <input
            type="password"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm font-mono"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-..."
          />
          {key && (
            <p className="text-xs text-primary mt-1.5">
              {key.startsWith('sk-ant-') ? '✓ Formato correcto' : '⚠ Debería empezar con sk-ant-'}
            </p>
          )}
        </div>

        {/* Info sobre qué hace la IA */}
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-white mb-2">¿Para qué usa la IA?</p>
          <ul className="flex flex-col gap-1.5">
            {[
              'Analiza tu progreso al terminar un entreno y te da un consejo personalizado',
              'Sugiere qué ejercicio agregar a una rutina para balancearla mejor',
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-400">
                <span className="text-primary flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          {!key && (
            <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-border">
              Sin API key, la app usa sugerencias algorítmicas basadas en tu historial.
            </p>
          )}
        </div>

        {/* Backup */}
        <div>
          <p className="section-label mb-2">Backup de datos</p>
          <p className="text-xs text-gray-500 mb-3">
            Tus rutinas, entrenos y récords viven solo en este dispositivo. Si vas a reinstalar la app o cambiar de
            celular, exportá un backup antes para no perderlos.
          </p>
          <p className="text-xs text-gray-600 mb-3">
            En iPhone, Safari borra los datos de un sitio que no usás en ~7 días. Agregando la app a la pantalla de
            inicio (Compartir → Agregar a inicio) eso no pasa, pero igual conviene exportar de vez en cuando.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={exportando}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border text-white bg-surface"
            >
              {exportando ? '⏳ Preparando...' : '⬇️ Exportar'}
            </button>
            {/*
              El input va adentro de un <label>: abrir el selector con un
              .click() sobre un input display:none no funciona en varias
              WebViews de Android, y así lo dispara el navegador solo.
              El accept incluye la extensión y los MIME que usan los
              administradores de archivos, porque con "application/json" a secas
              el .json aparecía en gris y no se podía elegir.
            */}
            <label
              htmlFor="import-backup"
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border text-white bg-surface flex items-center justify-center cursor-pointer"
            >
              ⬆️ Importar
              <input
                id="import-backup"
                type="file"
                accept=".json,application/json,application/octet-stream,text/plain"
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setPendingImportFile(file)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </div>

        {/* Créditos — las ilustraciones son CC BY-SA 4.0 y piden atribución. */}
        <div>
          <p className="section-label mb-2">Créditos</p>
          <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs text-gray-400">
              Ilustraciones de los ejercicios:{' '}
              <a href="https://bryllim.github.io/workout-guide/" target="_blank" rel="noreferrer" className="text-primary">
                Workout Guide
              </a>{' '}
              de Bryl Lim, bajo{' '}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="text-primary">
                CC BY-SA 4.0
              </a>
              . Parte de los dibujos derivan de{' '}
              <a href="https://github.com/everkinetic/data" target="_blank" rel="noreferrer" className="text-primary">
                Everkinetic
              </a>{' '}
              (CC BY-SA 4.0).
            </p>
            <p className="text-xs text-gray-600">
              Cambios respecto del original: se redimensionaron a 256 px y se recomprimieron para que la app funcione
              sin conexión.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            saved ? 'bg-primary/20 text-primary border border-primary/30' : 'btn-primary-glow text-black'
          }`}
        >
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {pendingImportFile && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-2xl p-6 w-full" style={{ background: '#161821', border: '1px solid rgba(255,255,255,0.12)', maxWidth: 340 }}>
            <h3 className="font-bold text-white text-lg mb-2">¿Importar este backup?</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Esto reemplaza <strong className="text-white">todos</strong> tus datos actuales (rutinas, entrenos, récords) por los del archivo. No se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingImportFile(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', background: 'none' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImport}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ border: 'none', background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
              >
                Reemplazar datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
