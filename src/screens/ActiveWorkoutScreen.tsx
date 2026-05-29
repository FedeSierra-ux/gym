import { useEffect, useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { RestTimerOverlay } from './RestTimerOverlay'
import { ExerciseThumbnail } from '../components/ExerciseThumbnail'
import { vibrate } from '../utils/haptics'

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

function AdjustButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="w-6 h-7 rounded flex items-center justify-center flex-shrink-0 text-[9px] font-bold transition-all active:scale-90"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.45)',
      }}
    >
      {label}
    </button>
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
  const { exercises, routines, workouts, prs } = useStore()
  const {
    activeWorkout,
    updateSetValue,
    completeSet,
    addSetToExercise,
    removeSetFromExercise,
    finishWorkout,
    cancelWorkout,
  } = useWorkoutStore()

  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [confirmAction, setConfirmAction] = useState<'finish' | 'cancel' | null>(null)
  const [flashingSet, setFlashingSet] = useState<string | null>(null)

  useEffect(() => {
    if (!activeWorkout) return
    const start = activeWorkout.realStartedAt
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - start)
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeWorkout?.realStartedAt])

  if (!activeWorkout) return null

  const routine = routines.find((r) => r.id === activeWorkout.routineId)

  const adjust = (exIdx: number, setIdx: number, field: 'kg' | 'reps', delta: number) => {
    const currentVal = activeWorkout.exercises[exIdx]?.sets[setIdx]?.[field] ?? ''
    const current = parseFloat(currentVal) || 0
    updateSetValue(exIdx, setIdx, field, String(Math.max(0, current + delta)))
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-background screen-enter">
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
              onClick={() => setConfirmAction('cancel')}
              className="px-3 py-1.5 rounded-lg text-gray-400 text-sm border border-border hover:border-red-500/40 hover:text-red-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setConfirmAction('finish')}
              className="px-4 py-1.5 rounded-lg bg-primary text-black font-bold text-sm hover:bg-primary/90 active:scale-95 transition-transform"
            >
              Terminar
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 scroll-area px-4 py-3">
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
                {/* Exercise header */}
                <div className="p-3 border-b border-border flex items-center gap-3">
                  <ExerciseThumbnail exercise={ex} size={56} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base">{ex.nameEs}</h3>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ color: config.color, backgroundColor: config.color + '20' }}
                    >
                      {config.label}
                    </span>
                    {pr && (
                      <p className="text-xs text-gold mt-1">🏆 PR: {pr.kg}kg × {pr.reps} reps</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-white">{completedCount}/{totalSets}</p>
                    <p className="text-[10px] text-gray-500">series</p>
                  </div>
                </div>

                {/* Column headers */}
                <div className="flex items-center px-3 py-1.5 border-b border-border gap-2">
                  <span className="w-5 text-[10px] text-gray-600 font-medium flex-shrink-0">#</span>
                  <span className="flex-1 text-[10px] text-gray-600 font-medium text-center">KG</span>
                  <span className="flex-1 text-[10px] text-gray-600 font-medium text-center">REPS</span>
                  <span className="w-8 text-[10px] text-gray-600 font-medium text-center flex-shrink-0">✓</span>
                  <span className="w-6 flex-shrink-0" />
                </div>

                {/* Sets */}
                {activeEx.sets.map((set, setIdx) => {
                  const isCompleted = set.completed
                  const flashKey = `${exIdx}-${setIdx}`

                  return (
                    <div
                      key={setIdx}
                      className={`flex items-center px-3 py-2 gap-2 transition-colors ${
                        isCompleted ? 'bg-primary/5' : ''
                      } ${flashingSet === flashKey ? 'set-complete-flash' : ''}`}
                    >
                      {/* Set number */}
                      <span className={`w-5 text-sm font-bold flex-shrink-0 ${isCompleted ? 'text-primary' : 'text-gray-500'}`}>
                        {setIdx + 1}
                      </span>

                      {/* KG: − / input / + (−5kg / +2.5kg) */}
                      <div className="flex-1 flex items-center gap-1 min-w-0">
                        {!isCompleted && <AdjustButton label="−" onPress={() => adjust(exIdx, setIdx, 'kg', -5)} />}
                        <div className="flex-1 min-w-0 relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            value={set.kg}
                            onChange={(e) => updateSetValue(exIdx, setIdx, 'kg', e.target.value)}
                            placeholder="kg"
                            disabled={isCompleted}
                            className={`w-full text-center text-sm font-semibold rounded-lg py-1.5 border focus:outline-none focus:border-primary transition-colors ${
                              isCompleted ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface border-border text-white'
                            }`}
                          />
                        </div>
                        {!isCompleted && <AdjustButton label="+" onPress={() => adjust(exIdx, setIdx, 'kg', 2.5)} />}
                      </div>

                      {/* REPS: − / input / + (−1 / +1) */}
                      <div className="flex-1 flex items-center gap-1 min-w-0">
                        {!isCompleted && <AdjustButton label="−" onPress={() => adjust(exIdx, setIdx, 'reps', -1)} />}
                        <div className="flex-1 min-w-0">
                          <input
                            type="number"
                            inputMode="numeric"
                            value={set.reps}
                            onChange={(e) => updateSetValue(exIdx, setIdx, 'reps', e.target.value)}
                            placeholder="reps"
                            disabled={isCompleted}
                            className={`w-full text-center text-sm font-semibold rounded-lg py-1.5 border focus:outline-none focus:border-primary transition-colors ${
                              isCompleted ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface border-border text-white'
                            }`}
                          />
                        </div>
                        {!isCompleted && <AdjustButton label="+" onPress={() => adjust(exIdx, setIdx, 'reps', 1)} />}
                      </div>

                      {/* Complete button */}
                      <button
                        onClick={() => {
                          completeSet(exIdx, setIdx)
                          if (!isCompleted) {
                            vibrate([40, 20, 40])
                            setFlashingSet(flashKey)
                            setTimeout(() => setFlashingSet(null), 600)
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-primary text-black'
                            : 'bg-surface border border-border text-gray-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        <span className="text-sm font-bold">✓</span>
                      </button>

                      {/* Delete set */}
                      <button
                        onClick={() => removeSetFromExercise(exIdx, setIdx)}
                        disabled={isCompleted || activeEx.sets.length <= 1}
                        className="w-6 h-6 flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          color: isCompleted || activeEx.sets.length <= 1
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(255,255,255,0.2)',
                        }}
                      >
                        <span className="text-xs">✕</span>
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

      {confirmAction && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold text-lg mb-2">
              {confirmAction === 'finish' ? '¿Terminar entreno?' : '¿Cancelar entreno?'}
            </h3>
            {confirmAction === 'cancel' && (
              <p className="text-gray-400 text-sm mb-4">Se perderá todo el progreso de esta sesión.</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 rounded-xl border border-border text-gray-400 text-sm font-medium hover:border-gray-500 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  setConfirmAction(null)
                  if (confirmAction === 'finish') finishWorkout()
                  else cancelWorkout()
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                  confirmAction === 'finish'
                    ? 'bg-primary text-black hover:bg-primary/90'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                }`}
              >
                {confirmAction === 'finish' ? '✓ Terminar' : '✕ Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
