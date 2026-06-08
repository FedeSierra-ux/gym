import { useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { CircularRing } from '../components/CircularRing'
import { SettingsScreen } from './SettingsScreen'

function formatDate() {
  const now = new Date()
  const weekday = now.toLocaleDateString('es-AR', { weekday: 'long' })
  const day = now.getDate()
  const month = now.toLocaleDateString('es-AR', { month: 'long' })
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`
}

function getWeekStreak(workouts: Array<{ startedAt: number; finishedAt?: number }>) {
  const now = new Date()
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
    const end = start + 86400000
    if (workouts.some(w => w.finishedAt && w.startedAt >= start && w.startedAt < end)) {
      streak++
    } else {
      if (i === 0) continue
      break
    }
  }
  return streak
}

export function HomeScreen() {
  const { userName, workouts, routines, prs, setActiveTab, getArchivedRoutineName } = useStore()
  const allExercises = useAllExercises()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const [showSettings, setShowSettings] = useState(false)

  const finishedWorkouts = workouts.filter(w => w.finishedAt)
  const sortedWorkouts = [...finishedWorkouts].sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  const lastWorkout = sortedWorkouts[0]
  const lastRoutine = lastWorkout
    ? (routines.find(r => r.id === lastWorkout.routineId) ?? getArchivedRoutineName(lastWorkout.routineId))
    : null

  // Monthly stats
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const monthWorkouts = finishedWorkouts.filter(w => w.startedAt >= monthStart)
  const monthHours = parseFloat((monthWorkouts.reduce((a, w) => a + (w.durationMin ?? 0), 0) / 60).toFixed(1))
  const monthPrCount = prs.filter(p => p.date >= monthStart).length
  const streak = getWeekStreak(finishedWorkouts)
  const MONTHLY_GOAL = 15
  const ringPct = Math.min(Math.round((monthWorkouts.length / MONTHLY_GOAL) * 100), 100)

  // Last session stats
  const daysAgo = lastWorkout ? Math.floor((Date.now() - lastWorkout.startedAt) / 86400000) : null
  const daysAgoStr = daysAgo === null ? '' : daysAgo === 0 ? 'hoy' : daysAgo === 1 ? 'hace 1 día' : `hace ${daysAgo} días`
  const lastTotalSets = lastWorkout?.exercises.reduce((a, e) => a + e.sets.filter(s => !s.isWarmup).length, 0) ?? 0
  const lastVolume = lastWorkout?.exercises.reduce((a, e) =>
    a + e.sets.filter(s => !s.isWarmup).reduce((b, s) => b + (s.kg || 0) * (s.reps || 0), 0), 0) ?? 0
  const volumeStr = lastVolume >= 1000 ? `${(lastVolume / 1000).toFixed(1)}K kg` : `${lastVolume} kg`
  const lastKcal = lastWorkout?.kcal ?? Math.round((lastWorkout?.durationMin ?? 0) * 6.5)

  // Suggested routine
  const lastRoutineIds = sortedWorkouts.slice(0, 3).map(w => w.routineId)
  const suggestedRoutine = routines.find(r => !lastRoutineIds.includes(r.id)) ?? routines[0]
  const suggestedExerciseCount = suggestedRoutine?.exercises.length ?? 0
  const approxMinutes = Math.round((suggestedRoutine?.exercises.reduce((a, e) => a + e.sets * 2.5, 0) ?? 0))
  const previewExercises = suggestedRoutine?.exercises.slice(0, 4).map(re => {
    const ex = allExercises.find(e => e.id === re.exerciseId)
    return ex ? { name: ex.nameEs, sets: re.sets } : null
  }).filter(Boolean) ?? []
  const muscleGroups = [...new Set(
    suggestedRoutine?.exercises
      .map(re => allExercises.find(e => e.id === re.exerciseId)?.muscleGroup)
      .filter(Boolean) ?? []
  )] as string[]

  const userInitial = userName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
      <div className="flex-1 min-h-0 scroll-area">

        {/* Header */}
        <div style={{ padding: '60px 22px 0' }}>
          <div className="flex justify-between items-center">
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#737A8C', letterSpacing: 0.3 }}>
                {formatDate()}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginTop: 4, color: '#ECEEF4' }}>
                Hola, {userName} 👋
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              style={{
                width: 42, height: 42, borderRadius: 21,
                background: '#1C1F2A', border: '2px solid #E8634A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#E8634A',
              }}
            >
              {userInitial}
            </button>
          </div>
        </div>

        {/* Monthly progress card */}
        <div style={{ padding: '24px 22px 0' }}>
          <div style={{
            background: '#161821', borderRadius: 18, padding: '22px 20px',
            display: 'flex', alignItems: 'center', gap: 20,
            border: '1px solid rgba(236,238,244,0.12)',
          }}>
            <div className="relative flex-shrink-0">
              <CircularRing value={ringPct} size={72} strokeWidth={6} color="#E8634A" trackColor="rgba(236,238,244,0.12)">
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: '#ECEEF4' }}>
                    {monthWorkouts.length}
                  </span>
                  <span style={{ fontSize: 9, color: '#737A8C', fontWeight: 500 }}>de {MONTHLY_GOAL}</span>
                </div>
              </CircularRing>
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, color: '#ECEEF4' }}>
                Progreso mensual
              </div>
              <div style={{ fontSize: 12, color: '#737A8C', marginTop: 4, lineHeight: 1.5 }}>
                <span style={{ color: '#E8634A', fontWeight: 600 }}>{monthHours}h</span> entrenadas ·{' '}
                <span style={{ color: '#F2A93B', fontWeight: 600 }}>{monthPrCount} PRs</span> nuevos
              </div>
            </div>
            <div className="flex flex-col items-center gap-[2px]">
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#F2A93B' }}>{streak}</span>
              <span style={{ fontSize: 9, color: '#737A8C' }}>días</span>
            </div>
          </div>
        </div>

        {/* Next workout */}
        <div style={{ padding: '20px 22px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#737A8C', letterSpacing: 0.3, marginBottom: 12 }}>
            Próximo entreno
          </div>
          {suggestedRoutine ? (
            <div style={{
              background: '#161821', borderRadius: 18, overflow: 'hidden',
              border: '1px solid rgba(236,238,244,0.12)',
            }}>
              <div style={{ padding: '18px 18px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: '#ECEEF4' }}>
                  {suggestedRoutine.emoji} {suggestedRoutine.name}
                </div>
                <div style={{ fontSize: 12, color: '#737A8C', marginTop: 5 }}>
                  {suggestedExerciseCount} ejercicios · ~{approxMinutes} min
                </div>
                {muscleGroups.length > 0 && (
                  <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
                    {muscleGroups.slice(0, 4).map(mg => {
                      const cfg = muscleGroupConfig[mg as keyof typeof muscleGroupConfig]
                      if (!cfg) return null
                      return (
                        <span key={mg} style={{
                          fontSize: 11, fontWeight: 600, color: '#ECEEF4',
                          background: '#1C1F2A', padding: '4px 10px', borderRadius: 20,
                          border: '1px solid rgba(236,238,244,0.12)',
                        }}>
                          {cfg.emoji} {cfg.label}
                        </span>
                      )
                    })}
                  </div>
                )}
                {previewExercises.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    {previewExercises.map((ex, i) => ex && (
                      <div key={ex.name} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 0',
                        borderTop: i > 0 ? '1px solid rgba(236,238,244,0.07)' : undefined,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: '#ECEEF4' }}>{ex.name}</span>
                        <span style={{ fontSize: 12, color: '#737A8C' }}>{ex.sets} series</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => startWorkout(suggestedRoutine.id)}
                style={{
                  width: '100%', background: '#E8634A', border: 'none',
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  padding: '16px 0', cursor: 'pointer',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  letterSpacing: 0.3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.15s',
                }}
              >
                <span>▶</span> Iniciar entreno
              </button>
            </div>
          ) : (
            <div style={{
              borderRadius: 18, padding: '20px',
              border: '1.5px dashed rgba(236,238,244,0.12)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️</div>
              <p style={{ color: '#ECEEF4', fontWeight: 600, fontSize: 14 }}>¡Tu primera sesión te espera!</p>
              <button
                onClick={() => setActiveTab('rutinas')}
                style={{ color: '#E8634A', fontSize: 13, fontWeight: 600, marginTop: 8, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Crear primera rutina →
              </button>
            </div>
          )}
        </div>

        {/* Last session */}
        {lastWorkout && lastRoutine && (
          <div style={{ padding: '20px 22px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#737A8C', letterSpacing: 0.3, marginBottom: 12 }}>
              Última sesión · {daysAgoStr}
            </div>
            <div style={{
              background: '#161821', borderRadius: 18, padding: 18,
              border: '1px solid rgba(236,238,244,0.12)',
            }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>{lastRoutine.emoji}</span>
                <span style={{ fontSize: 17, fontWeight: 700, flex: 1, color: '#ECEEF4' }}>{lastRoutine.name}</span>
                <CircularRing value={lastTotalSets > 0 ? 100 : 0} size={38} strokeWidth={4} color="#E8634A" trackColor="rgba(236,238,244,0.12)" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  [`${lastWorkout.durationMin ?? 0} min`, 'Duración'],
                  [`${lastKcal}`, 'Kcal'],
                  [volumeStr, 'Volumen'],
                ].map(([v, l]) => (
                  <div key={l} style={{
                    background: '#1C1F2A', borderRadius: 12, padding: '12px 10px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.5, color: '#ECEEF4' }}>{v}</div>
                    <div style={{ fontSize: 10, color: '#737A8C', marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>

      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
    </div>
  )
}
