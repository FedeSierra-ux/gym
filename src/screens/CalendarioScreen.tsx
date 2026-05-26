import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { CalendarSubTab } from '../types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function CalendarioTab() {
  const { workouts, routines, deleteWorkout } = useStore()
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const gymDays = new Set<number>()
  workouts
    .filter((w) => {
      if (!w.finishedAt) return false
      const d = new Date(w.startedAt)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .forEach((w) => gymDays.add(new Date(w.startedAt).getDate()))

  const totalDays = daysInMonth
  const gymDaysCount = gymDays.size
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
              <div key={day} className="flex items-center justify-center aspect-square">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-all ${
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
              <div key={w.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
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
                  onClick={() => deleteWorkout(w.id)}
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
          const daysSince = Math.floor((now - pr.date) / 86400000)
          void daysSince

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
