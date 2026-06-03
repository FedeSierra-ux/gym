import { useEffect, useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { RestTimerOverlay } from './RestTimerOverlay'
import type { Exercise } from '../types'

function ExerciseImage({ exercise, color, size }: { exercise: Exercise; color: string; size: number }) {
  const [failed, setFailed] = useState(false)
  const cls = `w-${size} h-${size} rounded-xl flex-shrink-0`

  if (exercise.image && !failed) {
    return (
      <div className={`${cls} overflow-hidden`} style={{ backgroundColor: color + '15' }}>
        <img
          src={exercise.image}
          alt={exercise.nameEs}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`${cls} flex items-center justify-center`}
      style={{ backgroundColor: color + '15' }}
      dangerouslySetInnerHTML={{ __html: exercise.icon.replace('viewBox', `width="${size * 4}" height="${size * 4}" viewBox`) }}
    />
  )
}

function TipsRow({ exerciseId }: { exerciseId: string }) {
  const { exerciseTips, setExerciseTip } = useStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(exerciseTips[exerciseId] ?? '')
  const tip = exerciseTips[exerciseId]

  const handleSave = () => {
    setExerciseTip(exerciseId, draft.trim())
    setOpen(false)
  }

  return (
    <div className="border-t border-border">
      {!open ? (
        <button
          onClick={() => { setDraft(tip ?? ''); setOpen(true) }}
          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
        >
          <span className="text-sm">📝</span>
          <span className={`flex-1 text-xs ${tip ? 'text-gray-300' : 'text-gray-600'}`}>
            {tip || 'Agregar tip / recordatorio de técnica...'}
          </span>
          <span className="text-[10px] text-gray-600">{tip ? '✏️' : '＋'}</span>
        </button>
      ) : (
        <div className="px-3 py-2 flex flex-col gap-2">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ej: Escápulas retraídas, bajar lento 3s, codos a 45°..."
            rows={3}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 px-3 py-1 rounded-lg border border-border hover:border-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="text-xs font-bold text-black bg-primary px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Guardar
            </button>
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

export function ActiveWorkoutScreen() {
  const {
    activeWorkout,
    exercises,
    routines,
    workouts,
    updateSetValue,
    completeSet,
    addSetToExercise,
    finishWorkout,
    cancelWorkout,
    prs,
  } = useStore()

  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!activeWorkout) return
    const start = activeWorkout.startedAt
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - start)
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeWorkout?.startedAt])

  if (!activeWorkout) return null

  const routine = routines.find((r) => r.id === activeWorkout.routineId)

  const handleFinish = () => {
    if (confirm('¿Terminar el entrenamiento?')) {
      finishWorkout()
    }
  }

  const handleCancel = () => {
    if (confirm('¿Cancelar el entrenamiento? Se perderá el progreso.')) {
      cancelWorkout()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background screen-enter">
      <div className="flex-shrink-0 px-4 pt-12 pb-3 bg-surface border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              {routine?.emoji} {routine?.name}
            </h1>
            <p className="text-info font-mono text-sm font-semibold">{formatElapsed(elapsed)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg text-gray-400 text-sm border border-border hover:border-red-500/40 hover:text-red-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-1.5 rounded-lg bg-primary text-black font-bold text-sm hover:bg-primary/90 active:scale-95 transition-transform"
            >
              Terminar
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 scroll-area px-4 py-3">
        <div className="flex flex-col gap-4">
          {activeWorkout.exercises.map((activeEx, exIdx) => {
            const ex = exercises.find((e) => e.id === activeEx.exerciseId)
            if (!ex) return null
            const config = muscleGroupConfig[ex.muscleGroup]

            const pr = prs.find((p) => p.exerciseId === ex.id)

            const prevWorkout = [...workouts]
              .filter((w) => w.routineId === activeWorkout.routineId && w.finishedAt)
              .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0]
            const prevSets = prevWorkout?.exercises.find((e) => e.exerciseId === ex.id)?.sets ?? []

            const completedCount = activeEx.sets.filter((s) => s.completed).length
            const totalSets = activeEx.sets.length

            return (
              <div key={activeEx.exerciseId} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-3 border-b border-border flex items-center gap-3">
                  <ExerciseImage exercise={ex} color={config.color} size={16} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base">{ex.nameEs}</h3>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ color: config.color, backgroundColor: config.color + '20' }}
                    >
                      {config.label}
                    </span>
                    {pr && (
                      <p className="text-xs text-gold mt-1">
                        🏆 PR: {pr.kg}kg × {pr.reps} reps
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{completedCount}/{totalSets}</p>
                    <p className="text-[10px] text-gray-500">series</p>
                  </div>
                </div>

                <div className="grid grid-cols-[32px_1fr_72px_72px_40px] gap-2 px-3 py-2 border-b border-border">
                  <span className="text-[10px] text-gray-600 font-medium">SET</span>
                  <span className="text-[10px] text-gray-600 font-medium">ANTERIOR</span>
                  <span className="text-[10px] text-gray-600 font-medium text-center">KG</span>
                  <span className="text-[10px] text-gray-600 font-medium text-center">REPS</span>
                  <span className="text-[10px] text-gray-600 font-medium text-center">✓</span>
                </div>

                {activeEx.sets.map((set, setIdx) => {
                  const prev = prevSets[setIdx]
                  return (
                    <div
                      key={setIdx}
                      className={`grid grid-cols-[32px_1fr_72px_72px_40px] gap-2 px-3 py-2 items-center transition-colors ${
                        set.completed ? 'bg-primary/5' : ''
                      }`}
                    >
                      <span className={`text-sm font-bold ${set.completed ? 'text-primary' : 'text-gray-500'}`}>
                        {setIdx + 1}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {prev ? `${prev.kg}kg×${prev.reps}` : '—'}
                      </span>
                      <input
                        type="number"
                        value={set.kg}
                        onChange={(e) => updateSetValue(exIdx, setIdx, 'kg', e.target.value)}
                        placeholder="0"
                        disabled={set.completed}
                        className={`w-full text-center text-sm font-semibold rounded-lg py-1.5 border focus:outline-none focus:border-primary transition-colors ${
                          set.completed
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-surface border-border text-white'
                        }`}
                      />
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSetValue(exIdx, setIdx, 'reps', e.target.value)}
                        placeholder="0"
                        disabled={set.completed}
                        className={`w-full text-center text-sm font-semibold rounded-lg py-1.5 border focus:outline-none focus:border-primary transition-colors ${
                          set.completed
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-surface border-border text-white'
                        }`}
                      />
                      <button
                        onClick={() => completeSet(exIdx, setIdx)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                          set.completed
                            ? 'bg-primary text-black'
                            : 'bg-surface border border-border text-gray-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        <span className="text-sm font-bold">✓</span>
                      </button>
                    </div>
                  )
                })}

                {prevSets.length > 0 && (
                  <div className="px-3 py-2 bg-surface/50">
                    <p className="text-[10px] text-gray-600">
                      💡 Última vez: {prevSets[0]?.kg}kg × {prevSets[0]?.reps} reps
                    </p>
                  </div>
                )}

                <TipsRow exerciseId={ex.id} />

                <div className="px-3 py-2 border-t border-border">
                  <button
                    onClick={() => addSetToExercise(exIdx)}
                    className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>Agregar serie</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-8" />
      </div>

      {activeWorkout.restTimerVisible && <RestTimerOverlay />}
    </div>
  )
}
