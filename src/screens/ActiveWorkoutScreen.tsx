import { useEffect, useState, useRef } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { RestTimerOverlay } from './RestTimerOverlay'
import { ExerciseThumbnail } from '../components/ExerciseThumbnail'
import { vibrate } from '../utils/haptics'

// Epley 1RM formula
function estimate1RM(kg: number, reps: number): number {
  if (reps === 1) return kg
  return Math.round(kg * (1 + reps / 30))
}

// Plate calculator (assumes 20kg Olympic bar)
const BAR_KG = 20
const PLATES = [20, 15, 10, 5, 2.5, 1.25]

function getPlates(totalKg: number): string {
  const perSide = (totalKg - BAR_KG) / 2
  if (perSide <= 0) return `Solo barra (${BAR_KG}kg)`
  const result: string[] = []
  let remaining = perSide
  for (const p of PLATES) {
    const count = Math.floor(remaining / p + 0.001)
    if (count > 0) {
      result.push(`${count}×${p}kg`)
      remaining -= count * p
    }
  }
  return result.length ? result.join(' + ') + ' / lado' : `${perSide}kg / lado`
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

function AdjustButton({ label, onPress, ariaLabel }: { label: string; onPress: () => void; ariaLabel?: string }) {
  return (
    <button
      onClick={onPress}
      aria-label={ariaLabel}
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
    <div
      className="absolute top-0 left-0 right-0 z-40 flex items-center justify-center px-4 pt-2"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full max-w-sm screen-enter"
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.18) 0%, rgba(255,165,0,0.12) 100%)',
          border: '1px solid rgba(255,215,0,0.4)',
          boxShadow: '0 4px 24px rgba(255,215,0,0.2)',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'auto',
        }}
      >
        <span className="text-2xl">🏆</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FFD700' }}>
            ¡Nuevo PR!
          </p>
          <p className="text-white text-sm font-semibold truncate">
            {ex?.nameEs ?? ''} — {kg}kg × {reps} reps
          </p>
          {reps > 1 && (
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,215,0,0.7)' }}>
              ~1RM estimado: {estimate1RM(kg, reps)}kg
            </p>
          )}
        </div>
        <button onClick={onDismiss} style={{ color: 'rgba(255,255,255,0.4)', pointerEvents: 'auto' }}>
          <span className="text-xs">✕</span>
        </button>
      </div>
    </div>
  )
}

