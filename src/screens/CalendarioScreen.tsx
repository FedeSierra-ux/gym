import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import type { CalendarSubTab, Routine, Workout } from '../types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

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
  onStartWorkout: (routineId: string, dateOverride: number) => void
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
      ? Date.now()
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
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
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
              {routines.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-8">No tenés rutinas creadas aún</p>
              ) : (
                routines.map((r) => (
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

function CalendarioTab() {
  const { workouts, routines, deleteWorkout } = useStore()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null)

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
  const today = new Date()
  const todayInMonth = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1
  const daysPassed = todayInMonth > 0 ? todayInMonth : totalDays
  const attendance = Math.round((gymDaysCount / Math.max(daysPassed, 1)) * 100)

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => {
    const next = new Date(year, month + 1, 1)
    if (next <= new Date()) setViewDate(next)
  }

  const recentWorkouts = [...workouts]
    .filter((w) => w.finishedAt)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, 8)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-surface border border-border text-gray-400 hover:text-white transition-colors">
          ‹
        </button>
        <h2 className="text-base font-bold text-white">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-surface border border-border text-gray-400 hover:text-white transition-colors">
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

            return (
              <div
                key={day}
                className="flex items-center justify-center aspect-square"
                onClick={() => {
                  if (!isFuture) setSelectedDay({ day, month, year })
                }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-all ${
                    !isFuture ? 'cursor-pointer active:scale-90' : ''
                  } ${
                    isToday
                      ? 'bg-primary text-black font-bold'
                      : isFuture
                      ? 'text-gray-700'
                      : isGym
                      ? 'text-primary'
                      : 'text-gray-400'
                  }`}
                >
                  <span className="text-xs font-medium">{day}</span>
                  {isGym && !isToday && (
                    <div className="absolute bottom-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
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

          return (
            <div
              key={pr.exerciseId}
              className={`bg-card rounded-xl border p-3 flex items-center gap-3 ${
                isNew ? 'border-primary/30 pulse-pr' : 'border-border'
              }`}
            >
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
              <button
                onClick={() => deletePr(pr.exerciseId)}
                className="p-1.5 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
              >
                🗑
              </button>
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
