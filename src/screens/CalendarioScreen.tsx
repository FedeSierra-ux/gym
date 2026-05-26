import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { CalendarSubTab, Workout } from '../types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function WorkoutDetailSheet({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const { routines, exercises, deleteWorkout } = useStore()
  const routine = routines.find((r) => r.id === workout.routineId)
  const date = new Date(workout.startedAt)
  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0)

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-3xl border-t border-border px-4 pt-4 pb-8 max-h-[75vh] flex flex-col screen-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-lg">
              {routine?.emoji} {routine?.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="bg-surface border border-border rounded-xl p-3 flex-1 text-center">
            <p className="text-primary font-bold text-lg">{workout.durationMin ?? 0}m</p>
            <p className="text-[10px] text-gray-500">Duración</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 flex-1 text-center">
            <p className="text-info font-bold text-lg">{workout.exercises.length}</p>
            <p className="text-[10px] text-gray-500">Ejercicios</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 flex-1 text-center">
            <p className="text-gold font-bold text-lg">{totalSets}</p>
            <p className="text-[10px] text-gray-500">Series</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 flex-1 text-center">
            <p className="text-white font-bold text-lg">{workout.kcal ?? 0}</p>
            <p className="text-[10px] text-gray-500">kcal</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {workout.exercises.map((we) => {
              const ex = exercises.find((e) => e.id === we.exerciseId)
              if (!ex) return null
              const best = we.sets.reduce((a, s) => (s.kg > a.kg ? s : a), we.sets[0])
              return (
                <div key={we.exerciseId} className="bg-surface rounded-xl border border-border p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-semibold">{ex.nameEs}</p>
                    <p className="text-gray-500 text-xs">{we.sets.length} series</p>
                  </div>
                  {best && (
                    <p className="text-gray-300 text-sm font-medium">
                      Mejor: {best.kg}kg × {best.reps}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => {
            deleteWorkout(workout.id)
            onClose()
          }}
          className="mt-4 w-full py-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-sm font-semibold"
        >
          🗑 Eliminar este entreno
        </button>
      </div>
    </div>
  )
}

function CalendarioTab() {
  const { workouts, routines, deleteWorkout } = useStore()
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

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
            const dayWorkouts = gymDayWorkouts.get(day) ?? []

            return (
              <div
                key={day}
                className="flex items-center justify-center aspect-square"
                onClick={() => {
                  if (isGym && dayWorkouts.length > 0) {
                    setSelectedWorkout(dayWorkouts[0])
                  }
                }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-all ${
                    isGym ? 'cursor-pointer active:scale-90' : ''
                  } ${
                    isToday
                      ? 'bg-primary text-black font-bold'
                      : isFuture
                      ? 'text-gray-700'
                      : isGym
                      ? 'text-primary'
                      : 'text-gray-500'
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
                onClick={() => setSelectedWorkout(w)}
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

      {selectedWorkout && (
        <WorkoutDetailSheet
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}
    </div>
  )
}

function RecordsTab() {
  const { prs, exercises, deletePr } = useStore()

  const now = Date.now()
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
          void now

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
    <div className="flex-1 flex flex-col">
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

      <div className="flex-1 scroll-area px-4 py-4">
        {calendarSubTab === 'calendario' ? <CalendarioTab /> : <RecordsTab />}
      </div>
    </div>
  )
}
