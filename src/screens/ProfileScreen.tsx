import { useMemo, useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { SettingsScreen } from './SettingsScreen'
import { MedidasSheet } from './MedidasSheet'
import { HistorialBuscadorSheet } from './HistorialBuscadorSheet'
import { getWorkoutStreak } from '../utils/streak'
import { seriesEfectivas } from '../utils/volume'
import { MESES } from '../utils/informes'
import { useHoy } from '../utils/useHoy'
import { R, S, T, tappable, deltaColor, ROW, SP } from '../theme'
import { formatMedida, formatNum } from '../utils/format'

/**
 * Achica la foto elegida a 256 px y la devuelve como JPEG en data URL: así
 * entra en el almacenamiento del teléfono (y en la copia de seguridad) sin
 * ocupar varios megas.
 */
function achicarFoto(file: File, lado = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      // Recorte cuadrado desde el centro.
      const corte = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = lado
      canvas.height = lado
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('sin canvas')); return }
      ctx.drawImage(img, (img.width - corte) / 2, (img.height - corte) / 2, corte, corte, 0, 0, lado, lado)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('no se pudo leer la imagen')) }
    img.src = url
  })
}

/** "en 9 días", "en 3 semanas", "en 2 meses" */
function lapso(ms: number): string {
  const dias = Math.max(1, Math.round(ms / 86400000))
  if (dias < 14) return `en ${dias} ${dias === 1 ? 'día' : 'días'}`
  if (dias < 60) return `en ${Math.round(dias / 7)} semanas`
  const meses = Math.round(dias / 30)
  return `en ${meses} ${meses === 1 ? 'mes' : 'meses'}`
}

/** "Entrenando desde febrero" (con el año si no es este). */
function desdeCuando(ts: number, nowTs: number): string {
  const d = new Date(ts)
  const mes = MESES[d.getMonth()]
  return `Entrenando desde ${mes}${d.getFullYear() === new Date(nowTs).getFullYear() ? '' : ` ${d.getFullYear()}`}`
}

const fila = {
  width: '100%', background: S.surf, border: `1px solid ${S.line2}`, borderRadius: R.lg,
  minHeight: ROW.loose + 4, padding: `${SP[2]}px ${SP[2]}px ${SP[2]}px ${SP[4]}px`,
  display: 'flex', alignItems: 'center', gap: SP[3], textAlign: 'left', cursor: 'pointer', color: S.ink,
} as const
const tile = {
  width: ROW.compact, height: ROW.compact, borderRadius: R.md, flexShrink: 0, background: S.surf2,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: T.h2,
} as const
const chevron = { width: ROW.compact, height: ROW.compact, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.dim, fontSize: T.h2 } as const

