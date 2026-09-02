import { useEffect, useState, useRef } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { RestTimerOverlay } from './RestTimerOverlay'
import { CircularRing } from '../components/CircularRing'
import { ExerciseThumbnail } from '../components/ExerciseThumbnail'
import { ExerciseModal } from '../components/ExerciseModal'
import { vibrate, primeAudio } from '../utils/haptics'
import { useWakeLock } from '../utils/useWakeLock'
import { isDurationExercise, durationUnit, toSeconds } from '../utils/duration'
import { suggestNextWeight } from '../utils/progression'
import { decimalInputProps, integerInputProps, parseDecimal } from '../utils/numberInput'
import { toDateInputValue, fromDateInputValue } from '../utils/dates'
import { useLongPress } from '../utils/useLongPress'
import { ExercisePickerSheet } from '../components/ExercisePickerSheet'
import type { Exercise } from '../types'
import { S } from '../theme'


function estimate1RM(kg: number, reps: number): number {
  if (reps === 1) return kg
  return Math.round(kg * (1 + reps / 30))
}

const BAR_KG = 20
const PLATES = [20, 15, 10, 5, 2.5, 1.25]

function getPlates(totalKg: number): string {
  const perSide = (totalKg - BAR_KG) / 2
  if (perSide <= 0) return `Solo barra (${BAR_KG}kg)`
  const result: string[] = []
  let remaining = perSide
  for (const p of PLATES) {
    const count = Math.floor(remaining / p + 0.001)
    if (count > 0) { result.push(`${count}×${p}kg`); remaining -= count * p }
  }
  return result.length ? result.join(' + ') + ' / lado' : `${perSide}kg / lado`
}

