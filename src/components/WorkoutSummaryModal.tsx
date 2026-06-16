import { useStore, useAllExercises } from '../store/useStore'
import type { Workout } from '../types'

const S = {
  bg: '#0C0E14', surf: '#161821', surf2: '#1C1F2A',
  ink: '#ECEEF4', dim: '#737A8C', faint: '#3B3F4E',
  acc: '#E8634A', acc2: '#F2A93B', good: '#34D399',
  line: 'rgba(236,238,244,0.07)', line2: 'rgba(236,238,244,0.12)',
}

interface Props {
  workout: Workout
  prCount: number
  onDismiss: () => void
}

export function WorkoutSummaryModal({ workout, prCount, onDismiss }: Props) {
  const { routines, userName } = useStore()
  const exercises = useAllExercises()
  const routine = routines.find(r => r.id === workout.routineId)

  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0)
  const totalVolume = workout.exercises.reduce((a, e) =>
    a + e.sets.reduce((b, s) => b + s.kg * s.reps, 0), 0)
  const volumeStr = totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : `${Math.round(totalVolume)}`
  const kcal = workout.kcal ?? Math.round((workout.durationMin ?? 0) * 6.5)

  const topExercises = workout.exercises
    .map(we => {
      const ex = exercises.find(e => e.id === we.exerciseId)
      const vol = we.sets.reduce((a, s) => a + s.kg * s.reps, 0)
      return { ex, vol, sets: we.sets }
    })
    .filter(e => e.ex && e.vol > 0)
    .sort((a, b) => b.vol - a.vol)
    .slice(0, 3)

  const stats: [string | number, string, string, string][] = [
    [workout.durationMin ?? 0, 'min', 'Tiempo', S.acc],
    [totalSets, 'series', 'Series', S.ink],
    [volumeStr, 'kg', 'Volumen', S.acc2],
    [kcal, 'kcal', 'Calorías', S.good],
  ]

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

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '0 20px 16px', flexShrink: 0 }}>
          {stats.map(([val, unit, label, color]) => (
            <div key={label} style={{ background: S.surf2, borderRadius: 14, padding: '12px 6px', textAlign: 'center', border: `1px solid ${S.line2}` }}>
              <div style={{ fontSize: 19, fontWeight: 800, color, letterSpacing: -0.5, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 9, color: S.dim, marginTop: 2, fontWeight: 600 }}>{unit}</div>
              <div style={{ fontSize: 9, color: S.faint, marginTop: 1 }}>{label}</div>
            </div>
          ))}
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

        {/* Top exercises */}
        {topExercises.length > 0 && (
          <div style={{ padding: '0 20px 16px', flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: S.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Ejercicios destacados
            </div>
            <div className="flex flex-col gap-2">
              {topExercises.map(({ ex, sets, vol }) => {
                if (!ex) return null
                const best = sets.reduce((a, s) => s.kg > a.kg ? s : a, sets[0])
                return (
                  <div key={ex.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: S.surf2, borderRadius: 12, padding: '10px 14px',
                    border: `1px solid ${S.line2}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: S.ink }}>{ex.nameEs}</div>
                      <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>
                        {sets.length} series · mejor: {best.kg}kg × {best.reps} reps
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: S.dim, flexShrink: 0 }}>
                      {vol >= 1000 ? `${(vol / 1000).toFixed(1)}K` : Math.round(vol)}kg vol
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ padding: '4px 20px 48px', flexShrink: 0 }}>
          <button
            onClick={onDismiss}
            style={{
              width: '100%', padding: '17px 0', borderRadius: 16,
              background: `linear-gradient(135deg, ${S.acc} 0%, #d4553e 100%)`,
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
