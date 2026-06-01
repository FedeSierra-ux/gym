import { useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { SettingsScreen } from './SettingsScreen'

function formatDuration(min: number) {
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60 > 0 ? `${min % 60}m` : ''}`
}

function getWeekStreak(workouts: Array<{ startedAt: number; finishedAt?: number }>) {
  const now = new Date()
  let streak = 0
  for (let i = 0; i < 14; i++) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
    const end = start + 86400000
    if (workouts.some(w => w.finishedAt && w.startedAt >= start && w.startedAt < end)) {
      streak++
    } else {
      if (i === 0) continue  // today not trained yet — don't break the streak
      break
    }
  }
  return streak
}

function getThisWeekWorkouts(workouts: Array<{ startedAt: number; finishedAt?: number; durationMin?: number }>) {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  return workouts.filter(w => w.finishedAt && w.startedAt >= monday.getTime())
}

function WeekDots({ workouts }: { workouts: Array<{ startedAt: number; finishedAt?: number }> }) {
  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7 // 0=Mon..6=Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - todayDow)
  monday.setHours(0, 0, 0, 0)
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div className="flex items-end justify-between px-1">
      {days.map((day, i) => {
        const dayStart = monday.getTime() + i * 86400000
        const dayEnd = dayStart + 86400000
        const hasWorkout = workouts.some(w => w.finishedAt && w.startedAt >= dayStart && w.startedAt < dayEnd)
        const isToday = i === todayDow
        const isPast = dayStart < today.getTime()

        let dotClass = 'day-dot-future'
        if (hasWorkout) dotClass = 'day-dot-active'
        else if (isToday) dotClass = 'day-dot-today'
        else if (isPast) dotClass = 'day-dot-past'

        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${dotClass}`}
            >
              {day}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}

