import { useMemo } from 'react'
import { Dialog } from '../components/Dialog'
import { ExerciseThumbnail } from '../components/ExerciseThumbnail'
import { useAllExercises, useStore } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { formatKg, formatLoad } from '../utils/format'
import { parseDecimal } from '../utils/numberInput'
import { durationUnit, isDurationExercise } from '../utils/duration'
import { S } from '../theme'
import { agruparEntreno, grupoPorEjercicio, proximaSerie } from '../utils/bloques'
import type { Exercise, WorkoutSet } from '../types'

const PRESETS = [
  { label: '0:45', seconds: 45 },
  { label: '1:00', seconds: 60 },
  { label: '1:15', seconds: 75 },
  { label: '1:30', seconds: 90 },
  { label: '2:00', seconds: 120 },
  { label: '3:00', seconds: 180 },
]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Lo que se hizo en la serie `setIdx` de este ejercicio la última vez, para prepararse durante el descanso. */
function textoAnterior(prev: WorkoutSet | undefined, ex: Exercise): string | null {
  if (!prev) return null
  if (isDurationExercise(ex)) {
    const seg = prev.durationSec ?? 0
    return durationUnit(ex) === 'min' ? `${Math.round((seg / 60) * 10) / 10} min` : `${seg} s`
  }
  return prev.kg > 0 ? `${formatKg(prev.kg)} × ${prev.reps}` : `${prev.reps}`
}

function IconoChevronAbajo() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconoFlecha() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const botonRedondo: React.CSSProperties = {
  width: 60, height: 60, borderRadius: 30, flexShrink: 0,
  background: S.surf, border: `1px solid ${S.line2}`, color: S.ink,
  fontSize: 15, fontWeight: 600, cursor: 'pointer',
}

