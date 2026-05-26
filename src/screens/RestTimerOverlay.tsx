import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

const PRESETS = [
  { label: '0:45', seconds: 45 },
  { label: '1:00', seconds: 60 },
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
  const {
    activeWorkout,
    exercises,
    dismissRestTimer,
    adjustRestTimer,
    setRestPreset,
  } = useStore()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const state = useStore.getState()
      if (!state.activeWorkout?.restTimerVisible) return
      const left = state.activeWorkout.restSecondsLeft
      if (left <= 0) {
        useStore.setState((s) => ({
          activeWorkout: s.activeWorkout
            ? { ...s.activeWorkout, restTimerVisible: false }
            : null,
        }))
      } else {
        useStore.setState((s) => ({
          activeWorkout: s.activeWorkout
            ? { ...s.activeWorkout, restSecondsLeft: s.activeWorkout.restSecondsLeft - 1 }
            : null,
        }))
      }
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
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
              stroke="#00ff88"
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
              {lastCompletedSet.kg}kg × {lastCompletedSet.reps} reps
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
