import { useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { CircularRing } from '../components/CircularRing'
import { BackupReminder } from '../components/BackupReminder'
import { getWorkoutStreak, MAX_GAP_DAYS } from '../utils/streak'
import { windowStats, plannedDowSet } from '../utils/trainingDays'
import { tonelaje, formatTonelaje } from '../utils/volume'

function formatDate() {
  const now = new Date()
  const weekday = now.toLocaleDateString('es-AR', { weekday: 'long' })
  const day = now.getDate()
  const month = now.toLocaleDateString('es-AR', { month: 'long' })
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`
}

export function HomeScreen() {
  const { userName, workouts, routines, prs, weekPlan, weeklyGoal, setActiveTab, getArchivedRoutineName } = useStore()
  const allExercises = useAllExercises()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)

  const finishedWorkouts = workouts.filter(w => w.finishedAt)
  const sortedWorkouts = [...finishedWorkouts].sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  const lastWorkout = sortedWorkouts[0]
  const lastRoutine = lastWorkout
    ? (routines.find(r => r.id === lastWorkout.routineId) ?? getArchivedRoutineName(lastWorkout.routineId))
    : null

  // Últimos 30 días, no el mes calendario: contando por mes, todos los días 1 la
  // app le decía "0 entrenos, 0 h, 0 PRs" a alguien que venía entrenando bien.
  const [nowTs] = useState(() => Date.now())
  const ventana = windowStats(finishedWorkouts, nowTs, 30)
  const windowPrCount = prs.filter(p => p.date >= nowTs - 30 * 86400000).length
  // Racha por entrenos encadenados, no por días corridos: entrenar día por
  // medio (o tres veces por semana cambiando los días) no la corta.
  const streak = getWorkoutStreak(finishedWorkouts, nowTs)
  // La meta sale de la semana tipo que armó el usuario; si no armó ninguna, de
  // lo que haya puesto a mano en Ajustes, y si no, de tres por semana.
  const diasPlanificados = plannedDowSet(weekPlan).size
  const porSemana = weeklyGoal ?? (diasPlanificados > 0 ? diasPlanificados : 3)
  const metaVentana = Math.round(porSemana * (30 / 7))
  const ringPct = Math.min(Math.round((ventana.workouts / Math.max(1, metaVentana)) * 100), 100)

  // Last session stats
  const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0)
  const daysAgo = lastWorkout
    ? Math.floor((todayMidnight.getTime() - new Date(lastWorkout.startedAt).setHours(0, 0, 0, 0)) / 86400000)
    : null
  const daysAgoStr = daysAgo === null ? '' : daysAgo === 0 ? 'hoy' : daysAgo === 1 ? 'hace 1 día' : `hace ${daysAgo} días`
  const lastTotalSets = lastWorkout?.exercises.reduce((a, e) => a + e.sets.filter(s => !s.isWarmup).length, 0) ?? 0
  // Volumen es tonelaje (kg × reps), que es lo que la palabra significa en el
  // gimnasio. Antes esta casilla decía "Volumen" y mostraba cantidad de series.
  const lastTonelaje = tonelaje(lastWorkout ? [lastWorkout] : [])

  // Qué toca hoy. Manda la semana tipo que armó el usuario en Agenda: antes
  // Inicio la ignoraba y elegía por rotación, así que un miércoles asignado a
  // "Full body B" podía proponer "Full body A" sin explicación.
  const hoyDow = (new Date(nowTs).getDay() + 6) % 7  // 0 = lunes
  const planDeHoy = weekPlan[hoyDow] ? routines.find(r => r.id === weekPlan[hoyDow]) : undefined
  const yaEntreneHoy = lastWorkout
    ? new Date(lastWorkout.startedAt).toDateString() === new Date(nowTs).toDateString()
    : false

  // Reserva para los días sin plan (o cuando ya hiciste lo de hoy): la rutina
  // que hace más tiempo que no tocás, evitando repetir la última.
  const lastPerformedAt = new Map<string, number>()
  for (const w of sortedWorkouts) {
    if (!lastPerformedAt.has(w.routineId)) lastPerformedAt.set(w.routineId, w.finishedAt ?? w.startedAt)
  }
  const otherRoutines = routines.filter(r => r.id !== lastWorkout?.routineId)
  const suggestionPool = otherRoutines.length > 0 ? otherRoutines : routines
  const porRotacion = [...suggestionPool].sort(
    (a, b) => (lastPerformedAt.get(a.id) ?? 0) - (lastPerformedAt.get(b.id) ?? 0)
  )[0]
  const suggestedRoutine = (!yaEntreneHoy && planDeHoy) ? planDeHoy : porRotacion
  const esDelPlan = suggestedRoutine != null && suggestedRoutine.id === planDeHoy?.id && !yaEntreneHoy
  // Día de descanso según el plan: se dice, no se esconde.
  const esDescansoPlanificado = diasPlanificados > 0 && !weekPlan[hoyDow] && !yaEntreneHoy
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
        <div style={{ paddingTop: 'max(60px, calc(env(safe-area-inset-top, 0px) + 22px))', paddingLeft: 22, paddingRight: 22 }}>
          <div className="flex justify-between items-center">
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dim)', letterSpacing: 0.3 }}>
                {formatDate()}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginTop: 4, color: 'var(--ink)' }}>
                Hola, {userName} 👋
              </div>
            </div>
            <button
              onClick={() => setActiveTab('perfil')}
              aria-label="Abrir perfil"
              style={{
                width: 42, height: 42, borderRadius: 21,
                background: 'var(--surf2)', border: '2px solid var(--acc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: 'var(--acc)',
              }}
            >
              {userInitial}
            </button>
          </div>
        </div>

        <BackupReminder />

        {/* Últimos 30 días */}
        <div style={{ padding: '24px 22px 0' }}>
          <div style={{
            background: 'var(--surf)', borderRadius: 18, padding: '22px 20px',
            display: 'flex', alignItems: 'center', gap: 20,
            border: '1px solid var(--line2)',
          }}>
            <div className="relative flex-shrink-0">
              <CircularRing value={ringPct} size={72} strokeWidth={6} color="var(--acc)" trackColor="var(--line2)">
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: 'var(--ink)' }}>
                    {ventana.workouts}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 500 }}>de {metaVentana}</span>
                </div>
              </CircularRing>
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, color: 'var(--ink)' }}>
                Últimos 30 días
              </div>
              <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--acc)', fontWeight: 600 }}>{ventana.perWeek}</span> por semana ·{' '}
                <span style={{ color: 'var(--acc)', fontWeight: 600 }}>{ventana.hours}h</span>
                {windowPrCount > 0 && (
                  <> · <span style={{ color: 'var(--acc2)', fontWeight: 600 }}>{windowPrCount} PRs</span></>
                )}
              </div>
            </div>
            <div
              className="flex flex-col items-center gap-[2px]"
              title={
                streak.current > 0
                  ? `${streak.current} entrenos seguidos · se mantiene si entrenás dentro de ${MAX_GAP_DAYS} días`
                  : 'Entrená para arrancar una racha'
              }
            >
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: streak.atRisk ? 'var(--acc)' : 'var(--acc2)' }}>
                {streak.current}
              </span>
              <span style={{ fontSize: 11, color: 'var(--dim)', textAlign: 'center', lineHeight: 1.2 }}>
                {streak.current === 1 ? 'entreno' : 'entrenos'}
              </span>
            </div>
          </div>
        </div>

        {/* Next workout */}
        <div style={{ padding: '20px 22px 0' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dim)', letterSpacing: 0.3 }}>
              {yaEntreneHoy ? 'Próximo entreno' : esDelPlan ? 'Hoy te toca' : esDescansoPlanificado ? 'Hoy descansás' : 'Próximo entreno'}
            </div>
            {esDelPlan && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--acc)', background: 'rgba(232,99,74,0.12)', border: '1px solid rgba(232,99,74,0.22)', padding: '3px 9px', borderRadius: 20 }}>
                según tu semana
              </span>
            )}
            {esDescansoPlanificado && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--dim)', background: 'var(--surf2)', border: '1px solid var(--line2)', padding: '3px 9px', borderRadius: 20 }}>
                podés adelantar
              </span>
            )}
          </div>
          {suggestedRoutine ? (
            <div style={{
              background: 'var(--surf)', borderRadius: 18, overflow: 'hidden',
              border: '1px solid var(--line2)',
            }}>
              <div style={{ padding: '18px 18px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: 'var(--ink)' }}>
                  {suggestedRoutine.emoji} {suggestedRoutine.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 5 }}>
                  {suggestedExerciseCount} ejercicios · ~{approxMinutes} min
                </div>
                {muscleGroups.length > 0 && (
                  <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
                    {muscleGroups.slice(0, 4).map(mg => {
                      const cfg = muscleGroupConfig[mg as keyof typeof muscleGroupConfig]
                      if (!cfg) return null
                      return (
                        <span key={mg} style={{
                          fontSize: 11, fontWeight: 600, color: 'var(--ink)',
                          background: 'var(--surf2)', padding: '4px 10px', borderRadius: 20,
                          border: '1px solid var(--line2)',
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
                        borderTop: i > 0 ? '1px solid var(--line)' : undefined,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: 'var(--ink)' }}>{ex.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--dim)' }}>{ex.sets} series</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => startWorkout(suggestedRoutine.id)}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, var(--acc) 0%, var(--primary-dim) 100%)', border: 'none',
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  padding: '17px 0', cursor: 'pointer',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  letterSpacing: 0.3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.15s',
                }}
              >
                <span style={{ fontSize: 14 }}>▶</span> Iniciar entreno
              </button>
            </div>
          ) : (
            <div style={{
              borderRadius: 18, padding: '20px',
              border: '1.5px dashed var(--line2)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️</div>
              <p style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 14 }}>¡Tu primera sesión te espera!</p>
              <button
                onClick={() => setActiveTab('rutinas')}
                style={{ color: 'var(--acc)', fontSize: 13, fontWeight: 600, marginTop: 8, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Crear primera rutina →
              </button>
            </div>
          )}
        </div>

        {/* Last session */}
        {lastWorkout && lastRoutine && (
          <div style={{ padding: '20px 22px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dim)', letterSpacing: 0.3, marginBottom: 12 }}>
              Última sesión · {daysAgoStr}
            </div>
            <div style={{
              background: 'var(--surf)', borderRadius: 18, padding: 18,
              border: '1px solid var(--line2)',
            }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>{lastRoutine.emoji}</span>
                <span style={{ fontSize: 17, fontWeight: 700, flex: 1, color: 'var(--ink)' }}>{lastRoutine.name}</span>
                <CircularRing value={lastTotalSets > 0 ? 100 : 0} size={38} strokeWidth={4} color="var(--acc)" trackColor="var(--line2)" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  [`${lastWorkout.durationMin ?? 0} min`, 'Duración'],
                  [`${lastTotalSets}`, 'Series'],
                  [formatTonelaje(lastTonelaje), 'Volumen'],
                ].map(([v, l]) => (
                  <div key={l} style={{
                    background: 'var(--surf2)', borderRadius: 12, padding: '12px 10px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.5, color: 'var(--ink)' }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>

    </div>
  )
}
