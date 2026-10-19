import { useEffect, useState, type ReactNode } from 'react'
import { Dialog } from '../components/Dialog'
import { useStore } from '../store/useStore'
import { exportBackup, readBackupFile, applyBackup, hasPreviousBackup, restorePreviousBackup } from '../utils/backup'
import { MILE_ROUTINE_IDS } from '../data/mileRoutines'
import { plannedDowSet } from '../utils/trainingDays'
import { semanaActual, SEMANAS_PROGRAMA } from '../utils/program'
import { useHoy } from '../utils/useHoy'
import { R, S, T, ROW, SP } from '../theme'
import { estadoAlmacenamiento, pedirAlmacenamientoPersistente, type EstadoAlmacenamiento } from '../utils/persistentStorage'

/** Si el navegador puede borrar los datos por su cuenta o no. */
function EstadoProteccion() {
  const [estado, setEstado] = useState<EstadoAlmacenamiento | null>(null)
  useEffect(() => { void estadoAlmacenamiento().then(setEstado) }, [])
  if (estado === null || estado === 'no-soportado') return null
  const ok = estado === 'protegido'
  return (
    <div
      className="rounded-xl px-3 py-2.5 flex items-start gap-2"
      style={{ marginTop: SP[3], background: ok ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${ok ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}` }}
    >
      <span aria-hidden="true">{ok ? '🔒' : '⚠️'}</span>
      <div className="flex-1">
        <p className="text-xs font-semibold" style={{ color: ok ? S.good : S.bad }}>
          {ok ? 'Datos protegidos' : 'Datos sin proteger'}
        </p>
        <p className="text-micro text-dim mt-0.5">
          {ok
            ? 'El navegador no los va a borrar por su cuenta. Igual conviene exportar de vez en cuando.'
            : 'El navegador podría borrarlos si le falta espacio. Instalá la app en la pantalla de inicio y exportá un backup.'}
        </p>
        {!ok && (
          <button
            onClick={() => { void pedirAlmacenamientoPersistente().then(setEstado) }}
            className="mt-2 text-xs font-semibold underline"
            style={{ color: S.ink, background: 'none', border: 'none', padding: 0, cursor: 'pointer', minHeight: ROW.compact }}
          >
            Pedir protección de nuevo
          </button>
        )}
      </div>
    </div>
  )
}

const tarjeta = { background: S.surf, border: `1px solid ${S.line2}`, borderRadius: R.lg } as const

/**
 * Un grupo de Ajustes: ícono, título y subtítulo. Con `onToggle` el
 * encabezado es un botón que lo despliega (lo secundario arranca cerrado para
 * que el backup quede a la vista sin scrollear).
 */
function Grupo({ icono, titulo, subtitulo, abierto, onToggle, children, borde }: {
  icono: string; titulo: string; subtitulo: ReactNode; abierto?: boolean; onToggle?: () => void; children?: ReactNode; borde?: string
}) {
  const cabecera = (
    <>
      <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: R.sm + 2, flexShrink: 0, background: S.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: T.title }}>{icono}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: T.bodyLg, fontWeight: 700, color: S.ink }}>{titulo}</span>
        <span style={{ display: 'block', fontSize: T.caption, color: S.dim, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitulo}</span>
      </span>
    </>
  )
  return (
    <section aria-label={titulo} style={{ ...tarjeta, borderColor: borde ?? S.line2, padding: onToggle ? `${SP[2]}px ${SP[2]}px ${SP[2]}px ${SP[4]}px` : `${SP[4]}px ${SP[4]}px` }}>
      {onToggle ? (
        <button
          onClick={onToggle}
          aria-expanded={abierto}
          style={{ display: 'flex', alignItems: 'center', gap: SP[3], width: '100%', minHeight: ROW.compact, background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: 'inherit' }}
        >
          {cabecera}
          <span aria-hidden="true" style={{ width: ROW.compact, height: ROW.compact, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.dim, fontSize: T.h2, transform: abierto ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: SP[3] }}>{cabecera}</div>
      )}
      {(!onToggle || abierto) && <div style={{ paddingRight: onToggle ? SP[2] : 0, paddingBottom: onToggle ? SP[2] : 0 }}>{children}</div>}
    </section>
  )
}

const etiqueta = { display: 'block', fontSize: T.micro, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.mute } as const
const campo = {
  width: '100%', minHeight: ROW.compact, padding: `0 ${SP[4]}px`, borderRadius: R.md, marginTop: 6,
  background: S.surf2, border: `1px solid ${S.line2}`, color: S.ink, fontSize: 16,
} as const

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const {
    anthropicApiKey, setAnthropicApiKey, userName, updateUserName, addToast,
    routines, installMileRoutines, weekPlan, weeklyGoal, setWeeklyGoal, markBackupDone,
    programa, retomarPrograma, workouts, lastBackupAt,
  } = useStore()
  const nowTs = useHoy()
  const [hayCopiaPrevia] = useState(hasPreviousBackup)
  const [confirmarRestaurar, setConfirmarRestaurar] = useState(false)
  const [key, setKey] = useState(anthropicApiKey ?? '')
  const [name, setName] = useState(userName)
  const [saved, setSaved] = useState(false)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [exportando, setExportando] = useState(false)
  // Guardia contra el doble toque en "Reemplazar datos": el segundo applyBackup
  // pisaba la copia previa con el import recién aplicado.
  const [importando, setImportando] = useState(false)
  const [verIA, setVerIA] = useState(false)
  const [verPlan, setVerPlan] = useState(false)
  const [verCreditos, setVerCreditos] = useState(false)

  const hayCambios = name.trim() !== userName || key.trim() !== (anthropicApiKey ?? '')

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
      if (resultado !== 'cancelado') markBackupDone()
      if (resultado === 'compartido') addToast('Backup listo: guardalo donde quieras', 'success')
      else if (resultado === 'descargado') addToast('Backup descargado', 'success')
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'No se pudo exportar el backup', 'info')
    } finally {
      setExportando(false)
    }
  }

  // El plan de Mile se instala una sola vez: vive acá y no en Mis Rutinas,
  // que es una pantalla de uso diario.
  const mileFaltantes = MILE_ROUTINE_IDS.filter(id => !routines.some(r => r.id === id)).length
  const diasDelPlan = plannedDowSet(weekPlan, routines.map(r => r.id)).size
  // El domingo se habla de la semana que arranca mañana, como en Inicio.
  // Misma regla del domingo que Inicio y el store (`semanaActual`).
  const semanaPlan = programa && !programa.terminado ? semanaActual(programa, nowTs) : null

  const handleInstallMile = () => {
    const n = installMileRoutines()
    if (n === 0) addToast('Ya tenías todas las rutinas del plan', 'info')
    else addToast(n === 1 ? 'Se agregó 1 rutina del plan' : `Se agregaron ${n} rutinas del plan`, 'success')
  }

  const handleConfirmImport = async () => {
    if (!pendingImportFile || importando) return
    setImportando(true)
    try {
      const backup = await readBackupFile(pendingImportFile)
      applyBackup(backup)
      window.location.reload()
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'No se pudo importar el backup', 'info')
      setPendingImportFile(null)
      setImportando(false)
    }
  }

  // Estado del backup: cuántos entrenos hay y cuándo fue la última copia.
  const entrenos = workouts.filter(w => w.finishedAt).length
  const diasDesdeCopia = lastBackupAt != null ? Math.floor((nowTs - lastBackupAt) / 86400000) : null
  const estadoBackup = diasDesdeCopia == null
    ? 'sin copia todavía'
    : diasDesdeCopia === 0 ? 'última copia hoy' : diasDesdeCopia === 1 ? 'última copia ayer' : `última copia hace ${diasDesdeCopia} días`

  const descripcionPlan = semanaPlan != null && semanaPlan >= 1 && semanaPlan <= SEMANAS_PROGRAMA
    ? `Semana ${semanaPlan} de ${SEMANAS_PROGRAMA}`
    : programa?.terminado ? 'Plan terminado · retomar'
    : mileFaltantes === 0 ? 'Rutinas cargadas' : 'Las 3 rutinas y su semana tipo'

  return (
    <Dialog label="Ajustes" onClose={onClose} className="absolute inset-0 z-50 flex flex-col screen-enter" style={{ background: S.bg }}>
      <div className="flex-shrink-0 safe-top border-b border-border flex items-center gap-3" style={{ padding: `max(48px, calc(env(safe-area-inset-top, 0px) + 12px)) ${SP[4]}px ${SP[3]}px` }}>
        <button
          onClick={onClose}
          aria-label="Volver"
          style={{ width: ROW.compact, height: ROW.compact, borderRadius: R.md, flexShrink: 0, background: S.surf2, border: `1px solid ${S.line2}`, color: S.ink, fontSize: T.h2, cursor: 'pointer', lineHeight: 1 }}
        >
          ‹
        </button>
        <h1 style={{ fontSize: T.h2, fontWeight: 700, color: S.ink }}>Ajustes</h1>
      </div>

      <div className="flex-1 min-h-0 scroll-area" style={{ padding: `${SP[3]}px ${SP[4]}px ${SP[6]}px`, display: 'flex', flexDirection: 'column', gap: SP[3] }}>
        {/* Vos: nombre y meta semanal */}
        <Grupo icono="👤" titulo="Vos" subtitulo="Tu nombre y tu meta semanal">
          <label htmlFor="ajustes-nombre" style={{ ...etiqueta, marginTop: SP[4] }}>Nombre</label>
          <input
            id="ajustes-nombre"
            style={campo}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre"
            maxLength={24}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: SP[2], marginTop: SP[4] }}>
            <span id="ajustes-meta" style={etiqueta}>Días por semana</span>
            <span style={{ fontSize: T.caption, color: S.dim, whiteSpace: 'nowrap' }}>Inicio mide la semana contra esto</span>
          </div>
          <div role="group" aria-labelledby="ajustes-meta" style={{ display: 'flex', gap: SP[2], marginTop: 6 }}>
            {[null, 2, 3, 4, 5, 6].map((n) => {
              const activo = weeklyGoal === n
              const auto = n === null
              return (
                <button
                  key={String(n)}
                  onClick={() => setWeeklyGoal(n)}
                  aria-pressed={activo}
                  className={auto ? undefined : 'num'}
                  style={{
                    flex: 1, minHeight: ROW.compact, borderRadius: R.md, fontSize: T.bodyLg, fontWeight: 700, cursor: 'pointer',
                    border: `1px solid ${activo ? S.acc : S.line2}`,
                    background: activo ? S.acc : S.surf2,
                    color: activo ? S.onAcc : S.ink,
                  }}
                >
                  {auto ? 'Auto' : n}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize: T.caption, color: S.dim, marginTop: SP[2] }}>
            {weeklyGoal === null
              ? diasDelPlan > 0
                ? `Auto = ${diasDelPlan}, los días de tu semana tipo.`
                : 'Auto = 3 hasta que armes tu semana tipo en Agenda.'
              : `${weeklyGoal} entrenos por semana.`}
          </p>
        </Grupo>

        {/* Backup: segundo, porque es lo único que protege los datos */}
        <Grupo
          icono="💾"
          titulo="Backup"
          borde="rgba(56,189,248,0.25)"
          subtitulo={<><span className="num">{entrenos}</span> {entrenos === 1 ? 'entreno' : 'entrenos'} · {estadoBackup}</>}
        >
          <p style={{ fontSize: T.caption, color: S.dim, marginTop: SP[3], lineHeight: 1.45 }}>
            Todo vive en este teléfono. Si lo cambiás, reinstalás la app o borrás el navegador, exportá un backup antes para no perder rutinas, entrenos y récords.
          </p>
          <EstadoProteccion />
          <p style={{ fontSize: T.micro, color: S.mute, marginTop: SP[3], lineHeight: 1.45 }}>
            En iPhone, Safari borra los datos de un sitio que no usás en ~7 días. Agregando la app a la pantalla de
            inicio (Compartir → Agregar a inicio) eso no pasa, pero igual conviene exportar de vez en cuando.
          </p>
          <div style={{ display: 'flex', gap: SP[2], marginTop: SP[3] }}>
            <button className="btn-primary" onClick={handleExport} disabled={exportando} style={{ flex: 1 }}>
              {exportando ? 'Preparando…' : <><span aria-hidden="true">⬇️</span> Exportar</>}
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
              className="btn-secondary"
              aria-disabled={importando}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              <span aria-hidden="true">⬆️</span> Importar
              <input
                id="import-backup"
                type="file"
                disabled={importando}
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
          {hayCopiaPrevia && (
            <button className="btn-ghost" onClick={() => setConfirmarRestaurar(true)} style={{ width: '100%', marginTop: SP[1], fontSize: T.body }}>
              ↩️ Volver a los datos de antes del último import
            </button>
          )}
        </Grupo>

        {/* IA: colapsado, es opcional */}
        <Grupo
          icono="✨"
          titulo="IA (opcional)"
          subtitulo={`API key de Anthropic · ${anthropicApiKey ? 'configurada' : 'sin configurar'}`}
          abierto={verIA}
          onToggle={() => setVerIA(v => !v)}
        >
          <p style={{ fontSize: T.caption, color: S.dim, marginTop: SP[2], lineHeight: 1.45 }}>
            Necesaria para las sugerencias de IA personalizadas. Se guarda solo en tu dispositivo.{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Conseguí tu key en console.anthropic.com
            </a>
          </p>
          <label htmlFor="ajustes-api-key" style={{ ...etiqueta, marginTop: SP[3] }}>API key</label>
          <input
            id="ajustes-api-key"
            type="password"
            className="font-mono"
            style={campo}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-..."
          />
          {key && (
            <p className="text-xs text-primary mt-1.5">
              {key.startsWith('sk-ant-') ? '✓ Formato correcto' : '⚠ Debería empezar con sk-ant-'}
            </p>
          )}
          <p style={{ fontSize: T.body, fontWeight: 600, color: S.ink, marginTop: SP[4] }}>¿Para qué usa la IA?</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: SP[2] }}>
            {[
              'Analiza tu progreso al terminar un entreno y te da un consejo personalizado',
              'Sugiere qué ejercicio agregar a una rutina para balancearla mejor',
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-dim">
                <span className="text-primary flex-shrink-0" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
          {!key && (
            <p style={{ fontSize: T.caption, color: S.mute, marginTop: SP[3] }}>
              Sin API key, la app usa sugerencias algorítmicas basadas en tu historial.
            </p>
          )}
        </Grupo>

        {/* Plan de Mile: colapsado */}
        <Grupo
          icono="📋"
          titulo="Plan de Mile"
          subtitulo={descripcionPlan}
          abierto={verPlan}
          onToggle={() => setVerPlan(v => !v)}
        >
          <p style={{ fontSize: T.caption, color: S.dim, marginTop: SP[2], lineHeight: 1.45 }}>
            Las 3 rutinas del plan (piernas, brazos y full body) con su semana tipo. Se cargan una sola vez; si ya las
            tenés, no se duplican.
          </p>
          <button
            onClick={handleInstallMile}
            disabled={mileFaltantes === 0}
            className="btn-secondary"
            style={{ width: '100%', marginTop: SP[3], fontSize: T.body, color: mileFaltantes === 0 ? S.dim : S.acc, borderColor: mileFaltantes === 0 ? S.line2 : 'rgba(232,99,74,0.35)' }}
          >
            {mileFaltantes === 0
              ? '✓ El plan ya está cargado'
              : `Cargar plan de Mile (${mileFaltantes} rutina${mileFaltantes === 1 ? '' : 's'})`}
          </button>
          {programa?.terminado && (
            <button
              onClick={() => { retomarPrograma(); addToast('En Inicio elegí en qué semana del plan estás', 'info') }}
              className="btn-secondary"
              style={{ width: '100%', marginTop: SP[2], fontSize: T.body }}
            >
              Retomar el plan por semanas
            </button>
          )}
        </Grupo>

        {/* Créditos — las ilustraciones son CC BY-SA 4.0 y piden atribución. */}
        <Grupo
          icono="🖼️"
          titulo="Créditos"
          subtitulo="Ilustraciones y figuras de los músculos"
          abierto={verCreditos}
          onToggle={() => setVerCreditos(v => !v)}
        >
          <div className="flex flex-col gap-2" style={{ marginTop: SP[2] }}>
            <p className="text-xs text-dim">
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
            <p className="text-xs text-dim">
              Figuras de los músculos:{' '}
              <a href="https://github.com/HichamELBSI/react-native-body-highlighter" target="_blank" rel="noreferrer" className="text-primary">
                react-native-body-highlighter
              </a>{' '}
              (licencia MIT), recortadas y encuadradas para cada grupo.
            </p>
            <p className="text-xs text-mute">
              Cambios respecto del original: se redimensionaron a 256 px y se recomprimieron para que la app funcione
              sin conexión.
            </p>
          </div>
        </Grupo>

        {/* Guardar: aparece cuando el nombre o la key cambiaron */}
        {(hayCambios || saved) && (
          <button
            onClick={handleSave}
            className={saved ? undefined : 'btn-primary'}
            style={{
              width: '100%', minHeight: ROW.regular, borderRadius: R.lg, fontWeight: 700, fontSize: T.bodyLg, cursor: 'pointer',
              ...(saved ? { background: 'rgba(232,99,74,0.2)', color: S.acc, border: '1px solid rgba(232,99,74,0.3)' } : {}),
            }}
          >
            {saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        )}
      </div>

      {confirmarRestaurar && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <Dialog label="Volver a los datos anteriores" onClose={() => setConfirmarRestaurar(false)} className="rounded-2xl p-6 w-full" style={{ background: S.surf, border: `1px solid ${S.line2}`, maxWidth: 340 }}>
            <h3 className="font-bold text-ink text-lg mb-2">¿Volver a los datos anteriores?</h3>
            <p className="text-sm mb-5" style={{ color: S.dim }}>
              Se descarta lo importado y vuelven los datos que tenías justo antes del último import.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarRestaurar(false)}
                className="btn-secondary"
                style={{ flex: 1, fontSize: T.body }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { if (restorePreviousBackup()) window.location.reload() }}
                className="flex-1 rounded-xl text-sm font-bold"
                style={{ minHeight: ROW.compact, border: 'none', background: 'rgba(248,113,113,0.15)', color: S.bad, cursor: 'pointer' }}
              >
                Volver atrás
              </button>
            </div>
          </Dialog>
        </div>
      )}

      {pendingImportFile && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <Dialog label="Importar backup" onClose={() => { if (!importando) setPendingImportFile(null) }} className="rounded-2xl p-6 w-full" style={{ background: S.surf, border: `1px solid ${S.line2}`, maxWidth: 340 }}>
            <h3 className="font-bold text-ink text-lg mb-2">¿Importar este backup?</h3>
            <p className="text-sm mb-5" style={{ color: S.dim }}>
              Esto reemplaza <strong className="text-ink">todos</strong> tus datos actuales (rutinas, entrenos, récords) por los del archivo. Se guarda una copia de lo que tenés ahora para poder volver atrás desde acá.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingImportFile(null)}
                disabled={importando}
                className="btn-secondary"
                style={{ flex: 1, fontSize: T.body }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importando}
                className="flex-1 rounded-xl text-sm font-bold"
                style={{ minHeight: ROW.compact, border: 'none', background: 'rgba(248,113,113,0.15)', color: S.bad, cursor: 'pointer' }}
              >
                {importando ? 'Importando…' : 'Reemplazar datos'}
              </button>
            </div>
          </Dialog>
        </div>
      )}
    </Dialog>
  )
}
