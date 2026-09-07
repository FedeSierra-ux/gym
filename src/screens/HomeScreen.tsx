import { useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { CircularRing } from '../components/CircularRing'
import { BackupReminder } from '../components/BackupReminder'
import { getWorkoutStreak } from '../utils/streak'
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
  const diasPlanificados = plannedDowSet(weekPlan, routines.map(r => r.id)).size
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

  const userInitial = userName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
      <div className="flex-1 min-h-0 scroll-area">

        {/* Header */}
        <div style={{ paddingTop: 'max(60px, calc(env(safe-area-inset-top, 0px) + 22px))', paddingLeft: 22, paddingRight: 22 }}>
          <div className="flex justify-between items-center">
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dim)', letterSpacing: 0.3 }}>
                {formatDate()}
              </div>
              <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.4, marginTop: 2, color: 'var(--ink)' }}>
                Hola, {userName}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('perfil')}
              aria-label="Abrir perfil"
              style={{
                flexShrink: 0, width: 44, height: 44, borderRadius: 22,
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

        {/* Qué toca hoy — lo primero, con el botón de arrancar sobre el pliegue */}
        <div style={{ padding: '16px 22px 0' }}>
          {suggestedRoutine ? (
            <div style={{ background: 'var(--surf)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--line2)' }}>
              <div style={{ padding: '16px 18px 14px' }}>
                <div className="flex items-center justify-between gap-2" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dim)', letterSpacing: 0.3 }}>
                    {yaEntreneHoy ? 'Próximo entreno' : esDelPlan ? 'Hoy te toca' : esDescansoPlanificado ? 'Hoy descansás' : 'Próximo entreno'}
                  </span>
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
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: 'var(--ink)' }}>
                  {suggestedRoutine.emoji} {suggestedRoutine.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>
                  {suggestedExerciseCount} ejercicios · ~{approxMinutes} min · {previewExercises.map(e => e?.name).filter(Boolean).slice(0, 2).join(', ')}
                  {suggestedExerciseCount > 2 ? '…' : ''}
                </div>
              </div>
              <button
                onClick={() => startWorkout(suggestedRoutine.id)}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, var(--acc) 0%, var(--primary-dim) 100%)', border: 'none',
                  color: '#fff', fontSize: 16, fontWeight: 700, minHeight: 56,
                  cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif', letterSpacing: 0.3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 13 }}>▶</span> Iniciar entreno
              </button>
              {/* Cualquier otra rutina, sin pasar por la pestaña Rutinas */}
              {routines.length > 1 && (
                <div
                  className="flex gap-2"
                  style={{ padding: '10px 14px 12px', overflowX: 'auto', scrollbarWidth: 'none', borderTop: '1px solid var(--line)' }}
                >
                  {routines.filter(r => r.id !== suggestedRoutine.id).map(r => (
                    <button
                      key={r.id}
                      onClick={() => startWorkout(r.id)}
                      style={{
                        flexShrink: 0, minHeight: 40, padding: '0 14px', borderRadius: 12,
                        background: 'var(--surf2)', border: '1px solid var(--line2)',
                        color: 'var(--dim)', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                      }}
                    >
                      {r.emoji} {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ borderRadius: 18, padding: 20, border: '1.5px dashed var(--line2)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️</div>
              <p style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 14 }}>¡Tu primera sesión te espera!</p>
              <button
                onClick={() => setActiveTab('rutinas')}
                style={{ color: 'var(--acc)', fontSize: 13, fontWeight: 600, marginTop: 8, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Crear primera rutina →
              </button>
            </div>
          )}
        </div>

        {/* Últimos 30 días — una línea, no una tarjeta con un anillo en cero */}
        <div style={{ padding: '12px 22px 0' }}>
          <div
            style={{
              background: 'var(--surf)', borderRadius: 14, border: '1px solid var(--line2)',
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <CircularRing value={ringPct} size={40} strokeWidth={4} color="var(--acc)" trackColor="var(--line2)">
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{ventana.workouts}</span>
            </CircularRing>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                {ventana.workouts} de {metaVentana} en 30 días
              </div>
              <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>
                {ventana.perWeek} por semana · {ventana.hours}h
                {windowPrCount > 0 && ` · ${windowPrCount} PRs`}
              </div>
            </div>
            <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: streak.atRisk ? 'var(--acc)' : 'var(--acc2)' }}>
                🔥 {streak.current}
              </span>
              <span style={{ fontSize: 11, color: 'var(--dim)' }}>seguidos</span>
            </div>
          </div>
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
