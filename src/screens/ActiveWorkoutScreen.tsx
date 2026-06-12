import { useEffect, useState, useRef } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { RestTimerOverlay } from './RestTimerOverlay'
import { CircularRing } from '../components/CircularRing'
import { ExerciseThumbnail } from '../components/ExerciseThumbnail'
import { ExerciseModal } from '../components/ExerciseModal'
import { vibrate } from '../utils/haptics'
import type { Exercise } from '../types'

const S = {
  bg: '#0C0E14', surf: '#161821', surf2: '#1C1F2A',
  ink: '#ECEEF4', dim: '#737A8C', faint: '#3B3F4E',
  acc: '#E8634A', acc2: '#F2A93B',
  line: 'rgba(236,238,244,0.07)', line2: 'rgba(236,238,244,0.12)',
}

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
          className="w-full flex items-center gap-2 px-3 py-2 text-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          <span style={{ fontSize: 13 }}>📝</span>
          <span style={{ flex: 1, fontSize: 11, color: tip ? S.dim : S.faint }}>{tip || 'Agregar tip / recordatorio de técnica...'}</span>
          <span style={{ fontSize: 10, color: S.faint }}>{tip ? '✏️' : '+'}</span>
        </button>
      ) : (
        <div style={{ padding: '8px 12px 12px' }} className="flex flex-col gap-2">
          <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder="Ej: Escápulas retraídas, bajar lento 3s..."
            rows={3}
            style={{ width: '100%', background: S.surf2, border: `1px solid ${S.line2}`, borderRadius: 8, padding: '8px 12px', fontSize: 11, color: S.ink, fontFamily: 'DM Sans, system-ui, sans-serif', outline: 'none', resize: 'none' }}
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

function AdjustButton({ label, onPress, ariaLabel }: { label: string; onPress: () => void; ariaLabel?: string }) {
  return (
    <button onClick={onPress} aria-label={ariaLabel}
      style={{ width: 22, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700, background: S.surf2, border: `1px solid ${S.line2}`, color: S.dim, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
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
    <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-center px-4 pt-2" style={{ pointerEvents: 'none' }}>
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full max-w-sm screen-enter"
        style={{ background: 'rgba(242,169,59,0.15)', border: `1px solid rgba(242,169,59,0.4)`, pointerEvents: 'auto' }}>
        <span style={{ fontSize: 24 }}>🏆</span>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: S.acc2 }}>¡Nuevo PR!</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: S.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {ex?.nameEs ?? ''} — {kg}kg × {reps} reps
          </p>
          {reps > 1 && <p style={{ fontSize: 10, color: S.acc2, opacity: 0.75, marginTop: 2 }}>~1RM estimado: {estimate1RM(kg, reps)}kg</p>}
        </div>
        <button onClick={onDismiss} style={{ color: S.dim, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
      </div>
    </div>
  )
}

export function ActiveWorkoutScreen() {
  const { routines, workouts, prs } = useStore()
  const exercises = useAllExercises()
  const {
    activeWorkout, updateSetValue, completeSet, addSetToExercise, removeSetFromExercise,
    toggleWarmup, dismissLivePr, finishWorkout, cancelWorkout,
  } = useWorkoutStore()

  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [modalExercise, setModalExercise] = useState<Exercise | null>(null)
  const [confirmAction, setConfirmAction] = useState<'finish' | 'cancel' | null>(null)
  const [flashingSet, setFlashingSet] = useState<string | null>(null)
  const [plateHintFor, setPlateHintFor] = useState<string | null>(null)

  const realStartedAt = activeWorkout?.realStartedAt
  useEffect(() => {
    if (!realStartedAt) return
    intervalRef.current = setInterval(() => setElapsed(Date.now() - realStartedAt), 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [realStartedAt])

  if (!activeWorkout) return null

  const routine = routines.find((r) => r.id === activeWorkout.routineId)
  const totalSets = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.filter(s => !s.isWarmup).length, 0)
  const completedSets = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed && !s.isWarmup).length, 0)
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  const adjust = (exIdx: number, setIdx: number, field: 'kg' | 'reps', delta: number) => {
    const currentVal = activeWorkout.exercises[exIdx]?.sets[setIdx]?.[field] ?? ''
    const current = parseFloat(currentVal) || 0
    updateSetValue(exIdx, setIdx, field, String(Math.max(0, current + delta)))
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col screen-enter relative" style={{ background: S.bg }}>

      {/* Live PR banner */}
      {activeWorkout.livePr && (
        <LivePrBanner exerciseId={activeWorkout.livePr.exerciseId} kg={activeWorkout.livePr.kg} reps={activeWorkout.livePr.reps} onDismiss={dismissLivePr} />
      )}

      {/* Header */}
      <div style={{ flexShrink: 0, padding: '54px 22px 16px', borderBottom: `1px solid ${S.line2}` }}>
        <div className="flex items-center justify-between">
          <div style={{ fontSize: 13, color: S.dim, fontWeight: 500 }}>
            {routine?.emoji} {routine?.name} · En curso
          </div>
          <div style={{ fontSize: 12, color: S.acc, fontWeight: 600, background: 'rgba(232,99,74,0.12)', padding: '4px 10px', borderRadius: 20 }}>
            ● {formatElapsed(elapsed)}
          </div>
        </div>
        <div className="flex items-center gap-4" style={{ marginTop: 12 }}>
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
      </div>

      {/* Exercise list */}
      <div className="flex-1 min-h-0 scroll-area">
        {activeWorkout.exercises.map((activeEx, exIdx) => {
          const ex = exercises.find((e) => e.id === activeEx.exerciseId)
          if (!ex) return null
          const config = muscleGroupConfig[ex.muscleGroup]
          const pr = prs.find((p) => p.exerciseId === ex.id)
          const isBarbellLike = ex.equipmentType === 'barra'
          const prevWorkout = [...workouts].filter((w) => w.routineId === activeWorkout.routineId && w.finishedAt).sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0]
          const prevSets = prevWorkout?.exercises.find((e) => e.exerciseId === ex.id)?.sets ?? []
          const completedCount = activeEx.sets.filter((s) => s.completed).length

          return (
            <div key={activeEx.exerciseId} style={{ margin: '12px 16px 0', background: S.surf, borderRadius: 16, overflow: 'hidden', border: `1px solid ${S.line2}` }}>

              {/* Exercise header */}
              <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: S.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: S.acc, border: `1px solid ${S.line2}`, flexShrink: 0 }}>
                  {exIdx + 1}
                </div>
                <button onClick={() => setModalExercise(ex)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <ExerciseThumbnail exercise={ex} size={36} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: S.ink }}>{ex.nameEs}</div>
                  <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>
                    <span style={{ color: config.color }}>{config.label}</span>
                    {pr && <span style={{ color: S.acc2 }}> · 🏆 {pr.kg}×{pr.reps}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: completedCount === activeEx.sets.length && activeEx.sets.length > 0 ? S.acc : S.dim }}>
                  {completedCount}/{activeEx.sets.length}
                </div>
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 1fr 56px', padding: '0 12px 6px', gap: 6 }}>
                {['Set', 'KG', 'Reps', ''].map((h, i) => (
                  <div key={h + i} style={{ fontSize: 10, fontWeight: 600, color: S.faint, textAlign: i === 0 ? 'center' : i < 3 ? 'center' : 'center' }}>{h}</div>
                ))}
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
                const canDelete = !isCompleted && activeEx.sets.length > 1
                return (
                  <div key={setIdx}>
                    <div
                      className={flashingSet === flashKey ? 'set-complete-flash' : ''}
                      style={{
                        display: 'grid', gridTemplateColumns: '44px 1fr 1fr 56px',
                        alignItems: 'stretch', padding: '0 12px', gap: 6,
                        background: isCompleted ? (isWarmup ? 'rgba(56,189,248,0.05)' : 'rgba(232,99,74,0.05)') : 'transparent',
                        borderTop: `1px solid ${S.line}`,
                        minHeight: 52,
                      }}
                    >
                      {/* Set # + delete */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <button onClick={() => !isCompleted && toggleWarmup(exIdx, setIdx)}
                          style={{ background: 'none', border: 'none', cursor: isCompleted ? 'default' : 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: isCompleted ? (isWarmup ? '#60A5FA' : S.acc) : S.dim }}>{setIdx + 1}</span>
                          {isWarmup && <span style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(96,165,250,0.8)', lineHeight: 1 }}>W</span>}
                        </button>
                        {canDelete && (
                          <button onClick={() => removeSetFromExercise(exIdx, setIdx)}
                            style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: S.faint, fontSize: 9, fontFamily: 'inherit', lineHeight: 1 }}>
                            ✕
                          </button>
                        )}
                      </div>

                      {/* KG */}
                      <div className="flex items-center gap-1" style={{ paddingTop: 8, paddingBottom: 8 }}>
                        {!isCompleted && <AdjustButton label="−" ariaLabel="Reducir kg" onPress={() => adjust(exIdx, setIdx, 'kg', -5)} />}
                        <input type="number" inputMode="decimal" value={set.kg}
                          onChange={(e) => updateSetValue(exIdx, setIdx, 'kg', e.target.value)}
                          onFocus={() => { if (isBarbellLike) setPlateHintFor(plateKey) }}
                          onBlur={() => setTimeout(() => setPlateHintFor(null), 200)}
                          placeholder="kg" disabled={isCompleted}
                          style={{
                            flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700,
                            borderRadius: 8, padding: '7px 2px',
                            background: isCompleted ? (isWarmup ? 'rgba(96,165,250,0.1)' : 'rgba(232,99,74,0.1)') : S.surf2,
                            border: `1px solid ${isCompleted ? (isWarmup ? 'rgba(96,165,250,0.2)' : 'rgba(232,99,74,0.2)') : S.line2}`,
                            color: isCompleted ? (isWarmup ? '#60A5FA' : S.acc) : S.ink,
                            fontFamily: 'DM Sans, system-ui, sans-serif',
                            outline: 'none', minWidth: 0,
                          }}
                        />
                        {!isCompleted && <AdjustButton label="+" ariaLabel="Aumentar kg" onPress={() => adjust(exIdx, setIdx, 'kg', 2.5)} />}
                      </div>

                      {/* Reps */}
                      <div className="flex items-center gap-1" style={{ paddingTop: 8, paddingBottom: 8 }}>
                        {!isCompleted && <AdjustButton label="−" ariaLabel="Reducir reps" onPress={() => adjust(exIdx, setIdx, 'reps', -1)} />}
                        <input type="number" inputMode="numeric" value={set.reps}
                          onChange={(e) => updateSetValue(exIdx, setIdx, 'reps', e.target.value)}
                          placeholder="reps" disabled={isCompleted}
                          style={{
                            flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700,
                            borderRadius: 8, padding: '7px 2px',
                            background: isCompleted ? (isWarmup ? 'rgba(96,165,250,0.1)' : 'rgba(232,99,74,0.1)') : S.surf2,
                            border: `1px solid ${isCompleted ? (isWarmup ? 'rgba(96,165,250,0.2)' : 'rgba(232,99,74,0.2)') : S.line2}`,
                            color: isCompleted ? (isWarmup ? '#60A5FA' : S.acc) : S.ink,
                            fontFamily: 'DM Sans, system-ui, sans-serif',
                            outline: 'none', minWidth: 0,
                          }}
                        />
                        {!isCompleted && <AdjustButton label="+" ariaLabel="Aumentar reps" onPress={() => adjust(exIdx, setIdx, 'reps', 1)} />}
                      </div>

                      {/* ✓ Completar — full height, prominent */}
                      <button
                        aria-label={isCompleted ? 'Desmarcar serie' : 'Completar serie'}
                        onClick={() => {
                          completeSet(exIdx, setIdx)
                          if (!isCompleted) { vibrate([40, 20, 40]); setFlashingSet(flashKey); setTimeout(() => setFlashingSet(null), 600) }
                        }}
                        style={{
                          width: '100%', minHeight: 52, borderRadius: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isCompleted
                            ? (isWarmup ? '#60A5FA' : S.acc)
                            : 'rgba(232,99,74,0.08)',
                          border: `2px solid ${isCompleted
                            ? (isWarmup ? '#60A5FA' : S.acc)
                            : 'rgba(232,99,74,0.35)'}`,
                          color: isCompleted ? '#fff' : S.acc,
                          fontSize: 20, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                          alignSelf: 'stretch',
                          marginTop: 6, marginBottom: 6,
                        }}
                      >✓</button>
                    </div>

                    {/* Plate hint */}
                    {showPlate && (
                      <div style={{ padding: '6px 16px', fontSize: 10, color: S.dim, background: 'rgba(236,238,244,0.02)', borderTop: `1px solid ${S.line}` }}>
                        🏋️ {getPlates(kg)}
                      </div>
                    )}

                    {/* 1RM hint */}
                    {orm !== null && (
                      <div style={{ paddingLeft: 16, paddingBottom: 4, marginTop: -2 }}>
                        <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(52,211,153,0.5)' }}>~1RM: {orm}kg</span>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Previous session hint */}
              {prevSets.length > 0 && (
                <div style={{ padding: '8px 16px 6px', borderTop: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, color: S.faint, flexShrink: 0 }}>💡 Última:</span>
                  {prevSets.filter(s => !s.isWarmup).slice(0, 4).map((s, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 600, color: S.dim, background: S.surf2, padding: '2px 8px', borderRadius: 6, border: `1px solid ${S.line2}` }}>
                      {s.kg}×{s.reps}
                    </span>
                  ))}
                </div>
              )}

              <TipsRow exerciseId={ex.id} />

              {/* Add set buttons */}
              <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => addSetToExercise(exIdx)}
                  style={{ background: S.surf2, border: `1px solid ${S.line2}`, borderRadius: 10, color: S.dim, fontSize: 12, fontWeight: 600, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Serie
                </button>
                <button
                  onClick={() => { const newIdx = activeEx.sets.length; addSetToExercise(exIdx); setTimeout(() => toggleWarmup(exIdx, newIdx), 0) }}
                  style={{ background: 'transparent', border: `1px solid rgba(96,165,250,0.2)`, borderRadius: 10, color: 'rgba(96,165,250,0.6)', fontSize: 12, fontWeight: 600, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Calent.
                </button>
              </div>
            </div>
          )
        })}
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