export function HomeScreen() {
  const { userName, workouts, routines, prs, setActiveTab, getArchivedRoutineName } = useStore()
  const exercises = useAllExercises()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const [showSettings, setShowSettings] = useState(false)

  const finishedWorkouts = workouts.filter(w => w.finishedAt)
  const sortedWorkouts = [...finishedWorkouts].sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  const lastWorkout = sortedWorkouts[0]
  const lastRoutine = lastWorkout
    ? (routines.find(r => r.id === lastWorkout.routineId) ?? getArchivedRoutineName(lastWorkout.routineId))
    : null

  const streak = getWeekStreak(finishedWorkouts)
  const weekWorkouts = getThisWeekWorkouts(finishedWorkouts)
  const weekVolumeMin = weekWorkouts.reduce((acc, w) => acc + (w.durationMin ?? 0), 0)
  const totalPrs = prs.length

  const lastRoutineIds = sortedWorkouts.slice(0, 3).map(w => w.routineId)
  const suggestedRoutine = routines.find(r => !lastRoutineIds.includes(r.id)) ?? routines[0]

  const suggestedExercises = suggestedRoutine?.exercises
    .slice(0, 4)
    .map(re => exercises.find(e => e.id === re.exerciseId))
    .filter(Boolean) ?? []

  const totalDuration = suggestedRoutine?.exercises.reduce((acc, re) => acc + re.sets * 2.5, 0) ?? 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
      <div className="flex-1 min-h-0 scroll-area">
        {/* Header */}
        <div className="px-5 pt-14 pb-5 relative overflow-hidden">
          {/* Ambient glow bg */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0,255,136,0.07) 0%, transparent 70%)',
            }}
          />
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-sm font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{greeting()},</p>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-gradient-primary">{userName}</span>
              </h1>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              aria-label="Configuración"
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <GearIcon />
            </button>
          </div>
        </div>

        <div className="px-4 pb-6 flex flex-col gap-4">

          {/* Weekly activity */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.45)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">Semana actual</p>
              {weekVolumeMin > 0 && (
                <p className="text-[11px] font-semibold" style={{ color: 'rgba(0,255,136,0.7)' }}>
                  {formatDuration(weekVolumeMin)} entrenados
                </p>
              )}
            </div>
            <WeekDots workouts={finishedWorkouts} />
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="stat-card rounded-2xl p-3.5 text-center">
              <p
                className="text-2xl font-bold leading-none mb-1"
                style={{ color: 'var(--primary)', textShadow: '0 0 20px rgba(0,255,136,0.5)' }}
              >
                {weekWorkouts.length}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Esta semana
              </p>
            </div>
            <div className="stat-card rounded-2xl p-3.5 text-center">
              <p
                className="text-2xl font-bold leading-none mb-1"
                style={{ color: 'var(--info)', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}
              >
                {streak > 0 ? streak : '—'}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {streak > 0 ? 'Días seguidos' : 'Sin racha'}
              </p>
            </div>
            <div className="stat-card rounded-2xl p-3.5 text-center">
              <p
                className="text-2xl font-bold leading-none mb-1"
                style={{ color: 'var(--gold)', textShadow: '0 0 20px rgba(255,215,0,0.4)' }}
              >
                {totalPrs}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                PRs totales
              </p>
            </div>
          </div>

          {/* Último entreno */}
          {lastWorkout && lastRoutine ? (
            <div
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.45)',
              }}
            >
              <p className="section-label mb-3">Último entreno</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {lastRoutine.emoji}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{lastRoutine.name}</h2>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(lastWorkout.startedAt).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatDuration(lastWorkout.durationMin ?? 0)}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Duración</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{lastWorkout.exercises.reduce((a, e) => a + e.sets.length, 0)}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Series</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                border: '1px dashed rgba(0,255,136,0.2)',
                background: 'rgba(0,255,136,0.03)',
              }}
            >
              <div className="text-3xl mb-2">🏋️</div>
              <p className="text-white font-semibold text-sm">¡Tu primera sesión te espera!</p>
              <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Creá una rutina y comenzá a entrenar</p>
            </div>
          )}

          {/* Rutina sugerida */}
          {suggestedRoutine ? (
            <div
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0f1520 0%, #0d0d1c 100%)',
                border: '1px solid rgba(0,255,136,0.14)',
                boxShadow: '0 1px 0 rgba(0,255,136,0.08) inset, 0 8px 32px rgba(0,0,0,0.45)',
              }}
            >
              {/* Subtle corner glow */}
              <div
                className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{ background: 'radial-gradient(circle at top right, rgba(0,255,136,0.08), transparent 70%)' }}
              />
              <div className="flex items-start justify-between mb-3 relative">
                <div>
                  <p className="section-label mb-1.5">Siguiente rutina</p>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    {suggestedRoutine.emoji} {suggestedRoutine.name}
                  </h2>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-white">{suggestedRoutine.exercises.length}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>ejercicios</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>~{Math.round(totalDuration)}min</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4 relative">
                {suggestedExercises.map(ex => {
                  if (!ex) return null
                  const cfg = muscleGroupConfig[ex.muscleGroup]
                  return (
                    <span
                      key={ex.id}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ color: cfg.color, backgroundColor: cfg.color + '15', border: `1px solid ${cfg.color}25` }}
                    >
                      {ex.nameEs}
                    </span>
                  )
                })}
                {suggestedRoutine.exercises.length > 4 && (
                  <span
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    +{suggestedRoutine.exercises.length - 4} más
                  </span>
                )}
              </div>

              <button
                onClick={() => startWorkout(suggestedRoutine.id)}
                className="w-full btn-primary-glow py-3.5 rounded-xl text-sm relative"
              >
                ▶ Iniciar Rutina
              </button>
            </div>
          ) : (
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>No tenés rutinas aún</p>
              <button
                onClick={() => setActiveTab('rutinas')}
                className="text-sm font-semibold underline"
                style={{ color: 'var(--primary)' }}
              >
                Crear primera rutina →
              </button>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
