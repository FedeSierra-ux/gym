import { useState } from 'react'
import { useStore } from '../store/useStore'
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
      if (i === 0 || streak > 0) streak++
    } else {
      if (streak > 0) break
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

export function HomeScreen() {
  const { userName, workouts, routines, exercises, prs, startWorkout, setActiveTab } = useStore()
  const [showSettings, setShowSettings] = useState(false)

  const finishedWorkouts = workouts.filter(w => w.finishedAt)
  const sortedWorkouts = [...finishedWorkouts].sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  const lastWorkout = sortedWorkouts[0]
  const lastRoutine = lastWorkout ? routines.find(r => r.id === lastWorkout.routineId) : null

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 scroll-area">
        {/* Header con gradiente */}
        <div
          className="px-5 pt-14 pb-6"
          style={{
            background: 'linear-gradient(180deg, rgba(0,255,136,0.06) 0%, rgba(7,7,13,0) 100%)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-2xl font-bold">
                <span className="text-white">Hola, </span>
                <span className="text-gradient-primary">{userName}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                style={{ background: 'rgba(30,30,42,0.6)' }}
              >
                <span className="text-lg">⚙️</span>
              </button>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,212,255,0.1))',
                  border: '1px solid rgba(0,255,136,0.3)',
                  boxShadow: '0 0 20px rgba(0,255,136,0.15)',
                }}
              >
                <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
                  <rect x="13" y="21" width="22" height="6" rx="3" fill="#00ff88"/>
                  <rect x="9" y="19" width="5" height="10" rx="2" fill="#00cc6a"/>
                  <rect x="34" y="19" width="5" height="10" rx="2" fill="#00cc6a"/>
                  <rect x="3" y="16" width="7" height="16" rx="2.5" fill="#00ff88"/>
                  <rect x="38" y="16" width="7" height="16" rx="2.5" fill="#00ff88"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 flex flex-col gap-4">
          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card rounded-2xl p-3 text-center">
              <p className="text-[22px] font-bold text-primary" style={{ textShadow: '0 0 16px rgba(0,255,136,0.4)' }}>
                {weekWorkouts.length}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Esta semana</p>
            </div>
            <div className="stat-card rounded-2xl p-3 text-center">
              <p className="text-[22px] font-bold" style={{ color: '#00d4ff', textShadow: '0 0 16px rgba(0,212,255,0.4)' }}>
                {streak > 0 ? `${streak}🔥` : '—'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Racha</p>
            </div>
            <div className="stat-card rounded-2xl p-3 text-center">
              <p className="text-[22px] font-bold" style={{ color: '#ffd700', textShadow: '0 0 16px rgba(255,215,0,0.3)' }}>
                {totalPrs}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">PRs totales</p>
            </div>
          </div>

          {/* Último entreno */}
          {lastWorkout && lastRoutine ? (
            <div className="card-glow rounded-2xl p-4">
              <p className="section-label mb-2">Último entreno</p>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    {lastRoutine.emoji} {lastRoutine.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(lastWorkout.startedAt).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatDuration(lastWorkout.durationMin ?? 0)}</p>
                    <p className="text-[10px] text-gray-500">Duración</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{lastWorkout.exercises.reduce((a, e) => a + e.sets.length, 0)}</p>
                    <p className="text-[10px] text-gray-500">Series</p>
                  </div>
                </div>
              </div>
              {weekVolumeMin > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-gray-500">Tiempo esta semana</p>
                  <p className="text-xs font-semibold text-white">{formatDuration(weekVolumeMin)}</p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="rounded-2xl p-5 text-center border border-dashed"
              style={{ borderColor: 'rgba(0,255,136,0.2)', background: 'rgba(0,255,136,0.04)' }}
            >
              <div className="text-3xl mb-2">🏋️</div>
              <p className="text-white font-semibold text-sm">¡Tu primera sesión te espera!</p>
              <p className="text-gray-500 text-xs mt-1">Creá una rutina y comenzá a entrenar</p>
            </div>
          )}

          {/* Rutina sugerida */}
          {suggestedRoutine ? (
            <div className="card-glow rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="section-label mb-1">Siguiente rutina</p>
                  <h2 className="text-lg font-bold text-white">
                    {suggestedRoutine.emoji} {suggestedRoutine.name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{suggestedRoutine.exercises.length}</p>
                  <p className="text-[10px] text-gray-500">ejercicios</p>
                  <p className="text-xs text-gray-600 mt-0.5">~{Math.round(totalDuration)}min</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {suggestedExercises.map(ex => {
                  if (!ex) return null
                  const cfg = muscleGroupConfig[ex.muscleGroup]
                  return (
                    <span
                      key={ex.id}
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{ color: cfg.color, backgroundColor: cfg.color + '18', border: `1px solid ${cfg.color}30` }}
                    >
                      {ex.nameEs}
                    </span>
                  )
                })}
                {suggestedRoutine.exercises.length > 4 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full text-gray-500 bg-surface border border-border">
                    +{suggestedRoutine.exercises.length - 4} más
                  </span>
                )}
              </div>

              <button
                onClick={() => startWorkout(suggestedRoutine.id)}
                className="w-full btn-primary-glow py-3.5 rounded-xl text-sm"
              >
                ▶ Iniciar Rutina
              </button>
            </div>
          ) : (
            <div className="card-glow rounded-2xl p-5 text-center">
              <p className="text-gray-400 text-sm mb-3">No tenés rutinas aún</p>
              <button
                onClick={() => setActiveTab('rutinas')}
                className="text-primary text-sm font-semibold underline"
              >
                Crear primera rutina →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings overlay */}
      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