export function RestTimerOverlay({ onMinimize }: { onMinimize?: () => void }) {
  const exercises = useAllExercises()
  const routines = useStore((s) => s.routines)
  const workouts = useStore((s) => s.workouts)
  // Selectores: el tick del descanso escribe el store cada segundo.
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout)
  const dismissRestTimer = useWorkoutStore((s) => s.dismissRestTimer)
  const adjustRestTimer = useWorkoutStore((s) => s.adjustRestTimer)
  const setRestPreset = useWorkoutStore((s) => s.setRestPreset)

  const lastCompletedSet = activeWorkout?.lastCompletedSet
  const ejercicios = activeWorkout?.exercises
  const routineId = activeWorkout?.routineId
  const startedAt = activeWorkout?.startedAt

  // Qué viene: no cambia con el conteo, se calcula una vez por serie hecha.
  const nextExercise = useMemo(() => {
    if (!lastCompletedSet || !ejercicios) return null
    const exIdx = ejercicios.findIndex((e) => e.exerciseId === lastCompletedSet.exerciseId)
    if (exIdx < 0) return null
    const currentEx = ejercicios[exIdx]
    if (!currentEx) return null
    // En un circuito o superserie lo que sigue va por rondas (A2 después de C1).
    const rutina = routines.find((r) => r.id === routineId)
    const bloques = agruparEntreno(ejercicios, rutina?.exercises ?? [])
    const grupo = grupoPorEjercicio(bloques).get(exIdx)
    if (grupo && grupo.tipo !== 'suelto') {
      const p = proximaSerie(ejercicios, bloques, exIdx)
      if (p) {
        const ej = ejercicios[p.exIdx]
        return { exercise: exercises.find((e) => e.id === ej.exerciseId), setNum: p.setIdx + 1, set: ej.sets[p.setIdx] }
      }
    }
    const nextSetInSame = currentEx.sets.findIndex((s, i) => i > lastCompletedSet.setIdx && !s.completed)
    if (nextSetInSame >= 0) {
      return { exercise: exercises.find((e) => e.id === lastCompletedSet.exerciseId), setNum: nextSetInSame + 1, set: currentEx.sets[nextSetInSame] }
    }
    const nextEx = ejercicios[exIdx + 1]
    if (nextEx) {
      const idx = Math.max(0, nextEx.sets.findIndex((s) => !s.completed))
      return { exercise: exercises.find((e) => e.id === nextEx.exerciseId), setNum: idx + 1, set: nextEx.sets[idx] }
    }
    return null
  }, [lastCompletedSet, ejercicios, routines, routineId, exercises])

  // Lo de la vez anterior en esa misma serie: la k-ésima efectiva de la
  // última sesión en que se hizo el ejercicio (como la columna Anterior).
  const anterior = useMemo(() => {
    const ex = nextExercise?.exercise
    if (!ex || startedAt == null) return null
    const previa = workouts
      .filter((w) => w.finishedAt && w.startedAt < startedAt && w.exercises.some((e) => e.exerciseId === ex.id && e.sets.length > 0))
      .sort((a, b) => b.startedAt - a.startedAt)[0]
    const sets = previa?.exercises.find((e) => e.exerciseId === ex.id)?.sets.filter((s) => !s.isWarmup) ?? []
    return textoAnterior(sets[nextExercise.setNum - 1], ex)
  }, [nextExercise, workouts, startedAt])

  if (!activeWorkout) return null

  const { restSecondsLeft, restTotalSeconds } = activeWorkout
  const progress = restTotalSeconds > 0 ? (restSecondsLeft / restTotalSeconds) * 100 : 0
  const size = 220
  const strokeWidth = 12
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (progress / 100) * circumference

  const lastExercise = lastCompletedSet
    ? exercises.find((e) => e.id === lastCompletedSet.exerciseId)
    : null

  const objetivo = (() => {
    const n = nextExercise
    if (!n?.exercise || !n.set) return null
    if (isDurationExercise(n.exercise)) {
      return n.set.duration ? `${n.set.duration.replace('.', ',')} ${durationUnit(n.exercise) === 'min' ? 'min' : 's'}` : null
    }
    if (!n.set.reps && !n.set.kg) return null
    const kg = parseDecimal(n.set.kg)
    return `${kg > 0 ? `${formatKg(kg)} × ` : ''}${n.set.reps || '—'}${kg > 0 ? '' : ' reps'}`
  })()

  return (
    // Con Dialog: rol, foco adentro y Escape. Antes declaraba role=dialog sin
    // trampa de foco y el teclado seguía recorriendo el entreno de atrás.
    // Cerrar (Escape) es minimizar: el descanso sigue corriendo.
    //
    // bg-background/97 no existe en la escala de opacidades de Tailwind 3: la
    // clase no se generaba y el panel quedaba transparente sobre el entreno.
    <Dialog
      label="Descanso"
      onClose={onMinimize ?? dismissRestTimer}
      className="absolute inset-0 backdrop-blur-sm flex flex-col items-center z-50 sheet-enter"
      style={{ background: 'rgba(12,14,20,0.97)', padding: 'max(32px, env(safe-area-inset-top, 0px)) 20px max(28px, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="text-center flex flex-col items-center" style={{ gap: 10, flexShrink: 0 }}>
        <p className="eyebrow" style={{ color: S.dim }}>Descanso</p>
        {onMinimize && (
          <button onClick={onMinimize}
            className="flex items-center"
            style={{ minHeight: 44, padding: '0 18px', gap: 6, borderRadius: 22, background: S.surf, border: `1px solid ${S.line2}`, color: S.dim, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Ver el entreno <IconoChevronAbajo />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center w-full" style={{ gap: 14, marginTop: 28, flexShrink: 0 }}>
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={S.line2} strokeWidth={strokeWidth} />
            <circle
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={restSecondsLeft <= 10 ? S.good : S.acc}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" role="timer" aria-label="Tiempo de descanso que queda">
            <span className={`num${restSecondsLeft <= 3 ? ' late' : ''}`} style={{ fontSize: 64, fontWeight: 700, lineHeight: 1, color: S.ink }}>{formatTime(restSecondsLeft)}</span>
            <span className="num" style={{ fontSize: 12, color: S.dim, marginTop: 4 }}>de {formatTime(restTotalSeconds)}</span>
          </div>
        </div>

        {lastCompletedSet && lastExercise && (
          <p className="flex items-center justify-center flex-wrap" style={{ gap: 6, fontSize: 12, color: S.dim, textAlign: 'center' }}>
            <span aria-hidden="true" style={{ color: S.good, fontWeight: 700 }}>✓</span>
            Serie {lastCompletedSet.setIdx + 1} hecha · {lastExercise.nameEs} ·{' '}
            <b className="num" style={{ color: S.ink }}>
              {/* Los ejercicios por tiempo decían "0 reps". */}
              {isDurationExercise(lastExercise)
                ? `${(activeWorkout.exercises.find((e) => e.exerciseId === lastCompletedSet.exerciseId)?.sets[lastCompletedSet.setIdx]?.duration ?? '').replace('.', ',')} ${durationUnit(lastExercise) === 'min' ? 'min' : 's'}`
                : formatLoad(lastCompletedSet.kg, lastCompletedSet.reps)}
            </b>
          </p>
        )}

        {/* Lo que viene, con el mismo tratamiento que en el entreno: dibujo,
            serie, objetivo y lo de la vez anterior. */}
        {nextExercise?.exercise && (
          <div className="flex items-center w-full" style={{ gap: 12, padding: '12px 14px', borderRadius: 16, background: S.surf, border: `1px solid ${S.line2}` }}>
            <ExerciseThumbnail exercise={nextExercise.exercise} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="eyebrow">Siguiente</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: S.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nextExercise.exercise.nameEs}</p>
              <p style={{ fontSize: 12, color: S.dim, marginTop: 2 }}>
                Serie {nextExercise.setNum}
                {objetivo && <> · <span className="num" style={{ color: S.ink, fontWeight: 700 }}>{objetivo}</span></>}
                {anterior && <> · anterior <span className="num">{anterior}</span></>}
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <div className="flex flex-col items-center w-full" style={{ gap: 16, flexShrink: 0 }}>
        <div className="flex items-center justify-center w-full" style={{ gap: 14 }}>
          <button onClick={() => adjustRestTimer(-30)} aria-label="Restar 30 segundos" className="num" style={botonRedondo}>
            −30 s
          </button>
          <button
            onClick={dismissRestTimer}
            className="flex items-center justify-center"
            style={{ minHeight: 60, padding: '0 32px', gap: 8, borderRadius: 16, background: S.acc, color: S.onAcc, border: 'none', fontSize: 17, fontWeight: 700, cursor: 'pointer' }}
          >
            Saltar <IconoFlecha />
          </button>
          <button onClick={() => adjustRestTimer(30)} aria-label="Sumar 30 segundos" className="num" style={botonRedondo}>
            +30 s
          </button>
        </div>

        {/* Los seis en una fila a todo el ancho y 44 px de alto: antes eran
            píldoras de 36 px apretadas en 360. */}
        <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${PRESETS.length}, minmax(0, 1fr))`, gap: 6 }} role="group" aria-label="Duración del descanso">
          {PRESETS.map((p) => {
            const activo = restTotalSeconds === p.seconds
            return (
              <button
                key={p.seconds}
                onClick={() => setRestPreset(p.seconds)}
                aria-pressed={activo}
                className="num"
                style={{
                  minHeight: 44, borderRadius: 22, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: activo ? S.acc : S.surf,
                  border: `1px solid ${activo ? S.acc : S.line2}`,
                  color: activo ? S.onAcc : S.dim,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>
    </Dialog>
  )
}
