import { useEffect, useRef } from 'react'
import { useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { vibrate, playBeep } from '../utils/haptics'
import { formatLoad } from '../utils/format'

const PRESETS = [
  { label: '0:45', seconds: 45 },
  { label: '1:00', seconds: 60 },
  { label: '1:15', seconds: 75 },
  { label: '2:00', seconds: 120 },
  { label: '3:00', seconds: 180 },
  { label: '5:00', seconds: 300 },
]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function RestTimerOverlay() {
  const exercises = useAllExercises()
  const {
    activeWorkout,
    dismissRestTimer,
    adjustRestTimer,
    setRestPreset,
  } = useWorkoutStore()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // El tiempo restante sale siempre de restEndsAt (reloj de pared): si iOS
    // suspende la PWA con la pantalla bloqueada, al volver el contador muestra
    // lo que realmente queda en vez de haberse quedado congelado.
    const tick = () => {
      const state = useWorkoutStore.getState()
      const workout = state.activeWorkout
      if (!workout?.restTimerVisible) return

      // Un entreno guardado por una versión anterior no tiene restEndsAt.
      // Hay que fijarlo UNA vez a partir de los segundos que le quedaban: si lo
      // recalculáramos en cada tick, el descuento nunca avanzaría.
      if (!workout.restEndsAt) {
        useWorkoutStore.setState((s) => ({
          activeWorkout: s.activeWorkout
            ? { ...s.activeWorkout, restEndsAt: Date.now() + s.activeWorkout.restSecondsLeft * 1000 }
            : null,
        }))
        return
      }

      const left = Math.max(0, Math.ceil((workout.restEndsAt - Date.now()) / 1000))
      const prev = workout.restSecondsLeft
      if (left === prev) return

      if (left <= 0) {
        vibrate([150, 80, 150, 80, 300])
        playBeep(660, 250)
        setTimeout(() => playBeep(880, 300), 300)
        useWorkoutStore.setState((s) => ({
          activeWorkout: s.activeWorkout
            ? { ...s.activeWorkout, restTimerVisible: false, restSecondsLeft: 0 }
            : null,
        }))
        return
      }

      // Los avisos se disparan al cruzar el umbral, no al valer exactamente N:
      // si la app estuvo dormida el contador puede saltar varios segundos.
      if (prev > 10 && left <= 10) vibrate([80])
      if (prev > 5 && left <= 5) vibrate([100, 50, 100])
      if (prev > 3 && left <= 3) playBeep(660, 100)

      useWorkoutStore.setState((s) => ({
        activeWorkout: s.activeWorkout ? { ...s.activeWorkout, restSecondsLeft: left } : null,
      }))
    }

    intervalRef.current = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  if (!activeWorkout) return null

  const { restSecondsLeft, restTotalSeconds, lastCompletedSet } = activeWorkout
  const progress = restTotalSeconds > 0 ? (restSecondsLeft / restTotalSeconds) * 100 : 0
  const size = 200
  const strokeWidth = 10
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (progress / 100) * circumference

  const lastExercise = lastCompletedSet
    ? exercises.find((e) => e.id === lastCompletedSet.exerciseId)
    : null

  const nextExercise = (() => {
    if (!lastCompletedSet) return null
    const exIdx = activeWorkout.exercises.findIndex((e) => e.exerciseId === lastCompletedSet.exerciseId)
    if (exIdx < 0) return null
    const currentEx = activeWorkout.exercises[exIdx]
    if (!currentEx) return null
    const nextSetInSame = currentEx.sets.findIndex((s, i) => i > lastCompletedSet.setIdx && !s.completed)
    if (nextSetInSame >= 0) {
      return { exercise: exercises.find((e) => e.id === lastCompletedSet.exerciseId), setNum: nextSetInSame + 1 }
    }
    const nextEx = activeWorkout.exercises[exIdx + 1]
    if (nextEx) {
      return { exercise: exercises.find((e) => e.id === nextEx.exerciseId), setNum: 1 }
    }
    return null
  })()

  return (
    <div className="absolute inset-0 bg-background/97 backdrop-blur-sm flex flex-col items-center justify-between py-8 z-50 screen-enter">
      <div className="text-center">
        <p className="text-info font-bold text-sm tracking-widest uppercase">⏸ DESCANSANDO</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#1e1e2a"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#E8634A"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                transition: 'stroke-dashoffset 0.8s linear',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-white font-mono">{formatTime(restSecondsLeft)}</span>
          </div>
        </div>

        {lastCompletedSet && lastExercise && (
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Serie {lastCompletedSet.setIdx + 1} completada · {lastExercise.nameEs}
            </p>
            <p className="text-white font-semibold text-lg">
              {formatLoad(lastCompletedSet.kg, lastCompletedSet.reps)}
            </p>
          </div>
        )}

        {nextExercise && nextExercise.exercise && (
          <div className="bg-card border border-border rounded-xl px-6 py-3 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider">Siguiente</p>
            <p className="text-white font-semibold text-sm mt-0.5">{nextExercise.exercise.nameEs}</p>
            <p className="text-gray-500 text-xs">Serie {nextExercise.setNum}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 w-full px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => adjustRestTimer(-30)}
            className="w-14 h-14 rounded-full bg-surface border border-border text-white text-sm font-semibold hover:border-primary/40 transition-colors"
          >
            −30s
          </button>
          <button
            onClick={dismissRestTimer}
            className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 active:scale-95 transition-transform"
          >
            Saltar →
          </button>
          <button
            onClick={() => adjustRestTimer(30)}
            className="w-14 h-14 rounded-full bg-surface border border-border text-white text-sm font-semibold hover:border-primary/40 transition-colors"
          >
            +30s
          </button>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {PRESETS.map((p) => (
            <button
              key={p.seconds}
              onClick={() => setRestPreset(p.seconds)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                restTotalSeconds === p.seconds
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-surface border-border text-gray-400 hover:border-primary/40 hover:text-primary'
              }`}
            >
              {p.label}{restTotalSeconds === p.seconds ? ' ✓' : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
