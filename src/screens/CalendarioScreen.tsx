import { useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import type { CalendarSubTab, Routine, Workout } from '../types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DOW_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

type SelectedDay = { day: number; month: number; year: number }

const S = {
  bg: '#0C0E14', surf: '#161821', surf2: '#1C1F2A',
  ink: '#ECEEF4', dim: '#737A8C', faint: '#3B3F4E',
  acc: '#E8634A', acc2: '#F2A93B',
  line: 'rgba(236,238,244,0.07)', line2: 'rgba(236,238,244,0.12)',
}

function DaySheet({
  selectedDay, allWorkouts, routines, onClose, onStartWorkout,
}: {
  selectedDay: SelectedDay; allWorkouts: Workout[]; routines: Routine[]
  onClose: () => void; onStartWorkout: (routineId: string, dateOverride?: number) => void
}) {
  const { deleteWorkout, getArchivedRoutineName } = useStore()
  const exercises = useAllExercises()
  const [showRoutinePicker, setShowRoutinePicker] = useState(false)
  const { day, month, year } = selectedDay
  const dayWorkouts = allWorkouts.filter((w) => {
    if (!w.finishedAt) return false
    const d = new Date(w.startedAt)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
  })
  const date = new Date(year, month, day)
  const isToday = date.toDateString() === new Date().toDateString()
  const dateLabel = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
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
                          <button onClick={() => deleteWorkout(w.id)} style={{ padding: 6, color: S.dim, fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }}>🗑</button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {w.exercises.slice(0, 4).map((we) => {
                            const ex = exercises.find((e) => e.id === we.exerciseId)
                            if (!ex) return null
                            const best = we.sets.length > 0 ? we.sets.reduce((a, s) => (s.kg > a.kg ? s : a), we.sets[0]) : null
                            return (
                              <div key={we.exerciseId} className="flex items-center justify-between">
                                <p style={{ color: S.dim, fontSize: 11 }}>{ex.nameEs}</p>
                                {best && <p style={{ color: S.faint, fontSize: 11 }}>{best.kg}kg × {best.reps}</p>}
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
            <button onClick={() => setShowRoutinePicker(true)} style={{
              marginTop: 16, width: '100%', padding: '14px 0', borderRadius: 14,
              background: S.acc, border: 'none', color: '#fff',
              fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0,
            }}>
              + Registrar entreno
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function getStreaks(workouts: Array<{ startedAt: number; finishedAt?: number }>) {
  const days = new Set<string>()
  for (const w of workouts) {
    if (!w.finishedAt) continue
    const d = new Date(w.startedAt)
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
  }
  const today = new Date()
  let current = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (days.has(key)) { current++ } else { if (i === 0) continue; break }
  }
  let best = 0; let streak = 0
  const sorted = Array.from(days).map(k => {
    const [y, m, d] = k.split('-').map(Number)
    return new Date(y, m, d).getTime()
  }).sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) { streak = 1; continue }
    if ((sorted[i] - sorted[i - 1]) / 86400000 === 1) { streak++ } else { streak = 1 }
    if (streak > best) best = streak
  }
  if (streak > best) best = streak
  return { current, best }
}

function ActivityHeatmap({ workouts }: { workouts: Array<{ startedAt: number; finishedAt?: number }> }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const WEEKS = 16; const TOTAL_DAYS = WEEKS * 7
  const startDate = new Date(today); startDate.setDate(today.getDate() - (TOTAL_DAYS - 1))
  const countByDay = new Map<string, number>()
  for (const w of workouts) {
    if (!w.finishedAt) continue
    const d = new Date(w.startedAt); d.setHours(0, 0, 0, 0)
    const key = d.getTime().toString()
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1)
  }
  const cells: { date: Date; count: number }[] = []
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = new Date(startDate); d.setDate(startDate.getDate() + i)
    cells.push({ date: d, count: countByDay.get(d.getTime().toString()) ?? 0 })
  }
  const weeks: typeof cells[] = []
  for (let w = 0; w < WEEKS; w++) weeks.push(cells.slice(w * 7, (w + 1) * 7))
  const getColor = (count: number) => {
    if (count === 0) return S.surf2
    if (count === 1) return 'rgba(232,99,74,0.30)'
    if (count === 2) return 'rgba(232,99,74,0.60)'
    return S.acc
  }
  return (
    <div>
      <div className="flex gap-0.5">
        {/* Day of week labels */}
        <div className="flex flex-col gap-0.5" style={{ width: 14, flexShrink: 0, marginRight: 2 }}>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <div key={d} className="flex-1 flex items-center" style={{ minHeight: 0, minWidth: 0 }}>
              <span style={{ fontSize: 7, color: S.faint, lineHeight: 1 }}>{d}</span>
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5 flex-1">
            {week.map((cell, di) => (
              <div key={di} className="aspect-square rounded-sm"
                style={{ background: getColor(cell.count), outline: cell.date.getTime() === today.getTime() ? `1.5px solid ${S.acc}` : undefined, outlineOffset: 1 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span style={{ fontSize: 10, color: S.faint }}>Menos</span>
        {[0, 1, 2, 3].map(c => <div key={c} className="w-3 h-3 rounded-sm" style={{ background: getColor(c) }} />)}
        <span style={{ fontSize: 10, color: S.faint }}>Más</span>
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

function CalendarioTab() {
  const { workouts, routines, weekPlan, deleteWorkout, getArchivedRoutineName } = useStore()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null)
  const today = new Date()
  const year = viewDate.getFullYear(); const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  let startDow = firstDay.getDay() - 1; if (startDow < 0) startDow = 6

  const gymDayWorkouts = new Map<number, Workout[]>()
  workouts.filter((w) => {
    if (!w.finishedAt) return false
    const d = new Date(w.startedAt)
    return d.getFullYear() === year && d.getMonth() === month
  }).forEach((w) => {
    const day = new Date(w.startedAt).getDate()
    if (!gymDayWorkouts.has(day)) gymDayWorkouts.set(day, [])
    gymDayWorkouts.get(day)!.push(w)
  })

  const gymDays = new Set(gymDayWorkouts.keys())
  const gymDaysCount = gymDays.size
  const todayInMonth = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1
  const daysPassed = todayInMonth > 0 ? todayInMonth : daysInMonth
  const restDays = daysPassed - gymDaysCount
  const attendance = Math.round((gymDaysCount / Math.max(daysPassed, 1)) * 100)
  const finishedWorkouts = workouts.filter(w => w.finishedAt)
  const { current: currentStreak } = getStreaks(finishedWorkouts)
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const recentWorkouts = [...workouts].filter((w) => w.finishedAt).sort((a, b) => b.startedAt - a.startedAt).slice(0, 8)

  return (
    <div className="flex flex-col gap-3">
      {/* Heatmap */}
      <div style={{ background: S.surf, borderRadius: 18, padding: '14px 14px', border: `1px solid ${S.line2}` }}>
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: 12, fontWeight: 600, color: S.dim }}>Actividad · 16 semanas</p>
          {currentStreak > 0 && (
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 700, background: 'rgba(232,99,74,0.12)', color: S.acc, border: `1px solid rgba(232,99,74,0.2)` }}>
              🔥 {currentStreak}d racha
            </span>
          )}
        </div>
        <ActivityHeatmap workouts={finishedWorkouts} />
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          style={{ width: 36, height: 36, borderRadius: 12, background: S.surf2, border: `1px solid ${S.line2}`, color: S.dim, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2, color: S.ink }}>{MONTH_NAMES[month]} {year}</span>
        <button onClick={() => { if (!isCurrentMonth) setViewDate(new Date(year, month + 1, 1)) }} disabled={isCurrentMonth}
          style={{ width: 36, height: 36, borderRadius: 12, background: S.surf2, border: `1px solid ${S.line2}`, color: isCurrentMonth ? S.faint : S.dim, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isCurrentMonth ? 'default' : 'pointer', fontFamily: 'inherit' }}>›</button>
      </div>

      {/* 3-stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {([
          [gymDaysCount, 'Días gym', S.acc],
          [restDays, 'Descanso', S.dim],
          [`${attendance}%`, 'Asistencia', S.acc2],
        ] as [string | number, string, string][]).map(([v, l, col]) => (
          <div key={l} style={{ background: S.surf2, borderRadius: 14, padding: '12px 10px', textAlign: 'center', border: `1px solid ${S.line2}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, color: col }}>{v}</div>
            <div style={{ fontSize: 10, color: S.dim, marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ background: S.surf, borderRadius: 18, padding: '14px 10px', border: `1px solid ${S.line2}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {DAY_NAMES.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: S.faint, padding: '3px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {Array.from({ length: startDow }).map((_, i) => <div key={`e-${i}`} style={{ aspectRatio: '1' }} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isGym = gymDays.has(day)
            const isToday = day === todayInMonth
            const isFuture = todayInMonth > 0 && day > todayInMonth
            const cellDow = (new Date(year, month, day).getDay() + 6) % 7
            const plannedRoutineId = isFuture ? (weekPlan[cellDow] ?? null) : null
            const plannedRoutine = plannedRoutineId ? routines.find(r => r.id === plannedRoutineId) : null
            return (
              <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1' }}
                onClick={() => setSelectedDay({ day, month, year })}>
                <div style={{ width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', background: isToday ? S.acc : 'transparent', color: isToday ? '#fff' : isFuture ? S.faint : isGym ? S.ink : S.dim, fontWeight: isToday || isGym ? 700 : 400 }}>
                  <span style={{ fontSize: 11 }}>{day}</span>
                  {isGym && !isToday && <div style={{ position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2, background: S.acc }} />}
                  {plannedRoutine && !isGym && <div style={{ position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2, background: 'rgba(56,189,248,0.7)' }} title={plannedRoutine.name} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Consistency bar */}
      <div style={{ background: S.surf, borderRadius: 14, padding: '12px 14px', border: `1px solid ${S.line2}` }}>
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontSize: 12, color: S.dim, fontWeight: 500 }}>Consistencia del mes</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: S.acc }}>{attendance}%</span>
        </div>
        <div style={{ height: 6, background: S.surf2, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${attendance}%`, height: '100%', background: S.acc, borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>
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
                  <div style={{ fontSize: 9, color: S.acc, opacity: 0.7, marginTop: 1 }}>{MONTH_NAMES[date.getMonth()].slice(0, 3)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontWeight: 700, color: S.ink, fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{routine?.emoji} {routine?.name}</p>
                  <p style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>{w.exercises.length} ej · {totalSets} series · {w.durationMin}min</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteWorkout(w.id) }} style={{ padding: 8, color: S.dim, fontSize: 14, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}>🗑</button>
              </div>
            )
          })}
          {recentWorkouts.length === 0 && <p style={{ color: S.faint, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Sin historial</p>}
        </div>
      </div>

      {selectedDay && (
        <DaySheet selectedDay={selectedDay} allWorkouts={workouts} routines={routines}
          onClose={() => setSelectedDay(null)}
          onStartWorkout={(routineId, dateOverride) => startWorkout(routineId, dateOverride)}
        />
      )}
    </div>
  )
}

function RecordsTab() {
  const { prs, deletePr } = useStore()
  const exercises = useAllExercises()
  const [expandedPr, setExpandedPr] = useState<string | null>(null)
  const [confirmDeletePrId, setConfirmDeletePrId] = useState<string | null>(null)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
  const monthPrs = prs.filter((p) => p.date >= startOfMonth)
  const sortedPrs = [...prs].sort((a, b) => b.kg * b.reps - a.kg * a.reps)
  const medals: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

  return (
    <div className="flex flex-col gap-3">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(242,169,59,0.08)', border: `1px solid rgba(242,169,59,0.22)`, borderRadius: 18, padding: 16 }}>
        <span style={{ fontSize: 32, lineHeight: 1 }}>🏆</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: S.acc2 }}>{monthPrs.length} nuevos PRs este mes</div>
          <div style={{ fontSize: 12, color: S.dim, marginTop: 3 }}>{prs.length} récords personales en total</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {sortedPrs.map((pr, idx) => {
          const ex = exercises.find((e) => e.id === pr.exerciseId)
          if (!ex) return null
          const isNew = pr.date >= startOfMonth
          const prDate = new Date(pr.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
          const isExpanded = expandedPr === pr.exerciseId
          const hasHistory = pr.history && pr.history.length > 0
          return (
            <div key={pr.exerciseId} style={{ background: S.surf, borderRadius: 14, border: `1px solid ${isNew ? 'rgba(232,99,74,0.22)' : S.line2}` }}>
              <div className="flex items-center gap-3" style={{ padding: '12px 14px' }}>
                <div style={{ width: 32, textAlign: 'center', flexShrink: 0, fontSize: idx < 3 ? 20 : 13, fontWeight: idx < 3 ? 400 : 700, color: idx < 3 ? undefined : S.dim }}>
                  {idx < 3 ? medals[idx] : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 13, fontWeight: 700, color: S.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ex.nameEs}</span>
                    {isNew && <span style={{ fontSize: 9, fontWeight: 700, color: S.acc, background: 'rgba(232,99,74,0.15)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>NEW</span>}
                  </div>
                  <p style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>{prDate}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.ink }}>{pr.kg}kg × {pr.reps}</div>
                  <div style={{ fontSize: 10, color: S.dim, marginTop: 2 }}>Vol: {pr.kg * pr.reps}kg</div>
                </div>
                {hasHistory && (
                  <button onClick={() => setExpandedPr(isExpanded ? null : pr.exerciseId)}
                    style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: isExpanded ? 'rgba(232,99,74,0.12)' : S.surf2, border: `1px solid ${isExpanded ? 'rgba(232,99,74,0.25)' : S.line2}`, color: isExpanded ? S.acc : S.dim, fontSize: 11, flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {isExpanded ? '▲' : '▼'}
                  </button>
                )}
                <button onClick={() => setConfirmDeletePrId(pr.exerciseId)}
                  style={{ padding: 6, color: S.dim, fontSize: 14, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}>🗑</button>
              </div>
              {isExpanded && hasHistory && (
                <div style={{ padding: '10px 14px 12px', borderTop: `1px solid ${S.line}` }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: S.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Historial</p>
                  <div className="flex flex-col gap-1.5">
                    {[...pr.history!].reverse().map((h, hi) => (
                      <div key={hi} className="flex items-center justify-between">
                        <span style={{ fontSize: 11, color: S.dim }}>{new Date(h.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: S.dim }}>{h.kg}kg × {h.reps}</span>
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

      {confirmDeletePrId && (() => {
        const prEx = exercises.find(e => e.id === confirmDeletePrId)
        return (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div style={{ background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
              <h3 style={{ color: S.ink, fontWeight: 700, fontSize: 17, marginBottom: 8 }}>¿Eliminar este PR?</h3>
              <p style={{ color: S.dim, fontSize: 13, marginBottom: 20 }}>
                Se eliminará el récord de <strong style={{ color: S.ink }}>{prEx?.nameEs}</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeletePrId(null)}
                  style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: `1px solid ${S.line2}`, color: S.dim, fontSize: 14, fontWeight: 600, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancelar
                </button>
                <button onClick={() => { deletePr(confirmDeletePrId); setConfirmDeletePrId(null) }}
                  style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export function CalendarioScreen() {
  const { calendarSubTab, setCalendarSubTab } = useStore()
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div style={{ flexShrink: 0, padding: '60px 22px 0' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: S.ink }}>Seguimiento</div>
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
        {calendarSubTab === 'calendario' ? <CalendarioTab /> : <RecordsTab />}
      </div>
    </div>
  )
}
