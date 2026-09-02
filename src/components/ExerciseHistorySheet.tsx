import { useMemo } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { ExerciseThumbnail } from './ExerciseThumbnail'
import { S } from '../theme'


function estimate1RM(kg: number, reps: number): number {
  if (reps <= 1) return kg
  return Math.round(kg * (1 + reps / 30))
}

interface SessionEntry {
  date: number
  bestKg: number
  bestReps: number
  totalSets: number
  totalVolume: number // Σ kg×reps de las series efectivas
  sets: { kg: number; reps: number }[]
}

export function ExerciseHistorySheet({ exerciseId, onClose }: { exerciseId: string; onClose: () => void }) {
  const { workouts, prs } = useStore()
  const allExercises = useAllExercises()
  const exercise = allExercises.find((e) => e.id === exerciseId)
  const pr = prs.find((p) => p.exerciseId === exerciseId)

  const sessions = useMemo<SessionEntry[]>(() => {
    const entries: SessionEntry[] = []
    for (const w of workouts) {
      if (!w.finishedAt) continue
      const wex = w.exercises.find((e) => e.exerciseId === exerciseId)
      if (!wex) continue
      const working = wex.sets.filter((s) => !s.isWarmup && s.kg > 0)
      if (working.length === 0) continue
      let bestKg = 0
      let bestReps = 0
      let totalVolume = 0
      for (const s of working) {
        totalVolume += s.kg * s.reps
        if (s.kg > bestKg || (s.kg === bestKg && s.reps > bestReps)) {
          bestKg = s.kg
          bestReps = s.reps
        }
      }
      entries.push({
        date: w.startedAt,
        bestKg,
        bestReps,
        totalSets: working.length,
        totalVolume,
        sets: working.map((s) => ({ kg: s.kg, reps: s.reps })),
      })
    }
    return entries.sort((a, b) => a.date - b.date)
  }, [workouts, exerciseId])

  const maxKg = Math.max(...sessions.map((s) => s.bestKg), 1)
  const firstKg = sessions[0]?.bestKg ?? 0
  const currentKg = sessions[sessions.length - 1]?.bestKg ?? 0
  const change = currentKg - firstKg
  const config = exercise ? muscleGroupConfig[exercise.muscleGroup] : null

  const fmtDate = (ms: number) =>
    new Date(ms).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' })

  return (
    <div className="absolute inset-0 z-50 flex flex-col sheet-enter" style={{ background: S.bg }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: '48px 20px 16px', borderBottom: `1px solid ${S.line2}` }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Volver"
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: S.surf2, border: `1px solid ${S.line2}`, color: S.dim,
              fontSize: 20, cursor: 'pointer', lineHeight: 1,
            }}
          >
            ‹
          </button>
          {exercise && <ExerciseThumbnail exercise={exercise} size={40} />}
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 17, fontWeight: 700, color: S.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {exercise?.nameEs ?? 'Ejercicio'}
            </div>
            {config && (
              <div style={{ fontSize: 12, color: config.color, fontWeight: 600, marginTop: 2 }}>
                {config.emoji} {config.label}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 scroll-area" style={{ padding: '16px 20px 32px' }}>
        {sessions.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: 200 }}>
            <div className="text-center">
              <p style={{ color: S.dim, fontSize: 14 }}>Todavía no registraste este ejercicio</p>
              <p style={{ color: S.faint, fontSize: 12, marginTop: 4 }}>Completá una serie para ver tu historial</p>
            </div>
          </div>
        ) : (
          <>
            {/* Resumen */}
            <div className="flex gap-2" style={{ marginBottom: 16 }}>
              <div style={{ flex: 1, background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: S.ink, letterSpacing: -0.5 }}>{currentKg}<span style={{ fontSize: 12, color: S.dim, fontWeight: 500 }}>kg</span></div>
                <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>Máx actual</div>
              </div>
              <div style={{ flex: 1, background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: S.acc2, letterSpacing: -0.5 }}>
                  {pr ? `${pr.kg}×${pr.reps}` : '—'}
                </div>
                <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>🏆 Récord</div>
              </div>
              <div style={{ flex: 1, background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: change > 0 ? S.good : change < 0 ? '#f87171' : S.ink }}>
                  {change > 0 ? '+' : ''}{change}<span style={{ fontSize: 12, color: S.dim, fontWeight: 500 }}>kg</span>
                </div>
                <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>Progreso</div>
              </div>
            </div>

            {/* Gráfico de tendencia (mejor kg por sesión) */}
            <div style={{ background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 16, padding: '16px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: S.ink, marginBottom: 12 }}>Mejor peso por sesión</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
                {sessions.slice(-16).map((s, i, arr) => {
                  const isLast = i === arr.length - 1
                  const h = Math.max(Math.round((s.bestKg / maxKg) * 100), 8)
                  return (
                    <div key={s.date} className="flex-1 flex flex-col items-center justify-end" style={{ minWidth: 0 }} title={`${fmtDate(s.date)} · ${s.bestKg}kg × ${s.bestReps}`}>
                      <div style={{ fontSize: 11, color: isLast ? S.acc : S.faint, fontWeight: 600, marginBottom: 3 }}>{s.bestKg}</div>
                      <div style={{
                        width: '100%', height: `${h}%`, minHeight: 4, borderRadius: '4px 4px 0 0',
                        background: isLast ? S.acc : 'rgba(232,99,74,0.28)', transition: 'height 0.4s ease',
                      }} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Lista de sesiones (más reciente primero) */}
            <div style={{ fontSize: 12, fontWeight: 700, color: S.dim, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              Historial · {sessions.length} sesiones
            </div>
            <div className="flex flex-col gap-2">
              {[...sessions].reverse().map((s) => (
                <div key={s.date} style={{ background: S.surf, border: `1px solid ${S.line2}`, borderRadius: 14, padding: '12px 14px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: S.ink, textTransform: 'capitalize' }}>{fmtDate(s.date)}</span>
                    <span style={{ fontSize: 11, color: S.dim }}>
                      {s.bestKg}kg × {s.bestReps} · ~1RM {estimate1RM(s.bestKg, s.bestReps)}kg
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.sets.map((set, idx) => {
                      const isBest = set.kg === s.bestKg && set.reps === s.bestReps
                      return (
                        <span key={idx} style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 7,
                          background: isBest ? 'rgba(232,99,74,0.15)' : S.surf2,
                          border: `1px solid ${isBest ? 'rgba(232,99,74,0.35)' : S.line2}`,
                          color: isBest ? S.acc : S.dim,
                        }}>
                          {set.kg}×{set.reps}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