export function ActiveWorkoutScreen() {
  const { routines, workouts, prs } = useStore()
  const exercises = useAllExercises()
  const {
    activeWorkout,
    updateSetValue,
    completeSet,
    addSetToExercise,
    removeSetFromExercise,
    toggleWarmup,
    dismissLivePr,
    finishWorkout,
    cancelWorkout,
  } = useWorkoutStore()

  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [confirmAction, setConfirmAction] = useState<'finish' | 'cancel' | null>(null)
  const [flashingSet, setFlashingSet] = useState<string | null>(null)
  const [plateHintFor, setPlateHintFor] = useState<string | null>(null)

  const realStartedAt = activeWorkout?.realStartedAt
  useEffect(() => {
    if (!realStartedAt) return
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - realStartedAt)
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [realStartedAt])

  if (!activeWorkout) return null

  const routine = routines.find((r) => r.id === activeWorkout.routineId)

  const totalSets = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.filter(s => !s.isWarmup).length, 0)
  const completedSets = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed && !s.isWarmup).length, 0)
  const totalVolume = activeWorkout.exercises.reduce((a, ex) =>
    a + ex.sets.filter(s => s.completed && !s.isWarmup).reduce((b, s) => b + (parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0), 0), 0)
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  const adjust = (exIdx: number, setIdx: number, field: 'kg' | 'reps', delta: number) => {
    const currentVal = activeWorkout.exercises[exIdx]?.sets[setIdx]?.[field] ?? ''
    const current = parseFloat(currentVal) || 0
    updateSetValue(exIdx, setIdx, field, String(Math.max(0, current + delta)))
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-background screen-enter relative">
      {/* Live PR banner */}
      {activeWorkout.livePr && (
        <LivePrBanner
          exerciseId={activeWorkout.livePr.exerciseId}
          kg={activeWorkout.livePr.kg}
          reps={activeWorkout.livePr.reps}
          onDismiss={dismissLivePr}
        />
      )}

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

      <div
        className="flex-shrink-0 px-4 py-2 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-bold text-white">{completedSets}</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>/ {totalSets} series</span>
        </div>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progressPct}%`, background: 'var(--primary)', boxShadow: progressPct > 0 ? '0 0 8px rgba(0,255,136,0.5)' : undefined }}
          />
        </div>
        {totalVolume > 0 && (
          <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'rgba(0,255,136,0.7)' }}>
            {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 scroll-area px-4 py-3">
        <div className="flex flex-col gap-4">
          {activeWorkout.exercises.map((activeEx, exIdx) => {
            const ex = exercises.find((e) => e.id === activeEx.exerciseId)
            if (!ex) return null
            const config = muscleGroupConfig[ex.muscleGroup]
            const pr = prs.find((p) => p.exerciseId === ex.id)
            const isBarbellLike = ex.equipmentType === 'barra'

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
                      <p className="text-xs text-gold mt-1">
                        🏆 PR: {pr.kg}kg × {pr.reps} reps
                        {pr.reps > 1 ? ` · ~${estimate1RM(pr.kg, pr.reps)}kg 1RM` : ''}
                      </p>
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
                  const isWarmup = !!set.isWarmup
                  const flashKey = `${exIdx}-${setIdx}`
                  const kg = parseFloat(set.kg) || 0
                  const reps = parseInt(set.reps) || 0
                  const orm = isCompleted && !isWarmup && kg > 0 && reps > 1 ? estimate1RM(kg, reps) : null
                  const plateKey = `${exIdx}-${setIdx}`
                  const showPlate = plateHintFor === plateKey && isBarbellLike && kg >= BAR_KG

                  return (
                    <div key={setIdx}>
                      <div
                        className={`flex items-center px-3 py-2 gap-2 transition-colors ${
                          isCompleted ? (isWarmup ? 'bg-blue-500/5' : 'bg-primary/5') : ''
                        } ${flashingSet === flashKey ? 'set-complete-flash' : ''}`}
                      >
                        {/* Set number + warmup indicator */}
                        <div className="w-5 flex flex-col items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => !isCompleted && toggleWarmup(exIdx, setIdx)}
                            className="flex flex-col items-center"
                            title={isWarmup ? 'Serie de calentamiento (toca para cambiar)' : 'Serie de trabajo (toca para marcar calent.)'}
                          >
                            <span className={`text-sm font-bold leading-none ${isCompleted ? (isWarmup ? 'text-blue-400' : 'text-primary') : 'text-gray-500'}`}>
                              {setIdx + 1}
                            </span>
                            {isWarmup && (
                              <span className="text-[7px] font-bold uppercase leading-none mt-0.5" style={{ color: 'rgba(96,165,250,0.8)' }}>
                                W
                              </span>
                            )}
                          </button>
                        </div>

                        {/* KG */}
                        <div className="flex-1 flex items-center gap-1 min-w-0">
                          {!isCompleted && <AdjustButton label="−" ariaLabel="Reducir kg" onPress={() => adjust(exIdx, setIdx, 'kg', -5)} />}
                          <div className="flex-1 min-w-0">
                            <input
                              type="number"
                              inputMode="decimal"
                              value={set.kg}
                              onChange={(e) => updateSetValue(exIdx, setIdx, 'kg', e.target.value)}
                              onFocus={() => {
                                if (isBarbellLike) setPlateHintFor(plateKey)
                              }}
                              onBlur={() => setTimeout(() => setPlateHintFor(null), 200)}
                              placeholder="kg"
                              disabled={isCompleted}
                              className={`w-full text-center text-sm font-semibold rounded-lg py-1.5 border focus:outline-none focus:border-primary transition-colors ${
                                isCompleted
                                  ? isWarmup
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                                    : 'bg-primary/10 border-primary/20 text-primary'
                                  : 'bg-surface border-border text-white'
                              }`}
                            />
                          </div>
                          {!isCompleted && <AdjustButton label="+" ariaLabel="Aumentar kg" onPress={() => adjust(exIdx, setIdx, 'kg', 2.5)} />}
                        </div>

                        {/* REPS */}
                        <div className="flex-1 flex items-center gap-1 min-w-0">
                          {!isCompleted && <AdjustButton label="−" ariaLabel="Reducir reps" onPress={() => adjust(exIdx, setIdx, 'reps', -1)} />}
                          <div className="flex-1 min-w-0">
                            <input
                              type="number"
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(e) => updateSetValue(exIdx, setIdx, 'reps', e.target.value)}
                              placeholder="reps"
                              disabled={isCompleted}
                              className={`w-full text-center text-sm font-semibold rounded-lg py-1.5 border focus:outline-none focus:border-primary transition-colors ${
                                isCompleted
                                  ? isWarmup
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                                    : 'bg-primary/10 border-primary/20 text-primary'
                                  : 'bg-surface border-border text-white'
                              }`}
                            />
                          </div>
                          {!isCompleted && <AdjustButton label="+" ariaLabel="Aumentar reps" onPress={() => adjust(exIdx, setIdx, 'reps', 1)} />}
                        </div>

                        {/* Complete button */}
                        <button
                          aria-label={isCompleted ? 'Desmarcar serie' : 'Completar serie'}
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
                              ? isWarmup
                                ? 'border border-blue-400/40 text-blue-400'
                                : 'bg-primary text-black'
                              : 'bg-surface border border-border text-gray-600 hover:border-primary hover:text-primary'
                          }`}
                        >
                          <span className="text-sm font-bold">✓</span>
                        </button>

                        {/* Delete set */}
                        <button
                          onClick={() => removeSetFromExercise(exIdx, setIdx)}
                          disabled={isCompleted || activeEx.sets.length <= 1}
                          aria-label="Eliminar serie"
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

                      {/* Plate calculator hint */}
                      {showPlate && (
                        <div
                          className="px-3 py-1.5 text-[11px] font-medium"
                          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          🏋️ {getPlates(kg)}
                        </div>
                      )}

                      {/* 1RM estimate for completed working sets */}
                      {orm !== null && (
                        <div className="px-3 pb-1" style={{ marginTop: -2 }}>
                          <span className="text-[10px] font-medium" style={{ color: 'rgba(0,255,136,0.45)' }}>
                            ~1RM: {orm}kg
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {prevSets.length > 0 && (
                  <div className="px-3 py-2 bg-surface/50 border-t border-border">
                    <p className="text-[10px] text-gray-600">
                      💡 Última vez: {prevSets[0]?.kg}kg × {prevSets[0]?.reps} reps
                    </p>
                  </div>
                )}

                <TipsRow exerciseId={ex.id} />

                <div className="px-3 py-2 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => addSetToExercise(exIdx)}
                    className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>Agregar serie</span>
                  </button>
                  <button
                    onClick={() => {
                      const newIdx = activeEx.sets.length
                      addSetToExercise(exIdx)
                      setTimeout(() => toggleWarmup(exIdx, newIdx), 0)
                    }}
                    className="text-xs text-gray-600 hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>Calent.</span>
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
