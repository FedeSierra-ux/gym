import { useEffect, useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { isDurationExercise, formatDuration, totalSeconds } from '../utils/duration'
import { getWorkoutTip } from '../utils/aiCoach'
import type { NavTab, Workout } from '../types'
import { formatKg, formatLoad } from '../utils/format'
import { S } from '../theme'

/** Volumen de un entreno: kilos × reps de las series efectivas. */
function volumenDe(w: Workout): number {
  return w.exercises.reduce((a, e) => a + e.sets.filter(s => !s.isWarmup).reduce((b, s) => b + s.kg * s.reps, 0), 0)
}

function seriesDe(w: Workout): number {
  return w.exercises.reduce((a, e) => a + e.sets.filter(s => !s.isWarmup).length, 0)
}

/** Diferencia con signo, lista para mostrar: "+3", "−5", "=" */
function delta(actual: number, antes: number, unidad = ''): { texto: string; signo: number } {
  const d = Math.round(actual - antes)
  if (d === 0) return { texto: '=', signo: 0 }
  return { texto: `${d > 0 ? '+' : '−'}${Math.abs(d).toLocaleString('es-AR')}${unidad}`, signo: Math.sign(d) }
}


interface Props {
  workout: Workout
  prCount: number
  onDismiss: (destino?: NavTab) => void
}

export function WorkoutSummaryModal({ workout, prCount, onDismiss }: Props) {
  const { routines, userName, workouts, anthropicApiKey } = useStore()
  const exercises = useAllExercises()
  const routine = routines.find(r => r.id === workout.routineId)

  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.filter(s => !s.isWarmup).length, 0)

  const topExercises = workout.exercises
    .map(we => {
      const ex = exercises.find(e => e.id === we.exerciseId)
      const workingSets = we.sets.filter(s => !s.isWarmup)
      const vol = workingSets.reduce((a, s) => a + s.kg * s.reps, 0)
      return { ex, vol, sets: workingSets }
    })
    .filter(e => e.ex && e.vol > 0)
    .sort((a, b) => b.vol - a.vol)
    .slice(0, 3)

  const [aiTip, setAiTip] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(!!anthropicApiKey)
  const [aiError, setAiError] = useState(false)

  useEffect(() => {
    if (!anthropicApiKey) return
    let cancelled = false
    const recentFinished = workouts
      .filter(w => w.finishedAt && w.routineId === workout.routineId && w.id !== workout.id)
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, 4)
    const recentTrend = recentFinished.length > 0
      ? `Últimas ${recentFinished.length} sesiones de esta rutina: ${recentFinished.map(w => `${w.durationMin ?? 0}min/${w.exercises.reduce((a, e) => a + e.sets.length, 0)}series`).join(', ')}`
      : 'Primera vez registrando esta rutina.'
    const exerciseSummaries = workout.exercises.map(we => {
      const ex = exercises.find(e => e.id === we.exerciseId)
      const best = we.sets.reduce((a, s) => (s.kg > a.kg ? s : a), we.sets[0])
      return `${ex?.nameEs ?? we.exerciseId}: ${we.sets.length} series, mejor ${formatKg(best?.kg ?? 0)}kg x ${best?.reps ?? 0}`
    })
    getWorkoutTip(anthropicApiKey, {
      routineName: routine?.name ?? 'Sesión',
      durationMin: workout.durationMin ?? 0,
      totalSets,
      newPrCount: prCount,
      exerciseSummaries,
      recentTrend,
    })
      .then(tip => { if (!cancelled) { setAiTip(tip); setAiLoading(false) } })
      .catch(() => { if (!cancelled) { setAiError(true); setAiLoading(false) } })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout.id, anthropicApiKey])

  // Contra la vez anterior de esta misma rutina: ¿fue mejor o peor que la última?
  const anterior = workouts
    .filter(w => w.finishedAt && w.routineId === workout.routineId && w.id !== workout.id && w.startedAt < workout.startedAt)
    .sort((a, b) => b.startedAt - a.startedAt)[0]
  const volumen = volumenDe(workout)
  const filas: { label: string; valor: string; antes?: string; d?: { texto: string; signo: number } }[] = [
    {
      label: 'Volumen', valor: `${Math.round(volumen).toLocaleString('es-AR')} kg`,
      antes: anterior ? `${Math.round(volumenDe(anterior)).toLocaleString('es-AR')} kg` : undefined,
      d: anterior ? delta(volumen, volumenDe(anterior), ' kg') : undefined,
    },
    {
      label: 'Series', valor: String(totalSets),
      antes: anterior ? String(seriesDe(anterior)) : undefined,
      d: anterior ? delta(totalSets, seriesDe(anterior)) : undefined,
    },
    {
      label: 'Duración', valor: `${workout.durationMin ?? 0} min`,
      antes: anterior ? `${anterior.durationMin ?? 0} min` : undefined,
      // Menos tiempo para lo mismo no es peor: la duración va sin color.
      d: anterior ? { ...delta(workout.durationMin ?? 0, anterior.durationMin ?? 0, ' min'), signo: 0 } : undefined,
    },
  ]
  const fechaAnterior = anterior
    ? new Date(anterior.startedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end"
      style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div
        className="w-full rounded-t-3xl flex flex-col sheet-enter overflow-y-auto"
        style={{ background: S.surf, borderTop: `1px solid ${S.line2}`, maxHeight: '88vh' }}
      >
        <div style={{ width: 40, height: 4, background: S.surf2, borderRadius: 2, margin: '14px auto 0', flexShrink: 0 }} />

        {/* Header */}
        <div className="text-center px-6 pt-5 pb-4" style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 10 }}>
            {routine?.emoji ?? '🏋️'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: S.ink, letterSpacing: -0.5 }}>
            ¡Entreno completado!
          </div>
          <div style={{ fontSize: 14, color: S.dim, marginTop: 5 }}>
            {routine?.name ?? 'Sesión'}
            {userName ? ` · Buen trabajo, ${userName}` : ''}
          </div>
        </div>

        {/* Contra la vez anterior de esta rutina */}
        <div style={{ margin: '0 20px 16px', flexShrink: 0, background: S.surf2, borderRadius: 14, border: `1px solid ${S.line2}`, padding: '4px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', columnGap: 14, alignItems: 'baseline', padding: '8px 0 6px', borderBottom: `1px solid ${S.line}` }}>
            <span style={{ fontSize: 11, color: S.faint, fontWeight: 600 }}>{fechaAnterior ? `Contra el ${fechaAnterior}` : 'Primera vez con esta rutina'}</span>
            <span style={{ fontSize: 11, color: S.faint, fontWeight: 600, textAlign: 'right' }}>Hoy</span>
            <span style={{ fontSize: 11, color: S.faint, fontWeight: 600, textAlign: 'right', minWidth: 64 }}>{anterior ? 'Diferencia' : ''}</span>
          </div>
          {filas.map(f => (
            <div key={f.label} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', columnGap: 14, alignItems: 'baseline', padding: '9px 0', borderBottom: `1px solid ${S.line}` }}>
              <span style={{ fontSize: 13, color: S.dim }}>{f.label}</span>
              <span className="num" style={{ fontSize: 15, fontWeight: 700, color: S.ink, textAlign: 'right' }}>{f.valor}</span>
              <span className="num" style={{
                fontSize: 13, fontWeight: 700, textAlign: 'right', minWidth: 64,
                color: !f.d || f.d.signo === 0 ? S.dim : f.d.signo > 0 ? S.good : S.bad,
              }}>
                {f.d?.texto ?? ''}
              </span>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', columnGap: 14, alignItems: 'baseline', padding: '9px 0 8px' }}>
            <span style={{ fontSize: 13, color: S.dim }}>Récords</span>
            <span className="num" style={{ fontSize: 15, fontWeight: 700, color: prCount > 0 ? S.acc2 : S.ink, textAlign: 'right' }}>{prCount}</span>
            <span style={{ minWidth: 64 }} />
          </div>
        </div>

        {/* PR banner */}
        {prCount > 0 && (
          <div style={{
            margin: '0 20px 16px', flexShrink: 0,
            background: 'rgba(242,169,59,0.10)', border: `1px solid rgba(242,169,59,0.28)`,
            borderRadius: 14, padding: '13px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 30 }}>🏆</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: S.acc2 }}>
                {prCount === 1 ? '¡Nuevo récord personal!' : `¡${prCount} nuevos récords!`}
              </div>
              <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>Actualizados en tus récords</div>
            </div>
          </div>
        )}

        {/* AI Coach tip */}
        {anthropicApiKey && (aiLoading || aiTip) && !aiError && (
          <div style={{
            margin: '0 20px 16px', flexShrink: 0,
            background: 'rgba(232,99,74,0.08)', border: `1px solid rgba(232,99,74,0.22)`,
            borderRadius: 14, padding: '13px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.acc, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Coach IA</div>
              <div style={{ fontSize: 13, color: S.ink, marginTop: 3, lineHeight: 1.4 }}>
                {aiLoading ? 'Analizando tu entreno...' : aiTip}
              </div>
            </div>
          </div>
        )}

        {/* Top exercises */}
        {topExercises.length > 0 && (
          <div style={{ padding: '0 20px 16px', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Ejercicios destacados
            </div>
            <div className="flex flex-col gap-2">
              {topExercises.map(({ ex, sets, vol }) => {
                if (!ex) return null
                const best = sets.reduce((a, s) => s.kg > a.kg ? s : a, sets[0])
                const byTime = isDurationExercise(ex)
                return (
                  <div key={ex.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: S.surf2, borderRadius: 12, padding: '10px 14px',
                    border: `1px solid ${S.line2}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: S.ink }}>{ex.nameEs}</div>
                      <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>
                        {byTime
                          ? `${sets.length} × ${formatDuration(totalSeconds(sets) / Math.max(1, sets.length))} · total ${formatDuration(totalSeconds(sets))}`
                          : `${sets.length} series · mejor: ${formatLoad(best.kg, best.reps)}`}
                      </div>
                    </div>
                    {!byTime && (
                      <div className="num" style={{ fontSize: 12, fontWeight: 700, color: S.dim, flexShrink: 0 }}>
                        {Math.round(vol).toLocaleString('es-AR')} kg
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA — dos salidas, y cada una va adonde dice */}
        <div style={{ padding: '4px 20px 48px', flexShrink: 0, display: 'flex', gap: 10 }}>
          <button
            onClick={() => onDismiss('home')}
            style={{
              flex: 1, minHeight: 54, borderRadius: 16,
              background: S.surf2, border: `1px solid ${S.line2}`, color: S.ink,
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Listo
          </button>
          <button
            onClick={() => onDismiss('progreso')}
            style={{
              flex: 1.4, minHeight: 54, borderRadius: 16,
              background: `linear-gradient(135deg, ${S.acc} 0%, ${S.accDim} 100%)`,
              border: 'none', color: '#fff',
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              letterSpacing: 0.3,
            }}
          >
            Ver mi progreso →
          </button>
        </div>
      </div>
    </div>
  )
}
