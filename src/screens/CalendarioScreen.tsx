import { useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { isDurationExercise, durationUnit, formatDuration, totalSeconds, fromSeconds, toSeconds } from '../utils/duration'
import { toDateInputValue } from '../utils/dates'
import { formatLoad } from '../utils/format'
import { decimalInputProps, integerInputProps, parseDecimal } from '../utils/numberInput'
import { getWorkoutStreak } from '../utils/streak'
import { MonthCalendar } from '../components/MonthCalendar'
import { monthStats, plannedDowSet } from '../utils/trainingDays'
import type { CalendarSubTab, Routine, Workout } from '../types'
import { S } from '../theme'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DOW_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

type SelectedDay = { day: number; month: number; year: number }


function DaySheet({
  selectedDay, allWorkouts, routines, onClose, onStartWorkout,
}: {
  selectedDay: SelectedDay; allWorkouts: Workout[]; routines: Routine[]
  onClose: () => void; onStartWorkout: (routineId: string, dateOverride?: number) => void
}) {
  const { deleteWorkout, restoreWorkout, addUndoToast, getArchivedRoutineName } = useStore()
  const exercises = useAllExercises()
  const [showRoutinePicker, setShowRoutinePicker] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const { day, month, year } = selectedDay
  const dayWorkouts = allWorkouts.filter((w) => {
    if (!w.finishedAt) return false
    const d = new Date(w.startedAt)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
  })
  const date = new Date(year, month, day)
  const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0)
  const isToday = date.toDateString() === new Date().toDateString()
  const isFuture = date.getTime() > todayMidnight.getTime()
  const dateLabel = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  /**
   * Borrar deja un aviso con "Deshacer" en vez de pedir confirmación antes.
   * Es más rápido para el caso normal y sigue habiendo red si te equivocaste.
   */
  const borrarConDeshacer = (w: Workout) => {
    const nombre = (routines.find((r) => r.id === w.routineId) ?? getArchivedRoutineName(w.routineId))?.name ?? 'el entreno'
    deleteWorkout(w.id)
    addUndoToast(`Se borró ${nombre} del ${new Date(w.startedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`, () => restoreWorkout(w))
  }

  const handleStart = (routineId: string) => {
    const dateOverride = isToday ? undefined : new Date(year, month, day, 12, 0, 0).getTime()
    onStartWorkout(routineId, dateOverride)
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl px-4 pt-4 pb-8 max-h-[80vh] flex flex-col sheet-enter"
        style={{ background: S.surf, borderTop: `1px solid ${S.line2}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 40, height: 4, background: S.surf2, borderRadius: 2, margin: '0 auto 16px' }} />
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h3 style={{ fontWeight: 700, color: S.ink, fontSize: 17, textTransform: 'capitalize' }}>{dateLabel}</h3>
            {isToday && <p style={{ color: S.acc, fontSize: 12, fontWeight: 600 }}>Hoy</p>}
          </div>
          <button onClick={onClose} style={{ color: S.dim, fontSize: 22, lineHeight: 1, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
        {showRoutinePicker ? (
          <>
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <button onClick={() => setShowRoutinePicker(false)} style={{ color: S.dim, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>‹ Volver</button>
              <p style={{ fontSize: 13, fontWeight: 600, color: S.ink }}>Elegí una rutina</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
              {routines.filter(r => r.exercises.length > 0).length === 0 ? (
                <p style={{ color: S.dim, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No tenés rutinas con ejercicios aún</p>
              ) : routines.filter(r => r.exercises.length > 0).map((r) => (
                <button key={r.id} onClick={() => handleStart(r.id)}
                  style={{ background: S.surf2, border: `1px solid ${S.line2}`, borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%', cursor: 'pointer' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 600, color: S.ink, fontSize: 13 }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: S.dim }}>{r.exercises.length} ejercicios</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {dayWorkouts.length === 0 ? (
                <p style={{ color: S.dim, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Sin actividad registrada</p>
              ) : (
                <div className="flex flex-col gap-2 pb-2">
                  {dayWorkouts.map((w) => {
                    const routine = routines.find((r) => r.id === w.routineId) ?? getArchivedRoutineName(w.routineId)
                    const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0)
                    return (
                      <div key={w.id} style={{ background: S.surf2, border: `1px solid ${S.line2}`, borderRadius: 12, padding: 12 }}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p style={{ fontWeight: 600, color: S.ink, fontSize: 13 }}>{routine?.emoji} {routine?.name ?? 'Rutina eliminada'}</p>
                            <p style={{ fontSize: 11, color: S.dim }}>{w.exercises.length} ejercicios · {totalSets} series · {w.durationMin ?? 0}min</p>
                          </div>
                          <button
                            onClick={() => setEditingWorkout(w)}
                            aria-label="Editar este entreno"
                            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.dim, fontSize: 15, background: 'none', border: 'none', cursor: 'pointer' }}
                          >✏️</button>
                          <button
                            onClick={() => borrarConDeshacer(w)}
                            aria-label="Borrar este entreno"
                            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.dim, fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }}
                          >🗑</button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {w.exercises.slice(0, 4).map((we) => {
                            const ex = exercises.find((e) => e.id === we.exerciseId)
                            if (!ex) return null
                            const best = we.sets.length > 0 ? we.sets.reduce((a, s) => (s.kg > a.kg ? s : a), we.sets[0]) : null
                            const byTime = isDurationExercise(ex)
                            return (
                              <div key={we.exerciseId} className="flex items-center justify-between">
                                <p style={{ color: S.dim, fontSize: 11 }}>{ex.nameEs}</p>
                                {byTime
                                  ? <p style={{ color: S.faint, fontSize: 11 }}>{formatDuration(totalSeconds(we.sets))}</p>
                                  : best && <p style={{ color: S.faint, fontSize: 11 }}>{formatLoad(best.kg, best.reps, { conReps: false })}</p>}
                              </div>
                            )
                          })}
                          {w.exercises.length > 4 && <p style={{ color: S.faint, fontSize: 11 }}>+{w.exercises.length - 4} más...</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {isFuture ? (
              <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: S.faint, flexShrink: 0 }}>
                No podés registrar entrenos en fechas futuras
              </p>
            ) : (
              <button onClick={() => setShowRoutinePicker(true)} style={{
                marginTop: 16, width: '100%', padding: '14px 0', borderRadius: 14,
                background: S.acc, border: 'none', color: '#fff',
                fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0,
              }}>
                + Registrar entreno
              </button>
            )}
          </>
        )}
      </div>
      {editingWorkout && (
        <EditWorkoutSheet workout={editingWorkout} onClose={() => setEditingWorkout(null)} />
      )}
    </div>
  )
}

function EditWorkoutSheet({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const { routines, getArchivedRoutineName, updateWorkout } = useStore()
  const exercises = useAllExercises()
  const routine = routines.find((r) => r.id === workout.routineId) ?? getArchivedRoutineName(workout.routineId)

  const [dateStr, setDateStr] = useState(toDateInputValue(workout.startedAt))
  const [durationStr, setDurationStr] = useState(String(workout.durationMin ?? 0))
  const [draftExercises, setDraftExercises] = useState(
    workout.exercises.map((we) => ({
      exerciseId: we.exerciseId,
      sets: we.sets.map((s) => ({
        kg: String(s.kg),
        reps: String(s.reps),
        isWarmup: s.isWarmup,
        duration: s.durationSec ? fromSeconds(s.durationSec, durationUnit(exercises.find(e => e.id === we.exerciseId))) : '',
      })),
    }))
  )

  const setValue = (exIdx: number, setIdx: number, field: 'kg' | 'reps' | 'duration', value: string) => {
    setDraftExercises((prev) =>
      prev.map((ex, ei) => ei !== exIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, [field]: value }),
      })
    )
  }

  const addSet = (exIdx: number) => {
    setDraftExercises((prev) =>
      prev.map((ex, ei) => {
        if (ei !== exIdx) return ex
        const last = ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [...ex.sets, {
            kg: last?.kg ?? '0',
            reps: last?.reps ?? '0',
            isWarmup: undefined as boolean | undefined,
            duration: last?.duration ?? '',
          }],
        }
      })
    )
  }

  const removeSet = (exIdx: number, setIdx: number) => {
    setDraftExercises((prev) =>
      prev.map((ex, ei) => ei !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) })
    )
  }

  const handleSave = () => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const original = new Date(workout.startedAt)
    const newStartedAt = new Date(y, m - 1, d, original.getHours(), original.getMinutes(), original.getSeconds()).getTime()
    const durationMin = Math.max(0, Math.round(parseDecimal(durationStr)) || 0)
    const finishedAt = newStartedAt + durationMin * 60000
    const newExercises = draftExercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets
        .filter((s) => s.kg !== '' || s.reps !== '' || s.duration !== '')
        .map((s) => ({
          kg: parseDecimal(s.kg) || 0,
          reps: parseInt(s.reps.replace(/[^0-9]/g, '')) || 0,
          completedAt: finishedAt,
          isWarmup: s.isWarmup,
          durationSec: s.duration
            ? toSeconds(s.duration, durationUnit(exercises.find(e => e.id === ex.exerciseId)))
            : undefined,
        })),
    })).filter((ex) => ex.sets.length > 0)

    updateWorkout({
      ...workout,
      startedAt: newStartedAt,
      finishedAt,
      durationMin,
      exercises: newExercises,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={(e) => { e.stopPropagation(); onClose() }}>
      <div
        className="w-full rounded-t-3xl px-4 pt-4 pb-8 max-h-[85vh] flex flex-col sheet-enter"
        style={{ background: S.surf, borderTop: `1px solid ${S.line2}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 40, height: 4, background: S.surf2, borderRadius: 2, margin: '0 auto 16px' }} />
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 style={{ fontWeight: 700, color: S.ink, fontSize: 17 }}>{routine?.emoji} Editar entreno</h3>
          <button onClick={onClose} style={{ color: S.dim, fontSize: 22, lineHeight: 1, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={{ fontSize: 11, color: S.dim, fontWeight: 600 }}>Fecha</label>
              <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)}
                style={{ width: '100%', marginTop: 4, background: S.surf2, border: `1px solid ${S.line2}`, borderRadius: 10, padding: '10px 12px', fontSize: 16, color: S.ink, fontFamily: 'inherit' }} />
            </div>
            <div style={{ width: 120 }}>
              <label style={{ fontSize: 11, color: S.dim, fontWeight: 600 }}>Duración (min)</label>
              <input {...integerInputProps} value={durationStr} onChange={(e) => setDurationStr(e.target.value)}
                style={{ width: '100%', marginTop: 4, background: S.surf2, border: `1px solid ${S.line2}`, borderRadius: 10, padding: '10px 12px', fontSize: 16, color: S.ink, fontFamily: 'inherit' }} />
            </div>
          </div>

          {draftExercises.map((ex, exIdx) => {
            const exInfo = exercises.find((e) => e.id === ex.exerciseId)
            const byTime = isDurationExercise(exInfo)
            const unit = durationUnit(exInfo)
            return (
              <div key={ex.exerciseId} style={{ background: S.surf2, borderRadius: 14, padding: 12, border: `1px solid ${S.line2}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: S.ink, marginBottom: 8 }}>{exInfo?.nameEs ?? ex.exerciseId}</p>
                <div className="flex flex-col gap-2">
                  {ex.sets.map((s, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2">
                      <span style={{ width: 18, fontSize: 11, color: S.faint }}>{setIdx + 1}</span>
                      {byTime ? (
                        <>
                          <input {...decimalInputProps} value={s.duration} onChange={(e) => setValue(exIdx, setIdx, 'duration', e.target.value)}
                            placeholder={unit}
                            style={{ flex: 1, minWidth: 0, background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 8, padding: '6px 10px', fontSize: 16, color: S.ink, fontFamily: 'inherit' }} />
                          <span style={{ color: S.faint, fontSize: 11 }}>{unit}</span>
                        </>
                      ) : (
                        <>
                          <input {...decimalInputProps} value={s.kg} onChange={(e) => setValue(exIdx, setIdx, 'kg', e.target.value)}
                            placeholder="kg"
                            style={{ flex: 1, minWidth: 0, background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 8, padding: '6px 10px', fontSize: 16, color: S.ink, fontFamily: 'inherit' }} />
                          <span style={{ color: S.faint, fontSize: 11 }}>×</span>
                          <input {...integerInputProps} value={s.reps} onChange={(e) => setValue(exIdx, setIdx, 'reps', e.target.value)}
                            placeholder="reps"
                            style={{ flex: 1, minWidth: 0, background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 8, padding: '6px 10px', fontSize: 16, color: S.ink, fontFamily: 'inherit' }} />
                        </>
                      )}
                      <button onClick={() => removeSet(exIdx, setIdx)}
                        aria-label={`Borrar la serie ${setIdx + 1}`}
                        style={{ width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.dim, fontSize: 15, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => addSet(exIdx)}
                  style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: S.acc, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Agregar serie
                </button>
              </div>
            )
          })}
        </div>

        <button onClick={handleSave} style={{
          marginTop: 16, width: '100%', padding: '14px 0', borderRadius: 14,
          background: S.acc, border: 'none', color: '#fff',
          fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0,
        }}>
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function WeekPlanner() {
  const { weekPlan, setWeekPlanDay, routines } = useStore()
  return (
    <div style={{ background: S.surf, borderRadius: 14, padding: '14px 16px', border: `1px solid ${S.line2}` }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: S.dim, marginBottom: 12 }}>Semana tipo</p>
      <div className="flex flex-col gap-1.5">
        {DOW_LABELS.map((label, dow) => {
          const routineId = weekPlan[dow] ?? null
          const routine = routineId ? routines.find(r => r.id === routineId) : null
          return (
            <div key={dow} className="flex items-center gap-2">
              <span style={{ fontSize: 11, fontWeight: 600, width: 28, flexShrink: 0, color: S.dim }}>{label}</span>
              <select value={routineId ?? ''} onChange={(e) => setWeekPlanDay(dow, e.target.value || null)}
                className="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none appearance-none"
                style={{ background: routine ? 'rgba(232,99,74,0.08)' : S.surf2, border: `1px solid ${routine ? 'rgba(232,99,74,0.2)' : S.line2}`, color: routine ? S.acc : S.dim, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                <option value="" style={{ background: S.surf, color: S.dim }}>— Descanso —</option>
                {routines.map((r) => <option key={r.id} value={r.id} style={{ background: S.surf, color: S.ink }}>{r.emoji} {r.name}</option>)}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CalendarioTab({ year, month }: { year: number; month: number }) {
  const { workouts, routines, weekPlan, deleteWorkout, restoreWorkout, addUndoToast, getArchivedRoutineName } = useStore()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)

  const borrarConDeshacer = (w: Workout) => {
    const nombre = (routines.find((r) => r.id === w.routineId) ?? getArchivedRoutineName(w.routineId))?.name ?? 'el entreno'
    deleteWorkout(w.id)
    addUndoToast(`Se borró ${nombre} del ${new Date(w.startedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`, () => restoreWorkout(w))
  }

  // Una sola lectura del reloj por montaje: el render tiene que ser puro.
  const [nowTs] = useState(() => Date.now())
  const finishedWorkouts = workouts.filter(w => w.finishedAt)
  const plannedDows = plannedDowSet(weekPlan)
  // La asistencia se mide contra los días que la semana tipo pedía entrenar, no
  // contra los 31 del mes: ir tres veces por semana es cumplir el plan, no un 42%.
  const { trained: gymDaysCount, planned, attendance } = monthStats(finishedWorkouts, year, month, nowTs, plannedDows)
  const streak = getWorkoutStreak(finishedWorkouts, nowTs)
  const recentWorkouts = [...finishedWorkouts].sort((a, b) => b.startedAt - a.startedAt).slice(0, 8)

  return (
    <div className="flex flex-col gap-3">
      {/* Resumen del mes — cumplimiento del plan, no días del calendario */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {([
          [gymDaysCount, planned > 0 ? `de ${planned} planificados` : 'días de gym', S.acc],
          [`${attendance}%`, planned > 0 ? 'del plan' : 'de los días', attendance >= 100 ? S.good : S.acc2],
          [streak.current, streak.current === 1 ? 'entreno seguido' : 'entrenos seguidos', S.acc2],
        ] as [string | number, string, string][]).map(([v, l, col]) => (
          <div key={l} style={{ background: S.surf2, borderRadius: 14, padding: '12px 10px', textAlign: 'center', border: `1px solid ${S.line2}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, color: col }}>{v}</div>
            <div style={{ fontSize: 11, color: S.dim, marginTop: 3, lineHeight: 1.25 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Calendario del mes: cada día pintado según las series que hiciste */}
      <div style={{ background: S.surf, borderRadius: 18, padding: '14px 14px', border: `1px solid ${S.line2}` }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: S.dim, marginBottom: 10 }}>Tocá un día para ver el detalle</p>
        <MonthCalendar
          year={year}
          month={month}
          workouts={finishedWorkouts}
          routines={routines}
          plannedDows={plannedDows}
          onSelectDay={(ts) => {
            const d = new Date(ts)
            setSelectedDay({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear() })
          }}
        />
      </div>

      {/* Consistencia */}
      <div style={{ background: S.surf, borderRadius: 14, padding: '12px 14px', border: `1px solid ${S.line2}` }}>
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontSize: 12, color: S.dim, fontWeight: 500 }}>
            {planned > 0 ? 'Cumplimiento del plan' : 'Consistencia del mes'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: attendance >= 100 ? S.good : S.acc }}>{attendance}%</span>
        </div>
        <div style={{ height: 6, background: S.surf2, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, attendance)}%`, height: '100%', background: attendance >= 100 ? S.good : S.acc, borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>
        {planned > 0 && (
          <p style={{ fontSize: 11, color: S.faint, marginTop: 6 }}>
            {gymDaysCount} de {planned} días que pedía tu semana tipo
          </p>
        )}
      </div>

      {/* Week planner */}
      <WeekPlanner />

      {/* Recent history */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: S.dim, marginBottom: 8 }}>Historial reciente</p>
        <div className="flex flex-col gap-2">
          {recentWorkouts.map((w) => {
            const routine = routines.find((r) => r.id === w.routineId) ?? getArchivedRoutineName(w.routineId)
            const date = new Date(w.startedAt)
            const totalSets = w.exercises.reduce((acc, e) => acc + e.sets.length, 0)
            return (
              <div key={w.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: S.surf, borderRadius: 14, padding: 12, border: `1px solid ${S.line2}`, cursor: 'pointer' }}
                onClick={() => setSelectedDay({ day: date.getDate(), month: date.getMonth(), year: date.getFullYear() })}
              >
                <div style={{ background: 'rgba(232,99,74,0.10)', border: `1px solid rgba(232,99,74,0.2)`, borderRadius: 10, padding: '8px 10px', textAlign: 'center', flexShrink: 0, minWidth: 44 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: S.acc, lineHeight: 1 }}>{date.getDate()}</div>
                  <div style={{ fontSize: 11, color: S.acc, opacity: 0.7, marginTop: 1 }}>{MONTH_NAMES[date.getMonth()].slice(0, 3)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontWeight: 700, color: S.ink, fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{routine?.emoji} {routine?.name}</p>
                  <p style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>{w.exercises.length} ej · {totalSets} series · {w.durationMin}min</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingWorkout(w) }}
                  aria-label="Editar este entreno"
                  style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.dim, fontSize: 14, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                >✏️</button>
                <button
                  onClick={(e) => { e.stopPropagation(); borrarConDeshacer(w) }}
                  aria-label="Borrar este entreno"
                  style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.dim, fontSize: 15, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                >🗑</button>
              </div>
            )
          })}
          {recentWorkouts.length === 0 && <p style={{ color: S.faint, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Sin historial</p>}
        </div>
      </div>

      {editingWorkout && (
        <EditWorkoutSheet workout={editingWorkout} onClose={() => setEditingWorkout(null)} />
      )}

      {selectedDay && (
        <DaySheet selectedDay={selectedDay} allWorkouts={workouts} routines={routines}
          onClose={() => setSelectedDay(null)}
          onStartWorkout={(routineId, dateOverride) => startWorkout(routineId, dateOverride)}
        />
      )}
    </div>
  )
}

/**
 * Una marca escrita con la unidad que le corresponde: kilos por repeticiones en
 * los ejercicios con peso, repeticiones solas en los de peso corporal y tiempo
 * en los isométricos y el cardio.
 */
function formatMarca(m: { kg: number; reps: number; durationSec?: number }): string {
  if (m.durationSec) return formatDuration(m.durationSec)
  if (m.kg > 0) return `${m.kg} kg × ${m.reps}`
  return `${m.reps} reps`
}

function RecordsTab() {
  const { prs } = useStore()
  const exercises = useAllExercises()
  const [expandedPr, setExpandedPr] = useState<string | null>(null)
  // Últimos 30 días en vez del mes calendario: todos los días 1 este contador
  // volvía a cero aunque vinieras rompiendo marcas.
  const [nowTs] = useState(() => Date.now())
  const startOfMonth = nowTs - 30 * 86400000
  const monthPrs = prs.filter((p) => p.date >= startOfMonth)
  // Ordenados por lo más reciente: mezclar kilos, repeticiones y segundos en un
  // solo ranking no significaba nada.
  const sortedPrs = [...prs].sort((a, b) => b.date - a.date)

  return (
    <div className="flex flex-col gap-3">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(242,169,59,0.08)', border: `1px solid rgba(242,169,59,0.22)`, borderRadius: 18, padding: 16 }}>
        <span style={{ fontSize: 32, lineHeight: 1 }}>🏆</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: S.acc2 }}>
            {monthPrs.length} {monthPrs.length === 1 ? 'récord nuevo' : 'récords nuevos'} en 30 días
          </div>
          <div style={{ fontSize: 12, color: S.dim, marginTop: 3 }}>{prs.length} récords personales en total</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {sortedPrs.map((pr) => {
          const ex = exercises.find((e) => e.id === pr.exerciseId)
          if (!ex) return null
          const isNew = pr.date >= startOfMonth
          const prDate = new Date(pr.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
          const isExpanded = expandedPr === pr.exerciseId
          const hasHistory = pr.history && pr.history.length > 0
          return (
            <div key={pr.exerciseId} style={{ background: S.surf, borderRadius: 14, border: `1px solid ${isNew ? 'rgba(232,99,74,0.22)' : S.line2}` }}>
              <div className="flex items-center gap-3" style={{ padding: '12px 14px' }}>
                <div style={{ width: 30, textAlign: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 18 }} aria-hidden="true">🏆</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 13, fontWeight: 700, color: S.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ex.nameEs}</span>
                    {isNew && <span style={{ fontSize: 11, fontWeight: 700, color: S.acc, background: 'rgba(232,99,74,0.15)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>NEW</span>}
                  </div>
                  <p style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>{prDate}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.ink }}>{formatMarca(pr)}</div>
                  {pr.kg > 0 && !pr.durationSec && (
                    <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>{Math.round(pr.kg * pr.reps)} kg de volumen</div>
                  )}
                </div>
                {hasHistory && (
                  <button onClick={() => setExpandedPr(isExpanded ? null : pr.exerciseId)}
                    style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: isExpanded ? 'rgba(232,99,74,0.12)' : S.surf2, border: `1px solid ${isExpanded ? 'rgba(232,99,74,0.25)' : S.line2}`, color: isExpanded ? S.acc : S.dim, fontSize: 11, flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {isExpanded ? '▲' : '▼'}
                  </button>
                )}
              </div>
              {isExpanded && hasHistory && (
                <div style={{ padding: '10px 14px 12px', borderTop: `1px solid ${S.line}` }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: S.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Historial</p>
                  <div className="flex flex-col gap-1.5">
                    {[...pr.history!].reverse().map((h, hi) => (
                      <div key={hi} className="flex items-center justify-between">
                        <span style={{ fontSize: 11, color: S.dim }}>{new Date(h.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: S.dim }}>{formatMarca(h)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {prs.length === 0 && <p style={{ color: S.faint, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No hay récords aún. ¡A entrenar!</p>}
      </div>

          </div>
  )
}

export function CalendarioScreen() {
  const { calendarSubTab, setCalendarSubTab } = useStore()
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const hoy = new Date()
  const isCurrentMonth = hoy.getFullYear() === year && hoy.getMonth() === month
  const enCalendario = calendarSubTab === 'calendario'

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div style={{ flexShrink: 0, paddingTop: 'max(60px, calc(env(safe-area-inset-top, 0px) + 22px))', paddingLeft: 22, paddingRight: 22 }}>
        {/* El mes manda: es lo primero de la pantalla y lo que filtra todo lo de abajo. */}
        {enCalendario ? (
          <div className="flex items-center justify-between">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Mes anterior"
              style={{ width: 36, height: 36, borderRadius: 12, background: S.surf2, border: `1px solid ${S.line2}`, color: S.dim, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>‹</button>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: S.ink, textAlign: 'center' }}>
              {MONTH_NAMES[month]} <span style={{ color: S.dim, fontWeight: 600 }}>{year}</span>
            </div>
            <button onClick={() => { if (!isCurrentMonth) setViewDate(new Date(year, month + 1, 1)) }} disabled={isCurrentMonth} aria-label="Mes siguiente"
              style={{ width: 36, height: 36, borderRadius: 12, background: S.surf2, border: `1px solid ${S.line2}`, color: isCurrentMonth ? S.faint : S.dim, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isCurrentMonth ? 'default' : 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>›</button>
          </div>
        ) : (
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: S.ink, textAlign: 'center' }}>Récords</div>
        )}

        <div style={{ display: 'flex', background: S.surf, borderRadius: 14, padding: 3, border: `1px solid ${S.line2}`, marginTop: 16 }}>
          {([['calendario', '📅 Calendario'], ['records', '🏆 Récords']] as [CalendarSubTab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setCalendarSubTab(id)}
              style={{ flex: 1, padding: '9px 0', borderRadius: 11, border: 'none', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: calendarSubTab === id ? S.surf2 : 'transparent', color: calendarSubTab === id ? S.ink : S.dim, transition: 'all 0.15s ease-out' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 scroll-area" style={{ padding: '16px 22px 24px' }}>
        {enCalendario ? <CalendarioTab year={year} month={month} /> : <RecordsTab />}
      </div>
    </div>
  )
}
