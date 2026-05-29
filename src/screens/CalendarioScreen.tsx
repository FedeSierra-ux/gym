import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import type { CalendarSubTab, Routine, Workout } from '../types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DOW_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

type SelectedDay = { day: number; month: number; year: number }

function DaySheet({
  selectedDay,
  allWorkouts,
  routines,
  onClose,
  onStartWorkout,
}: {
  selectedDay: SelectedDay
  allWorkouts: Workout[]
  routines: Routine[]
  onClose: () => void
  onStartWorkout: (routineId: string, dateOverride?: number) => void
}) {
  const { exercises, deleteWorkout } = useStore()
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
    const dateOverride = isToday
      ? undefined
      : new Date(year, month, day, 12, 0, 0).getTime()
    onStartWorkout(routineId, dateOverride)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-3xl border-t border-border px-4 pt-4 pb-8 max-h-[80vh] flex flex-col screen-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h3 className="font-bold text-white text-lg capitalize">{dateLabel}</h3>
            {isToday && <p className="text-primary text-xs font-semibold">Hoy</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-500 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {showRoutinePicker ? (
          <>
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <button
                onClick={() => setShowRoutinePicker(false)}
                className="text-gray-500 hover:text-white transition-colors text-sm"
              >
                ‹ Volver
              </button>
              <p className="text-sm font-semibold text-white">Elegí una rutina</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
              {routines.filter(r => r.exercises.length > 0).length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-8">No tenés rutinas con ejercicios aún</p>
              ) : (
                routines.filter(r => r.exercises.length > 0).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleStart(r.id)}
                    className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98] w-full"
                  >
                    <span className="text-2xl flex-shrink-0">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.exercises.length} ejercicios</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {dayWorkouts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Sin actividad registrada</p>
              ) : (
                <div className="flex flex-col gap-2 pb-2">
                  {dayWorkouts.map((w) => {
                    const routine = routines.find((r) => r.id === w.routineId)
                    const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0)
                    return (
                      <div key={w.id} className="bg-surface border border-border rounded-xl p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm">{routine?.emoji} {routine?.name}</p>
                            <p className="text-xs text-gray-500">{w.exercises.length} ejercicios · {totalSets} series · {w.durationMin ?? 0}min</p>
                          </div>
                          <button
                            onClick={() => deleteWorkout(w.id)}
                            aria-label="Eliminar entreno"
                            className="p-1.5 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            🗑
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {w.exercises.slice(0, 4).map((we) => {
                            const ex = exercises.find((e) => e.id === we.exerciseId)
                            if (!ex) return null
                            const best = we.sets.length > 0
                              ? we.sets.reduce((a, s) => (s.kg > a.kg ? s : a), we.sets[0])
                              : null
                            return (
                              <div key={we.exerciseId} className="flex items-center justify-between">
                                <p className="text-gray-400 text-xs">{ex.nameEs}</p>
                                {best && (
                                  <p className="text-gray-500 text-xs">{best.kg}kg × {best.reps}</p>
                                )}
                              </div>
                            )
                          })}
                          {w.exercises.length > 4 && (
                            <p className="text-gray-600 text-xs">+{w.exercises.length - 4} más...</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowRoutinePicker(true)}
              className="mt-4 w-full py-3.5 rounded-xl btn-primary-glow font-bold text-sm text-black flex-shrink-0"
            >
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
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (days.has(key)) {
      current++
    } else {
      if (i === 0) continue
      break
    }
  }

  let best = 0
  let streak = 0
  const sorted = Array.from(days).map(k => {
    const [y, m, d] = k.split('-').map(Number)
    return new Date(y, m, d).getTime()
  }).sort((a, b) => a - b)

  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) { streak = 1; continue }
    const diff = (sorted[i] - sorted[i - 1]) / 86400000
    if (diff === 1) {
      streak++
    } else {
      streak = 1
    }
    if (streak > best) best = streak
  }
  if (streak > best) best = streak

  return { current, best }
}

function ActivityHeatmap({ workouts }: { workouts: Array<{ startedAt: number; finishedAt?: number }> }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const WEEKS = 16
  const TOTAL_DAYS = WEEKS * 7

  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (TOTAL_DAYS - 1))

  const countByDay = new Map<string, number>()
  for (const w of workouts) {
    if (!w.finishedAt) continue
    const d = new Date(w.startedAt)
    d.setHours(0, 0, 0, 0)
    const key = d.getTime().toString()
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1)
  }

  const cells: { date: Date; count: number }[] = []
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    const key = d.getTime().toString()
    cells.push({ date: d, count: countByDay.get(key) ?? 0 })
  }

  const weeks: typeof cells[] = []
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(cells.slice(w * 7, (w + 1) * 7))
  }

  const getColor = (count: number) => {
    if (count === 0) return 'rgba(255,255,255,0.05)'
    if (count === 1) return 'rgba(0,255,136,0.25)'
    if (count === 2) return 'rgba(0,255,136,0.5)'
    return 'rgba(0,255,136,0.85)'
  }

  return (
    <div>
      <div className="flex gap-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5 flex-1">
            {week.map((cell, di) => {
              const isToday = cell.date.getTime() === today.getTime()
              return (
                <div
                  key={di}
                  title={`${cell.date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}${cell.count > 0 ? ` · ${cell.count} entreno${cell.count > 1 ? 's' : ''}` : ''}`}
                  className="aspect-square rounded-sm"
                  style={{
                    background: getColor(cell.count),
                    outline: isToday ? '1.5px solid rgba(0,255,136,0.7)' : undefined,
                    outlineOffset: '1px',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Menos</span>
        {[0, 1, 2, 3].map(c => (
          <div key={c} className="w-3 h-3 rounded-sm" style={{ background: getColor(c) }} />
        ))}
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Más</span>
      </div>
    </div>
  )
}

function WeekPlanner() {
  const { weekPlan, setWeekPlanDay, routines } = useStore()

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Semana tipo
      </p>
      <div className="flex flex-col gap-1.5">
        {DOW_LABELS.map((label, dow) => {
          const routineId = weekPlan[dow] ?? null
          const routine = routineId ? routines.find(r => r.id === routineId) : null
          return (
            <div key={dow} className="flex items-center gap-2">
              <span
                className="text-[11px] font-semibold w-7 flex-shrink-0"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </span>
              <select
                value={routineId ?? ''}
                onChange={(e) => setWeekPlanDay(dow, e.target.value || null)}
                className="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none appearance-none"
                style={{
                  background: routine ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${routine ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  color: routine ? 'var(--primary)' : 'rgba(255,255,255,0.25)',
                }}
              >
                <option value="" style={{ background: '#0d0d1c', color: '#9ca3af' }}>— Descanso —</option>
                {routines.map((r) => (
                  <option key={r.id} value={r.id} style={{ background: '#0d0d1c', color: '#fff' }}>
                    {r.emoji} {r.name}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CalendarioTab() {
  const { workouts, routines, weekPlan, deleteWorkout } = useStore()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null)

  const today = new Date()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const gymDayWorkouts = new Map<number, Workout[]>()
  workouts
    .filter((w) => {
      if (!w.finishedAt) return false
      const d = new Date(w.startedAt)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .forEach((w) => {
      const day = new Date(w.startedAt).getDate()
      if (!gymDayWorkouts.has(day)) gymDayWorkouts.set(day, [])
      gymDayWorkouts.get(day)!.push(w)
    })

  const gymDays = new Set(gymDayWorkouts.keys())
  const gymDaysCount = gymDays.size
  const totalDays = daysInMonth
  const restDays = totalDays - gymDaysCount
  const todayInMonth = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1
  const daysPassed = todayInMonth > 0 ? todayInMonth : totalDays
  const attendance = Math.round((gymDaysCount / Math.max(daysPassed, 1)) * 100)

  const finishedWorkouts = workouts.filter(w => w.finishedAt)
  const { current: currentStreak, best: bestStreak } = getStreaks(finishedWorkouts)

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const recentWorkouts = [...workouts]
    .filter((w) => w.finishedAt)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, 8)

  return (
    <div className="flex flex-col gap-4">
      {/* 16-week heatmap */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Actividad · 16 semanas
          </p>
          <div className="flex gap-2">
            {currentStreak > 0 && (
              <span
                className="text-[11px] px-2.5 py-1 rounded-full font-bold"
                style={{ background: 'rgba(0,255,136,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,255,136,0.2)' }}
              >
                🔥 {currentStreak}d racha
              </span>
            )}
            {bestStreak > 0 && (
              <span
                className="text-[11px] px-2.5 py-1 rounded-full font-bold"
                style={{ background: 'rgba(255,215,0,0.1)', color: 'rgba(255,215,0,0.8)', border: '1px solid rgba(255,215,0,0.2)' }}
              >
                🏆 mejor: {bestStreak}d
              </span>
            )}
          </div>
        </div>
        <ActivityHeatmap workouts={finishedWorkouts} />
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          aria-label="Mes anterior"
          className="w-9 h-9 rounded-full bg-surface border border-border text-gray-400 hover:text-white transition-colors"
        >
          ‹
        </button>
        <h2 className="text-base font-bold text-white">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          aria-label="Mes siguiente"
          className="w-9 h-9 rounded-full bg-surface border border-border text-gray-400 hover:text-white transition-colors"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-xl font-bold text-primary">{gymDaysCount}</p>
          <p className="text-[10px] text-gray-500">Días gym</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-xl font-bold text-info">{restDays}</p>
          <p className="text-[10px] text-gray-500">Descanso</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-xl font-bold text-gold">{attendance}%</p>
          <p className="text-[10px] text-gray-500">Asistencia</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-[10px] text-gray-600 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isGym = gymDays.has(day)
            const isToday = day === todayInMonth
            const isFuture = todayInMonth > 0 && day > todayInMonth
            const cellDate = new Date(year, month, day)
            const cellDow = (cellDate.getDay() + 6) % 7
            const plannedRoutineId = isFuture ? (weekPlan[cellDow] ?? null) : null
            const plannedRoutine = plannedRoutineId ? routines.find(r => r.id === plannedRoutineId) : null

            return (
              <div
                key={day}
                className="flex items-center justify-center aspect-square"
                onClick={() => setSelectedDay({ day, month, year })}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-all cursor-pointer active:scale-90 ${
                    isToday
                      ? 'bg-primary text-black font-bold'
                      : isFuture
                      ? 'text-gray-600'
                      : isGym
                      ? 'text-primary'
                      : 'text-gray-400'
                  }`}
                >
                  <span className="text-xs font-medium">{day}</span>
                  {isGym && !isToday && (
                    <div className="absolute bottom-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                  {plannedRoutine && !isGym && (
                    <div
                      className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: 'rgba(0,212,255,0.7)' }}
                      title={plannedRoutine.name}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">Consistencia del mes</span>
          <span className="text-xs font-bold text-primary">{attendance}%</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${attendance}%` }}
          />
        </div>
      </div>

      <WeekPlanner />

      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Historial reciente</h3>
        <div className="flex flex-col gap-2">
          {recentWorkouts.map((w) => {
            const routine = routines.find((r) => r.id === w.routineId)
            const date = new Date(w.startedAt)
            const totalSets = w.exercises.reduce((acc, e) => acc + e.sets.length, 0)
            return (
              <div
                key={w.id}
                className="bg-card rounded-xl border border-border p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setSelectedDay({ day: date.getDate(), month: date.getMonth(), year: date.getFullYear() })}
              >
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center flex-shrink-0 w-14">
                  <p className="text-primary font-bold text-sm">{date.getDate()}</p>
                  <p className="text-primary/70 text-[10px]">{MONTH_NAMES[date.getMonth()].slice(0, 3)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">
                    {routine?.emoji} {routine?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {w.exercises.length} ejercicios · {totalSets} series · {w.durationMin}min
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteWorkout(w.id) }}
                  aria-label="Eliminar entreno"
                  className="p-2 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  🗑
                </button>
              </div>
            )
          })}

          {recentWorkouts.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-4">Sin historial</p>
          )}
        </div>
      </div>

      {selectedDay && (
        <DaySheet
          selectedDay={selectedDay}
          allWorkouts={workouts}
          routines={routines}
          onClose={() => setSelectedDay(null)}
          onStartWorkout={(routineId, dateOverride) => startWorkout(routineId, dateOverride)}
        />
      )}
    </div>
  )
}

function RecordsTab() {
  const { prs, exercises, deletePr } = useStore()
  const [expandedPr, setExpandedPr] = useState<string | null>(null)

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
  const monthPrs = prs.filter((p) => p.date >= startOfMonth)
  const sortedPrs = [...prs].sort((a, b) => b.kg * b.reps - a.kg * a.reps)
  const medals: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-3xl">🏆</span>
        <div>
          <p className="text-gold font-bold">{monthPrs.length} nuevos PRs este mes</p>
          <p className="text-gray-500 text-xs">{prs.length} récords personales en total</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {sortedPrs.map((pr, idx) => {
          const ex = exercises.find((e) => e.id === pr.exerciseId)
          if (!ex) return null
          const isNew = pr.date >= startOfMonth
          const prDate = new Date(pr.date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
          })
          const isExpanded = expandedPr === pr.exerciseId
          const hasHistory = pr.history && pr.history.length > 0

          return (
            <div
              key={pr.exerciseId}
              className={`bg-card rounded-xl border p-3 ${
                isNew ? 'border-primary/30 pulse-pr' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 text-center flex-shrink-0">
                  {idx < 3 ? (
                    <span className="text-xl">{medals[idx]}</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-500">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm truncate">{ex.nameEs}</p>
                    {isNew && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{prDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-white text-sm">{pr.kg}kg × {pr.reps}</p>
                  <p className="text-[10px] text-gray-600">Vol: {pr.kg * pr.reps}kg</p>
                </div>
                {hasHistory && (
                  <button
                    onClick={() => setExpandedPr(isExpanded ? null : pr.exerciseId)}
                    aria-label={isExpanded ? 'Ocultar historial' : 'Ver historial'}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
                    style={{
                      background: isExpanded ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isExpanded ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.08)'}`,
                      color: isExpanded ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm(`¿Eliminar el PR de ${ex.nameEs}?`)) deletePr(pr.exerciseId)
                  }}
                  aria-label={`Eliminar PR de ${ex.nameEs}`}
                  className="p-1.5 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  🗑
                </button>
              </div>

              {isExpanded && hasHistory && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Historial
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {[...pr.history!].reverse().map((h, hi) => (
                      <div key={hi} className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(h.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">{h.kg}kg × {h.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {prs.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-8">No hay récords aún. ¡A entrenar!</p>
        )}
      </div>
    </div>
  )
}

export function CalendarioScreen() {
  const { calendarSubTab, setCalendarSubTab } = useStore()

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-shrink-0 px-4 pt-12 pb-0">
        <h1 className="text-2xl font-bold text-white mb-4">Seguimiento</h1>

        <div className="flex bg-surface rounded-xl p-1 border border-border">
          {([['calendario', '📅 Calendario'], ['records', '🏆 Récords']] as [CalendarSubTab, string][]).map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => setCalendarSubTab(id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  calendarSubTab === id
                    ? 'bg-card text-white shadow'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 scroll-area px-4 py-4">
        {calendarSubTab === 'calendario' ? <CalendarioTab /> : <RecordsTab />}
      </div>
    </div>
  )
}