export function ProfileScreen() {
  const { userName, updateUserName, workouts, prs, measures, avatarPhoto, setAvatarPhoto, addToast, inicioUso } = useStore()
  const allExercises = useAllExercises()
  const nowTs = useHoy()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(userName)
  const [showSettings, setShowSettings] = useState(false)
  const [showMedidas, setShowMedidas] = useState(false)
  const [showBuscador, setShowBuscador] = useState(false)

  const finished = useMemo(() => workouts.filter((w) => w.finishedAt), [workouts])
  const totalWorkouts = finished.length
  const totalMinutes = finished.reduce((a, w) => a + (w.durationMin ?? 0), 0)
  const streak = useMemo(() => getWorkoutStreak(finished, nowTs), [finished, nowTs])
  const primerEntreno = finished.length ? Math.min(...finished.map((w) => w.startedAt)) : null
  const desde = inicioUso ?? primerEntreno

  const initials = userName.slice(0, 2).toUpperCase()
  const seriesTotales = useMemo(() => seriesEfectivas(finished), [finished])
  const ultimaMedida = measures.length > 0 ? measures[measures.length - 1] : null
  // Las últimas mediciones de peso, para la variación de la fila.
  const pesos = useMemo(
    () => measures.filter(m => m.weightKg).sort((a, b) => a.date - b.date).slice(-8),
    [measures]
  )
  const difPeso = pesos.length > 1 ? Math.round((pesos[pesos.length - 1].weightKg! - pesos[0].weightKg!) * 10) / 10 : 0

  const elegirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      setAvatarPhoto(await achicarFoto(file))
    } catch {
      addToast('No se pudo usar esa foto. Probá con otra.', 'info')
    }
  }

  const handleSaveName = () => {
    if (nameDraft.trim()) updateUserName(nameDraft.trim())
    setEditingName(false)
  }

  return (
    <div className="flex-1 min-h-0 scroll-area pb-4">
      <div className="px-4 safe-top pb-6">
        <h1 className="text-2xl font-bold text-ink">Perfil</h1>
      </div>

      {/* Identidad y números en una sola tarjeta: una cifra grande y tres secundarias */}
      <div className="px-4 mb-4">
        <section aria-label="Tu perfil" style={{ background: S.surf, border: `1px solid ${S.line2}`, borderRadius: R.lg, padding: `${SP[4]}px ${SP[2]}px ${SP[4]}px ${SP[4]}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[3] }}>
            {/*
              El input va adentro de un <label>: abrir el selector con un .click()
              sobre un input display:none no funciona en varias WebViews de
              Android (ni siempre en iOS), y así lo dispara el navegador solo.
              Sin `capture`, para que ofrezca galería y cámara.
            */}
            <label
              htmlFor="avatar-foto"
              role="button"
              aria-label={avatarPhoto ? 'Cambiar la foto de perfil' : 'Elegir una foto de perfil'}
              className="w-16 h-16 rounded-2xl bg-primary-muted border border-primary/30 flex items-center justify-center flex-shrink-0 overflow-hidden relative"
              style={{ padding: 0, cursor: 'pointer' }}
            >
              {avatarPhoto
                ? <img src={avatarPhoto} alt="" className="w-full h-full object-cover" />
                : <span className="text-primary text-2xl font-bold">{initials}</span>}
              <span aria-hidden="true" style={{
                position: 'absolute', right: 3, bottom: 3, width: 20, height: 20, borderRadius: 10,
                background: S.surf, border: `1px solid ${S.line2}`, fontSize: T.micro,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>📷</span>
              <input
                id="avatar-foto"
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif"
                onChange={elegirFoto}
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
              />
            </label>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <div style={{ display: 'flex', gap: SP[2] }}>
                  <input
                    autoFocus
                    aria-label="Editar nombre"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    maxLength={24}
                    className="flex-1 min-w-0 bg-surface border border-border-hi rounded-lg px-3 text-ink text-sm focus:border-primary"
                    style={{ minHeight: ROW.compact }}
                  />
                  <button
                    onClick={handleSaveName}
                    aria-label="Guardar nombre"
                    className="text-primary font-bold"
                    style={{ ...tappable, fontSize: T.title, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: T.h2, fontWeight: 700, color: S.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              )}
              {desde != null
                ? <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>{desdeCuando(desde, nowTs)}</div>
                : <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>Tocá el cuadrado para poner una foto</div>}
              {avatarPhoto && (
                <button onClick={() => setAvatarPhoto(null)} className="text-dim text-xs" style={{ background: 'none', border: 'none', padding: `${SP[1]}px 0`, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Quitar la foto
                </button>
              )}
            </div>
            {!editingName && (
              <button
                onClick={() => { setNameDraft(userName); setEditingName(true) }}
                aria-label="Editar nombre"
                style={{ ...tappable, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: S.dim, fontSize: T.title, cursor: 'pointer' }}
              >
                <span aria-hidden="true">✏️</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: SP[4], marginTop: SP[4], paddingRight: SP[2] }}>
            <div>
              <div className="num" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: S.ink }}>{totalWorkouts}</div>
              <div style={{ fontSize: T.caption, color: S.dim, marginTop: SP[1] }}>{totalWorkouts === 1 ? 'entreno' : 'entrenos'}</div>
            </div>
            <div aria-hidden="true" style={{ width: 1, height: 40, background: S.line2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', gap: SP[2] }}>
              <div>
                <div className="num" style={{ fontSize: T.title, fontWeight: 700, color: S.ink }}>{formatNum(Math.round(totalMinutes / 60))} h</div>
                <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>totales</div>
              </div>
              <div>
                <div className="num" style={{ fontSize: T.title, fontWeight: 700, color: S.ink }}>{formatNum(seriesTotales)}</div>
                <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>series</div>
              </div>
              <div>
                <div className="num" style={{ fontSize: T.title, fontWeight: 700, color: prs.length ? S.acc2 : S.ink }}>{formatNum(prs.length)}</div>
                <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>récords</div>
              </div>
            </div>
          </div>

          {/* La mejor racha, no la actual: un 0 al lado del récord desmotiva. */}
          {streak.best > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: SP[3], fontSize: T.caption, color: S.dim }}>
              <span aria-hidden="true">🔥</span>
              Mejor racha: <b className="num" style={{ color: S.ink }}>{streak.best}</b> {streak.best === 1 ? 'entreno seguido' : 'entrenos seguidos'}
            </div>
          )}
        </section>
      </div>

      {/* Peso y medidas · buscador del historial · ajustes */}
      <div className="px-4 mb-4 flex flex-col gap-2">
        <button onClick={() => setShowMedidas(true)} style={fila}>
          <span style={tile} aria-hidden="true">⚖️</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: T.bodyLg, fontWeight: 700 }}>Peso y medidas</span>
            <span style={{ display: 'block', fontSize: T.caption, color: S.dim, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ultimaMedida?.weightKg
                ? <><span className="num" style={{ color: S.ink }}>{formatMedida(ultimaMedida.weightKg, 'kg')}</span> · {new Date(ultimaMedida.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</>
                : 'Todavía sin anotar'}
            </span>
          </span>
          {pesos.length > 1 && difPeso !== 0 && (
            <span
              className="num"
              aria-label={`${difPeso > 0 ? 'subió' : 'bajó'} ${formatMedida(Math.abs(difPeso), 'kg')} ${lapso(pesos[pesos.length - 1].date - pesos[0].date)}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 3, height: 24, padding: `0 ${SP[2]}px`, borderRadius: 999, background: S.surf2, fontSize: T.caption, fontWeight: 700, color: deltaColor(difPeso, 'neutral'), whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <span aria-hidden="true">{difPeso > 0 ? '↑' : '↓'}</span>{formatMedida(Math.abs(difPeso), 'kg')}
            </span>
          )}
          <span style={chevron} aria-hidden="true">›</span>
        </button>
        <button onClick={() => setShowBuscador(true)} style={fila}>
          <span style={tile} aria-hidden="true">🔎</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: T.bodyLg, fontWeight: 700 }}>Buscar en el historial</span>
            <span style={{ display: 'block', fontSize: T.caption, color: S.dim, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Cuándo hiciste un ejercicio y con cuánto</span>
          </span>
          <span style={chevron} aria-hidden="true">›</span>
        </button>
        <button onClick={() => setShowSettings(true)} style={fila}>
          <span style={tile} aria-hidden="true">⚙️</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: T.bodyLg, fontWeight: 700 }}>Ajustes</span>
            <span style={{ display: 'block', fontSize: T.caption, color: S.dim, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Nombre, meta semanal, backup, IA</span>
          </span>
          <span style={chevron} aria-hidden="true">›</span>
        </button>
      </div>

      {/* Versión, como pie */}
      <p style={{ fontSize: T.caption, color: S.mute, textAlign: 'center', padding: `${SP[2]}px ${SP[4]}px 0` }}>
        GymPro {__APP_VERSION__} · actualizada {__BUILD_DATE__} · <span className="num">{allExercises.length}</span> ejercicios
      </p>

      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
      {showMedidas && <MedidasSheet onClose={() => setShowMedidas(false)} />}
      {showBuscador && <HistorialBuscadorSheet onClose={() => setShowBuscador(false)} />}
    </div>
  )
}