function TipsRow({ exerciseId }: { exerciseId: string }) {
  const { exerciseTips, setExerciseTip } = useStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(exerciseTips[exerciseId] ?? '')
  const tip = exerciseTips[exerciseId]
  const handleSave = () => { setExerciseTip(exerciseId, draft.trim()); setOpen(false) }
  return (
    <div style={{ borderTop: `1px solid ${S.line}` }}>
      {!open ? (
        <button onClick={() => { setDraft(tip ?? ''); setOpen(true) }}
          className="w-full flex items-center gap-2 px-3 text-left"
          style={{ minHeight: 44, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          <span style={{ fontSize: 13 }}>📝</span>
          <span style={{ flex: 1, fontSize: 11, color: tip ? S.dim : S.faint }}>{tip || 'Agregar tip / recordatorio de técnica...'}</span>
          <span style={{ fontSize: 11, color: S.faint }}>{tip ? '✏️' : '+'}</span>
        </button>
      ) : (
        <div style={{ padding: '8px 12px 12px' }} className="flex flex-col gap-2">
          <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder="Ej: Escápulas retraídas, bajar lento 3s..."
            rows={3}
            style={{ width: '100%', background: S.surf2, border: `1px solid ${S.line2}`, borderRadius: 8, padding: '8px 12px', fontSize: 16, color: S.ink, fontFamily: 'DM Sans, system-ui, sans-serif', outline: 'none', resize: 'none' }}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setOpen(false)} style={{ fontSize: 11, color: S.dim, padding: '4px 12px', borderRadius: 8, border: `1px solid ${S.line2}`, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={handleSave} style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: S.acc, padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function LivePrBanner({ exerciseId, kg, reps, onDismiss }: {
  exerciseId: string; kg: number; reps: number; onDismiss: () => void
}) {
  const allExercises = useAllExercises()
  const ex = allExercises.find(e => e.id === exerciseId)
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])
  return (
    <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-center px-4 pt-2" style={{ pointerEvents: 'none' }}>
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full max-w-sm screen-enter"
        style={{ background: 'rgba(242,169,59,0.15)', border: `1px solid rgba(242,169,59,0.4)`, pointerEvents: 'auto' }}>
        <span style={{ fontSize: 24 }}>🏆</span>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: S.acc2 }}>¡Nuevo PR!</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: S.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {ex?.nameEs ?? ''} — {kg}kg × {reps} reps
          </p>
          {reps > 1 && <p style={{ fontSize: 11, color: S.acc2, opacity: 0.75, marginTop: 2 }}>~1RM estimado: {estimate1RM(kg, reps)}kg</p>}
        </div>
        <button onClick={onDismiss} style={{ color: S.dim, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
      </div>
    </div>
  )
}

/**
 * Chip con la fecha a la que se imputa el entreno. Por defecto es hoy, pero se
 * puede mover hacia atrás para cargar una sesión de otro día.
 */
function WorkoutDatePicker({ startedAt, onChange }: { startedAt: number; onChange: (ts: number) => void }) {
  const value = toDateInputValue(startedAt)
  // Una sola lectura del reloj por montaje: el render tiene que ser puro.
  const [hoy] = useState(() => toDateInputValue(Date.now()))
  const esHoy = value === hoy
  const label = esHoy
    ? 'Hoy'
    : new Date(startedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  return (
    <label
      title="Cambiar la fecha del entreno"
      style={{
        position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 10, cursor: 'pointer',
        background: esHoy ? S.surf2 : 'rgba(242,169,59,0.14)',
        border: `1px solid ${esHoy ? S.line2 : 'rgba(242,169,59,0.35)'}`,
        color: esHoy ? S.dim : S.acc2, fontSize: 11, fontWeight: 600,
      }}
    >
      <span aria-hidden="true">📅</span>
      <span>{label}</span>
      <input
        type="date"
        aria-label="Fecha del entreno"
        value={value}
        max={hoy}
        onChange={(e) => {
          const ts = fromDateInputValue(e.target.value)
          if (ts !== null) onChange(ts)
        }}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: 0, cursor: 'pointer', border: 'none', padding: 0, background: 'transparent',
        }}
      />
    </label>
  )
}


/**
 * Ancho de las columnas de una serie: número, kg, reps y el tilde.
 * Los ± se sacaron: ocupaban más de la mitad de la fila para algo que casi no
 * se usa (el peso se escribe), y dejaban los campos en unos 48 px de ancho con
 * botones de 32×32, imposibles de acertar con las manos transpiradas.
 */
const SET_GRID = '34px minmax(0,1fr) minmax(0,1fr) 64px'

/** Fila de un menú de acciones (serie o ejercicio). */
const opcionMenu: React.CSSProperties = {
  width: '100%', textAlign: 'left', minHeight: 52,
  background: S.surf2, border: `1px solid ${S.line2}`, borderRadius: 14,
  padding: '12px 16px', color: S.ink, fontSize: 14, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif',
}
const SET_GRID_TIEMPO = '34px minmax(0,1fr) 64px'

function estiloCampo(completada: boolean): React.CSSProperties {
  return {
    width: '100%', minWidth: 0, textAlign: 'center',
    // 16px es el mínimo con el que iOS no hace zoom al enfocar el campo.
    fontSize: 17, fontWeight: 700, minHeight: 48,
    borderRadius: 10, padding: '8px 4px',
    background: completada ? 'rgba(232,99,74,0.1)' : S.surf2,
    border: `1px solid ${completada ? 'rgba(232,99,74,0.25)' : S.line2}`,
    color: completada ? S.acc : S.ink,
    fontFamily: 'DM Sans, system-ui, sans-serif',
    outline: 'none',
  }
}

/**
 * Una serie del entreno.
 *
 * Un solo tilde: un toque confirma, y mantenerlo apretado confirma y arranca el
 * cronómetro de descanso. Antes había dos botones casi idénticos de 36 px al
 * lado, y había que decidir entre ellos en el medio de la serie.
 */
function SetRow({
  exIdx, setIdx, set, byTime, unit, isBarbellLike, puedeBorrar,
  onUpdate, onToggleWarmup, onRemove, onComplete,
}: {
  exIdx: number
  setIdx: number
  set: import('../types').ActiveWorkoutSet
  byTime: boolean
  unit: 'min' | 'seg'
  isBarbellLike: boolean
  puedeBorrar: boolean
  onUpdate: (e: number, s: number, f: 'kg' | 'reps' | 'duration', v: string) => void
  onToggleWarmup: (e: number, s: number) => void
  onRemove: (e: number, s: number) => void
  onComplete: (e: number, s: number, o?: { startRest?: boolean }) => void
}) {
  const [destello, setDestello] = useState(false)
  const [verDiscos, setVerDiscos] = useState(false)
  const [acciones, setAcciones] = useState(false)

  const completada = set.completed
  const calentamiento = !!set.isWarmup
  const kg = parseDecimal(set.kg) || 0
  const reps = parseInt(set.reps) || 0
  const orm = completada && kg > 0 && reps > 1 ? estimate1RM(kg, reps) : null
  const sePuede = completada || (byTime ? toSeconds(set.duration ?? '', unit) > 0 : reps > 0)

  const confirmar = (conDescanso: boolean) => {
    // El audio de iOS sólo arranca desde un gesto del usuario: este es el gesto.
    primeAudio()
    onComplete(exIdx, setIdx, { startRest: conDescanso })
    if (!completada && sePuede) {
      vibrate(conDescanso ? [40, 20, 40, 20, 40] : [40, 20, 40])
      setDestello(true)
      setTimeout(() => setDestello(false), 600)
    }
  }

  const { consumioElTap, handlers } = useLongPress(() => { if (!completada && sePuede) confirmar(true) })

  return (
    <div>
      <div
        className={destello ? 'set-complete-flash' : ''}
        style={{
          display: 'grid', gridTemplateColumns: byTime ? SET_GRID_TIEMPO : SET_GRID,
          alignItems: 'center', padding: '6px 14px', gap: 8,
          background: completada ? 'rgba(232,99,74,0.05)' : 'transparent',
          borderTop: `1px solid ${S.line}`,
        }}
      >
        {/*
          El número de la serie es un solo botón que abre las acciones
          secundarias. Antes esta columna tenía tres objetivos apilados de
          26×22 y 26×20, imposibles de acertar; ahora es uno de 34×48 y las
          opciones salen en filas grandes.
        */}
        <button
          onClick={() => setAcciones(true)}
          aria-label={`Serie ${setIdx + 1}${calentamiento ? ', de calentamiento' : ''}. Opciones`}
          style={{
            width: '100%', minHeight: 48, borderRadius: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
            background: calentamiento ? 'rgba(242,169,59,0.12)' : 'none',
            border: `1px solid ${calentamiento ? 'rgba(242,169,59,0.35)' : 'transparent'}`,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: calentamiento ? S.acc2 : completada ? S.acc : S.dim, lineHeight: 1 }}>
            {setIdx + 1}
          </span>
          {calentamiento && (
            <span style={{ fontSize: 11, fontWeight: 700, color: S.acc2, lineHeight: 1 }}>W</span>
          )}
        </button>

        {byTime ? (
          <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
            <input
              {...decimalInputProps} value={set.duration ?? ''}
              aria-label={`Tiempo en ${unit === 'min' ? 'minutos' : 'segundos'}, serie ${setIdx + 1}`}
              onChange={(e) => onUpdate(exIdx, setIdx, 'duration', e.target.value)}
              placeholder="0" disabled={completada}
              style={estiloCampo(completada)}
            />
            <span style={{ fontSize: 11, color: S.faint, flexShrink: 0, width: 24 }}>{unit}</span>
          </div>
        ) : (
          <>
            <input
              {...decimalInputProps} value={set.kg}
              aria-label={`Peso en kg, serie ${setIdx + 1}`}
              onChange={(e) => onUpdate(exIdx, setIdx, 'kg', e.target.value)}
              onFocus={() => { if (isBarbellLike) setVerDiscos(true) }}
              onBlur={() => setTimeout(() => setVerDiscos(false), 200)}
              placeholder="0" disabled={completada}
              style={estiloCampo(completada)}
            />
            <input
              {...integerInputProps} value={set.reps}
              aria-label={`Repeticiones, serie ${setIdx + 1}`}
              onChange={(e) => onUpdate(exIdx, setIdx, 'reps', e.target.value)}
              placeholder="0" disabled={completada}
              style={estiloCampo(completada)}
            />
          </>
        )}

        {/* Un solo tilde: tap confirma, mantener apretado arranca el descanso */}
        <button
          {...handlers}
          aria-label={completada ? 'Desmarcar serie' : 'Confirmar serie. Mantené apretado para arrancar el descanso'}
          title={completada ? 'Desmarcar' : 'Tocá para confirmar · mantené apretado para el descanso'}
          onClick={() => { if (consumioElTap()) return; confirmar(false) }}
          style={{
            width: '100%', minHeight: 48, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: completada ? S.acc : sePuede ? 'rgba(232,99,74,0.10)' : S.surf2,
            border: `2px solid ${completada ? S.acc : sePuede ? 'rgba(232,99,74,0.4)' : S.line2}`,
            color: completada ? '#fff' : sePuede ? S.acc : S.faint,
            fontSize: 22, fontWeight: 700, lineHeight: 1,
            cursor: sePuede ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            transition: 'all 0.15s', opacity: sePuede ? 1 : 0.4,
            touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none',
          }}
        >✓</button>
      </div>

      {/* Pista de discos y 1RM, debajo de la fila */}
      {(verDiscos && isBarbellLike && kg >= BAR_KG) && (
        <div style={{ padding: '4px 14px 6px', fontSize: 11, color: S.dim }}>🏋️ {getPlates(kg)}</div>
      )}
      {orm !== null && (
        <div style={{ padding: '0 14px 6px' }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(52,211,153,0.55)' }}>~1RM: {orm}kg</span>
        </div>
      )}

      {acciones && (
        <div className="fixed inset-0 z-[58] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setAcciones(false)}>
          <div
            className="w-full rounded-t-3xl px-4 pt-4 sheet-enter"
            style={{ background: S.surf, borderTop: `1px solid ${S.line2}`, paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: S.surf2, borderRadius: 2, margin: '0 auto 14px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: S.ink, marginBottom: 14 }}>Serie {setIdx + 1}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onToggleWarmup(exIdx, setIdx); setAcciones(false) }}
                style={{ ...opcionMenu, color: calentamiento ? S.acc2 : S.ink }}
              >
                {calentamiento ? '☑ Serie de calentamiento' : '☐ Marcar como calentamiento'}
                <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: S.dim, marginTop: 2 }}>
                  No cuenta para el volumen ni para los récords
                </span>
              </button>
              {puedeBorrar && (
                <button
                  onClick={() => { onRemove(exIdx, setIdx); setAcciones(false) }}
                  style={{ ...opcionMenu, color: S.bad }}
                >
                  🗑 Borrar esta serie
                </button>
              )}
              <button onClick={() => setAcciones(false)} style={{ ...opcionMenu, textAlign: 'center', color: S.dim, background: 'none' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ActiveWorkoutScreen() {
  const { routines, workouts, prs } = useStore()
  const exercises = useAllExercises()
  const {
    activeWorkout, updateSetValue, toggleSetWarmup, completeSet, addSetToExercise, removeSetFromExercise,
    dismissLivePr, finishWorkout, cancelWorkout, setWorkoutDate,
    addExerciseToWorkout, replaceExerciseInWorkout, removeExerciseFromWorkout,
  } = useWorkoutStore()

  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [modalExercise, setModalExercise] = useState<Exercise | null>(null)
  const [confirmAction, setConfirmAction] = useState<'finish' | 'cancel' | null>(null)
  // Índice del ejercicio cuyo menú está abierto, y qué se eligió hacer con él.
  const [menuEjercicio, setMenuEjercicio] = useState<number | null>(null)
  const [pickerPara, setPickerPara] = useState<{ modo: 'cambiar' | 'agregar'; exIdx: number } | null>(null)

  // Pantalla encendida mientras el entreno está abierto.
  useWakeLock(!!activeWorkout)

  const realStartedAt = activeWorkout?.realStartedAt
  useEffect(() => {
    if (!realStartedAt) return
    intervalRef.current = setInterval(() => setElapsed(Date.now() - realStartedAt), 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [realStartedAt])

  if (!activeWorkout) return null

  const routine = routines.find((r) => r.id === activeWorkout.routineId)
  const totalSets = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const completedSets = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0)
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
  const prevWorkout = [...workouts]
    .filter((w) => w.routineId === activeWorkout.routineId && w.finishedAt)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0]



  return (
    <div className="flex-1 min-h-0 flex flex-col screen-enter relative" style={{ background: S.bg }}>

      {/* Live PR banner */}
      {activeWorkout.livePr && (
        <LivePrBanner exerciseId={activeWorkout.livePr.exerciseId} kg={activeWorkout.livePr.kg} reps={activeWorkout.livePr.reps} onDismiss={dismissLivePr} />
      )}

      {/* Header */}
      <div style={{ flexShrink: 0, padding: '54px 22px 16px', borderBottom: `1px solid ${S.line2}` }}>
        <div className="flex items-center justify-between gap-3">
          <div style={{ fontSize: 13, color: S.dim, fontWeight: 500, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {routine?.emoji} {routine?.name}
          </div>
          {/* Fecha del entreno: editable para cargar el de ayer. */}
          <WorkoutDatePicker startedAt={activeWorkout.startedAt} onChange={setWorkoutDate} />
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
          <div className="flex items-center gap-4">
            <CircularRing value={progressPct} size={50} strokeWidth={5} color={S.acc} trackColor={S.line2}>
              <span style={{ fontSize: 11, fontWeight: 700, color: S.ink }}>{progressPct}%</span>
            </CircularRing>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: S.ink }}>
                {completedSets} <span style={{ color: S.dim, fontSize: 16 }}>/ {totalSets} series</span>
              </div>
              <div style={{ fontSize: 12, color: S.dim, marginTop: 2 }}>{progressPct}% completado</div>
            </div>
          </div>
          {/* Cronómetro de duración — prominente */}
          <div style={{ textAlign: 'right' }} aria-label="Duración del entreno" role="timer">
            <div style={{
              fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: S.ink,
              fontFamily: 'JetBrains Mono, monospace', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>
              {formatElapsed(elapsed)}
            </div>
            <div className="flex items-center justify-end gap-1" style={{ marginTop: 5 }}>
              <span className="live-dot" style={{ width: 7, height: 7, borderRadius: 4, background: S.acc, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: S.acc, fontWeight: 600 }}>En curso</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex-1 min-h-0 scroll-area">
        {activeWorkout.exercises.map((activeEx, exIdx) => {
          const ex = exercises.find((e) => e.id === activeEx.exerciseId)
          if (!ex) return null
          const config = muscleGroupConfig[ex.muscleGroup]
          const pr = prs.find((p) => p.exerciseId === ex.id)
          const isBarbellLike = ex.equipmentType === 'barra'
          const prevSets = prevWorkout?.exercises.find((e) => e.exerciseId === ex.id)?.sets ?? []
          const completedCount = activeEx.sets.filter((s) => s.completed).length
          const byTime = isDurationExercise(ex)
          const unit = durationUnit(ex)
          const routineEx = routine?.exercises.find((re) => re.exerciseId === ex.id)
          // Sugerencia de doble progresión: sólo tiene sentido con kg y reps.
          const suggestion = routineEx && !byTime
            ? suggestNextWeight(ex, routineEx, workouts, ex.id)
            : null

          return (
            <div key={activeEx.exerciseId} style={{ margin: '12px 16px 0', background: S.surf, borderRadius: 16, overflow: 'hidden', border: `1px solid ${S.line2}` }}>

              {/* Encabezado del ejercicio */}
              <div style={{ padding: '14px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: S.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: S.acc, border: `1px solid ${S.line2}`, flexShrink: 0 }}>
                  {exIdx + 1}
                </div>
                <button
                  onClick={() => setModalExercise(ex)}
                  aria-label={`Ver ${ex.nameEs}`}
                  style={{ flexShrink: 0, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <ExerciseThumbnail exercise={ex} size={40} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: S.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.nameEs}</div>
                  <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>
                    <span style={{ color: config.color }}>{config.label}</span>
                    {pr && <span style={{ color: S.acc2 }}> · 🏆 {pr.kg > 0 ? `${pr.kg}×${pr.reps}` : `${pr.reps} reps`}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: completedCount === activeEx.sets.length && activeEx.sets.length > 0 ? S.acc : S.dim }}>
                  {completedCount}/{activeEx.sets.length}
                </div>
                {/* Menú del ejercicio: cambiarlo o sacarlo sin salir del entreno */}
                <button
                  onClick={() => setMenuEjercicio(exIdx)}
                  aria-label={`Opciones de ${ex.nameEs}`}
                  style={{ width: 44, height: 44, flexShrink: 0, marginRight: -8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: S.dim, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
                >⋯</button>
              </div>

              {/* Sugerencia de doble progresión */}
              {suggestion && (
                <div style={{
                  margin: '0 14px 10px', padding: '8px 10px', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: suggestion.reason === 'subir' ? 'rgba(52,211,153,0.10)' : 'rgba(255,255,255,0.035)',
                  border: `1px solid ${suggestion.reason === 'subir' ? 'rgba(52,211,153,0.30)' : S.line2}`,
                }}>
                  <span style={{ fontSize: 13, flexShrink: 0 }}>
                    {suggestion.reason === 'subir' ? '▲' : suggestion.reason === 'bajar' ? '▼' : suggestion.reason === 'primera-vez' ? '🎯' : '='}
                  </span>
                  <span style={{ fontSize: 11, color: suggestion.reason === 'subir' ? S.good : S.dim, lineHeight: 1.4 }}>
                    {suggestion.note}
                  </span>
                </div>
              )}

              {/* Encabezado de la tabla */}
              <div style={{ display: 'grid', gridTemplateColumns: SET_GRID, padding: '0 14px 6px', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: S.faint, textAlign: 'center' }}>Set</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: S.faint, textAlign: 'center' }}>
                  {byTime ? (unit === 'min' ? 'Minutos' : 'Segundos') : 'KG'}
                </div>
                {!byTime && <div style={{ fontSize: 11, fontWeight: 600, color: S.faint, textAlign: 'center' }}>Reps</div>}
                <div />
              </div>

              {/* Series */}
              {activeEx.sets.map((set, setIdx) => (
                <SetRow
                  key={setIdx}
                  exIdx={exIdx} setIdx={setIdx} set={set}
                  byTime={byTime} unit={unit}
                  isBarbellLike={isBarbellLike}
                  puedeBorrar={!set.completed && activeEx.sets.length > 1}
                  onUpdate={updateSetValue}
                  onToggleWarmup={toggleSetWarmup}
                  onRemove={removeSetFromExercise}
                  onComplete={completeSet}
                />
              ))}

              {/* Previous session hint */}
              {prevSets.length > 0 && (
                <div style={{ padding: '8px 16px 6px', borderTop: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: S.faint, flexShrink: 0 }}>💡 Última:</span>
                  {prevSets.slice(0, 4).map((s, i) => (
                    <span key={i} style={{ fontSize: 11, fontWeight: 600, color: S.dim, background: S.surf2, padding: '2px 8px', borderRadius: 6, border: `1px solid ${S.line2}` }}>
                      {s.kg > 0 ? `${s.kg}×${s.reps}` : `${s.reps} reps`}
                    </span>
                  ))}
                </div>
              )}

              <TipsRow exerciseId={ex.id} />

              {/* Add set button */}
              <div style={{ padding: '10px 16px 14px' }}>
                <button onClick={() => addSetToExercise(exIdx)}
                  style={{ background: S.surf2, border: `1px solid ${S.line2}`, borderRadius: 10, color: S.dim, fontSize: 13, fontWeight: 600, minHeight: 44, padding: '0 18px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Serie
                </button>
              </div>
            </div>
          )
        })}

        {/* Sumar un ejercicio que no estaba en la rutina */}
        <div style={{ padding: '12px 16px 0' }}>
          <button
            onClick={() => setPickerPara({ modo: 'agregar', exIdx: activeWorkout.exercises.length - 1 })}
            style={{
              width: '100%', minHeight: 48, borderRadius: 14,
              background: 'none', border: `1.5px dashed ${S.line2}`,
              color: S.dim, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            + Agregar un ejercicio
          </button>
        </div>
        <div style={{ height: 16 }} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', paddingBottom: 36, borderTop: `1px solid ${S.line2}`, background: S.bg }}>
        <button onClick={() => setConfirmAction('cancel')}
          style={{ flex: 1, background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 14, color: S.dim, fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 600, fontSize: 14, padding: '14px 0', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={() => setConfirmAction('finish')}
          style={{ flex: 2, background: S.acc, border: 'none', borderRadius: 14, color: '#fff', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 700, fontSize: 15, padding: '14px 0', cursor: 'pointer' }}>
          Terminar entreno
        </button>
      </div>

      {/* Menú del ejercicio: cambiarlo por otro o sacarlo de esta sesión */}
      {menuEjercicio !== null && (() => {
        const activeEx = activeWorkout.exercises[menuEjercicio]
        const ex = exercises.find((e) => e.id === activeEx?.exerciseId)
        const hechas = activeEx?.sets.filter((st) => st.completed).length ?? 0
        return (
          <div className="fixed inset-0 z-[55] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setMenuEjercicio(null)}>
            <div
              className="w-full rounded-t-3xl px-4 pt-4 sheet-enter"
              style={{ background: S.surf, borderTop: `1px solid ${S.line2}`, paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: 40, height: 4, background: S.surf2, borderRadius: 2, margin: '0 auto 14px' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: S.ink, marginBottom: 2 }}>{ex?.nameEs}</p>
              <p style={{ fontSize: 12, color: S.dim, marginBottom: 14 }}>
                {hechas > 0 ? `${hechas} ${hechas === 1 ? 'serie hecha' : 'series hechas'} en esta sesión` : 'Todavía sin series'}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setPickerPara({ modo: 'cambiar', exIdx: menuEjercicio }); setMenuEjercicio(null) }}
                  style={opcionMenu}
                >
                  ↔️ Cambiar por otro ejercicio
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: S.dim, marginTop: 2 }}>
                    Sólo por hoy: la rutina queda igual
                  </span>
                </button>
                <button
                  onClick={() => { setPickerPara({ modo: 'agregar', exIdx: menuEjercicio }); setMenuEjercicio(null) }}
                  style={opcionMenu}
                >
                  ➕ Agregar uno después de este
                </button>
                <button
                  onClick={() => { removeExerciseFromWorkout(menuEjercicio); setMenuEjercicio(null) }}
                  style={{ ...opcionMenu, color: S.bad }}
                >
                  ⤼ Saltear este ejercicio
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: S.dim, marginTop: 2 }}>
                    {hechas > 0 ? `Se pierden las ${hechas} series cargadas` : 'Lo saca del entreno de hoy'}
                  </span>
                </button>
                <button onClick={() => setMenuEjercicio(null)} style={{ ...opcionMenu, textAlign: 'center', color: S.dim, background: 'none' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {pickerPara && (
        <ExercisePickerSheet
          titulo={pickerPara.modo === 'cambiar' ? 'Cambiar por…' : 'Agregar al entreno'}
          sugeridoGrupo={
            pickerPara.modo === 'cambiar'
              ? exercises.find((e) => e.id === activeWorkout.exercises[pickerPara.exIdx]?.exerciseId)?.muscleGroup
              : undefined
          }
          excluir={activeWorkout.exercises.map((e) => e.exerciseId)}
          onPick={(id) => {
            if (pickerPara.modo === 'cambiar') replaceExerciseInWorkout(pickerPara.exIdx, id)
            else addExerciseToWorkout(id, pickerPara.exIdx)
          }}
          onClose={() => setPickerPara(null)}
        />
      )}

      {activeWorkout.restTimerVisible && <RestTimerOverlay />}

      {/* Confirm modal */}
      {confirmAction && (
        <div className="absolute inset-0 flex items-center justify-center z-50 px-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 }}>
            <h3 style={{ color: S.ink, fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
              {confirmAction === 'finish' ? '¿Terminar entreno?' : '¿Cancelar entreno?'}
            </h3>
            {confirmAction === 'cancel' && (
              <p style={{ color: S.dim, fontSize: 13, marginBottom: 16 }}>Se perderá todo el progreso de esta sesión.</p>
            )}
            <div className="flex gap-3" style={{ marginTop: 16 }}>
              <button onClick={() => setConfirmAction(null)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: `1px solid ${S.line2}`, color: S.dim, fontSize: 14, fontWeight: 600, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Volver
              </button>
              <button
                onClick={() => { setConfirmAction(null); if (confirmAction === 'finish') finishWorkout(); else cancelWorkout() }}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                  background: confirmAction === 'finish' ? S.acc : 'rgba(239,68,68,0.15)',
                  color: confirmAction === 'finish' ? '#fff' : '#f87171',
                }}>
                {confirmAction === 'finish' ? '✓ Terminar' : '✕ Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalExercise && <ExerciseModal exercise={modalExercise} onClose={() => setModalExercise(null)} />}
    </div>
  )
}
