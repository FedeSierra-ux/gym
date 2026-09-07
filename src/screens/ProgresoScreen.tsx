import { useMemo, useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { ExerciseHistorySheet } from '../components/ExerciseHistorySheet'
import { Sparkline } from '../components/Sparkline'
import { buildProgressSeries, unidadDe, type ExerciseSeries } from '../utils/progressSeries'
import { volumenPorGrupo, tonelaje, formatTonelaje } from '../utils/volume'
import { formatDuration } from '../utils/duration'
import { S } from '../theme'
import type { MuscleGroup } from '../types'

type Period = '6s' | '3m' | '6m' | 'todo'
type Tab = 'fuerza' | 'volumen'


const PERIODOS: [Period, string, number][] = [
  ['6s', '6 sem', 42],
  ['3m', '3 meses', 92],
  ['6m', '6 meses', 183],
  ['todo', 'Todo', 3650],
]

const MUSCLE_ORDER: MuscleGroup[] = ['pecho', 'espalda', 'hombros', 'biceps', 'triceps', 'piernas', 'gluteos', 'core', 'cardio']

/** El valor de una marca, escrito con la unidad que corresponde al ejercicio. */
function formatValor(serie: Pick<ExerciseSeries, 'kind' | 'current' | 'currentReps'>): string {
  switch (serie.kind) {
    case 'kg': return `${serie.current} kg`
    case 'reps': return `${serie.current} reps`
    case 'tiempo': return formatDuration(serie.current)
  }
}

function formatDelta(kind: ExerciseSeries['kind'], change: number): string {
  const signo = change > 0 ? '+' : ''
  if (kind === 'tiempo') return `${signo}${Math.round(change)}s`
  return `${signo}${Math.round(change * 10) / 10} ${unidadDe(kind)}`
}

/* ------------------------------------------------------------------ Volumen */

function VolumenTab({ desde, hasta, etiqueta }: { desde: number; hasta: number; etiqueta: string }) {
  const { workouts } = useStore()
  const exercises = useAllExercises()

  const grupos = useMemo(
    () => volumenPorGrupo(workouts, exercises, desde, hasta)
      .filter(g => g.kg > 0 || g.sets > 0)
      .sort((a, b) => MUSCLE_ORDER.indexOf(a.muscleGroup as MuscleGroup) - MUSCLE_ORDER.indexOf(b.muscleGroup as MuscleGroup)),
    [workouts, exercises, desde, hasta]
  )
  const totalKg = useMemo(
    () => tonelaje(workouts.filter(w => w.startedAt >= desde && w.startedAt < hasta)),
    [workouts, desde, hasta]
  )
  const totalSeries = grupos.reduce((a, g) => a + g.sets, 0)
  const maxKg = Math.max(...grupos.map(g => g.kg), 1)

  if (grupos.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '48px 0' }}>
        <p style={{ color: S.faint, fontSize: 13 }}>Sin series registradas en {etiqueta.toLowerCase()}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Totales del periodo — las series van primero: son la cifra que se
          entiende de un vistazo, a diferencia del tonelaje con pesos livianos. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: S.surf2, borderRadius: 14, padding: '14px 12px', border: `1px solid ${S.line2}` }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: S.acc }}>{totalSeries}</div>
          <div style={{ fontSize: 11, color: S.dim, marginTop: 3 }}>Series efectivas</div>
        </div>
        <div style={{ background: S.surf2, borderRadius: 14, padding: '14px 12px', border: `1px solid ${S.line2}` }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: S.ink }}>{formatTonelaje(totalKg)}</div>
          <div style={{ fontSize: 11, color: S.dim, marginTop: 3 }}>Volumen levantado</div>
        </div>
      </div>

      <div style={{ background: S.surf, borderRadius: 18, padding: '16px 16px', border: `1px solid ${S.line2}` }}>
        <h3 style={{ fontWeight: 700, color: S.ink, fontSize: 13 }}>Volumen por grupo muscular</h3>
        <p style={{ fontSize: 11, color: S.dim, marginTop: 2, marginBottom: 14 }}>
          Kilos × repeticiones en {etiqueta.toLowerCase()}
        </p>
        <div className="flex flex-col gap-2.5">
          {grupos.map(g => {
            const cfg = muscleGroupConfig[g.muscleGroup as MuscleGroup]
            if (!cfg) return null
            return (
              <div key={g.muscleGroup} className="flex items-center gap-3">
                <div style={{ width: 74, flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                </div>
                <div className="flex-1 rounded-full overflow-hidden relative" style={{ background: S.surf2, height: 20, minWidth: 0 }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(3, (g.kg / maxKg) * 100)}%`, background: cfg.color + 'cc', transition: 'width 0.4s ease' }}
                  />
                </div>
                <div style={{ width: 64, flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: S.ink }}>{formatTonelaje(g.kg)}</span>
                  <span style={{ fontSize: 11, color: S.faint, display: 'block' }}>{g.sets} series</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- Fuerza */

function TarjetaEjercicio({ serie, onOpen }: { serie: ExerciseSeries; onOpen: () => void }) {
  const exercises = useAllExercises()
  const ex = exercises.find(e => e.id === serie.exerciseId)
  if (!ex) return null
  const cfg = muscleGroupConfig[ex.muscleGroup]
  const subió = serie.change > 0
  const bajó = serie.change < 0
  const deltaColor = subió ? S.good : bajó ? S.bad : S.dim
  const fecha = new Date(serie.lastDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  return (
    <button
      onClick={onOpen}
      aria-label={`Ver historial de ${ex.nameEs}`}
      style={{
        background: S.surf, borderRadius: 16, padding: '14px 14px 12px',
        border: `1px solid ${S.line2}`, borderLeft: `3px solid ${cfg.color}`,
        textAlign: 'left', width: '100%', cursor: 'pointer',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, color: S.ink, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ex.nameEs}
          </div>
          <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>
            <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
            {' · '}{serie.sessions} {serie.sessions === 1 ? 'sesión' : 'sesiones'} · {fecha}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.4, color: S.ink, lineHeight: 1.1 }}>
            {formatValor(serie)}
          </div>
          {serie.kind === 'kg' && serie.currentReps > 0 && (
            <div style={{ fontSize: 11, color: S.faint, marginTop: 1 }}>× {serie.currentReps} reps</div>
          )}
          {serie.change !== 0 && (
            <div style={{ fontSize: 11, fontWeight: 700, color: deltaColor, marginTop: 2 }}>
              {subió ? '↑' : '↓'} {formatDelta(serie.kind, serie.change)}
            </div>
          )}
        </div>
      </div>
      {serie.points.length > 1 && (
        <div style={{ height: 40 }}>
          <Sparkline values={serie.points.map(p => p.value)} color={cfg.color} />
        </div>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ Pantalla */

export function ProgresoScreen() {
  const { workouts } = useStore()
  const exercises = useAllExercises()
  const [period, setPeriod] = useState<Period>('3m')
  const [tab, setTab] = useState<Tab>('fuerza')
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const [historyExerciseId, setHistoryExerciseId] = useState<string | null>(null)
  // Una sola lectura del reloj por montaje: el render tiene que ser puro.
  const [nowTs] = useState(() => Date.now())

  const dias = PERIODOS.find(p => p[0] === period)?.[2] ?? 92
  const etiquetaPeriodo = PERIODOS.find(p => p[0] === period)?.[1] ?? ''
  const desde = nowTs - dias * 86400000

  const series = useMemo(
    () => buildProgressSeries(workouts, exercises, desde, nowTs),
    [workouts, exercises, desde, nowTs]
  )

  const nombreDe = (id: string) => exercises.find(e => e.id === id)?.nameEs ?? id
  const ordenadas = useMemo(
    () => [...series].sort((a, b) =>
      nombreDe(a.exerciseId).localeCompare(nombreDe(b.exerciseId), 'es', { sensitivity: 'base' })
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, exercises]
  )

  const gruposConDatos = [...new Set(
    ordenadas.map(s => exercises.find(e => e.id === s.exerciseId)?.muscleGroup).filter(Boolean)
  )] as string[]

  const visibles = selectedMuscle
    ? ordenadas.filter(s => exercises.find(e => e.id === s.exerciseId)?.muscleGroup === selectedMuscle)
    : ordenadas

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Encabezado fijo */}
      <div style={{ flexShrink: 0, paddingTop: 'max(60px, calc(env(safe-area-inset-top, 0px) + 22px))', paddingLeft: 22, paddingRight: 22 }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: S.ink }}>Progreso</div>

        <div style={{ display: 'flex', background: S.surf, borderRadius: 14, padding: 3, border: `1px solid ${S.line2}`, marginTop: 16 }}>
          {([['fuerza', 'Marcas'], ['volumen', 'Volumen']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, minHeight: 44, borderRadius: 11, border: 'none', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t ? S.surf2 : 'transparent', color: tab === t ? S.ink : S.dim, transition: 'all 0.15s ease-out' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', background: S.surf, borderRadius: 14, padding: 3, border: `1px solid ${S.line2}`, marginTop: 8 }}>
          {PERIODOS.map(([p, label]) => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ flex: 1, minHeight: 40, borderRadius: 11, border: 'none', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: period === p ? S.surf2 : 'transparent', color: period === p ? S.ink : S.dim, transition: 'all 0.15s ease-out' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 scroll-area" style={{ padding: '16px 22px 24px' }}>
        {tab === 'volumen' ? (
          <VolumenTab desde={desde} hasta={nowTs + 86400000} etiqueta={etiquetaPeriodo} />
        ) : (
          <>
            {gruposConDatos.length > 1 && (
              <div
                className="flex gap-2"
                style={{ marginBottom: 14, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 4, scrollbarWidth: 'none', WebkitMaskImage: 'linear-gradient(to right, #000 88%, transparent)' }}
              >
                <button
                  onClick={() => setSelectedMuscle(null)}
                  style={{
                    padding: '8px 14px', borderRadius: 20, flexShrink: 0, minHeight: 40,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    background: selectedMuscle === null ? S.acc : S.surf2,
                    border: `1px solid ${selectedMuscle === null ? S.acc : S.line2}`,
                    color: selectedMuscle === null ? '#fff' : S.dim,
                  }}
                >Todos</button>
                {gruposConDatos.map(mg => {
                  const cfg = muscleGroupConfig[mg as MuscleGroup]
                  if (!cfg) return null
                  const activo = selectedMuscle === mg
                  return (
                    <button
                      key={mg}
                      onClick={() => setSelectedMuscle(activo ? null : mg)}
                      style={{
                        padding: '8px 14px', borderRadius: 20, flexShrink: 0, minHeight: 40,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'DM Sans, system-ui, sans-serif',
                        background: activo ? cfg.color + '33' : S.surf2,
                        border: `1px solid ${activo ? cfg.color : S.line2}`,
                        color: activo ? cfg.color : S.dim,
                      }}
                    >{cfg.label}</button>
                  )
                })}
              </div>
            )}

            {visibles.length === 0 ? (
              <div className="flex items-center justify-center" style={{ padding: '48px 0' }}>
                <div className="text-center">
                  <p style={{ color: S.dim, fontSize: 13 }}>
                    {ordenadas.length > 0 ? 'Sin datos para este grupo muscular' : `Sin entrenos en ${etiquetaPeriodo.toLowerCase()}`}
                  </p>
                  {ordenadas.length === 0 && (
                    <p style={{ color: S.faint, fontSize: 11, marginTop: 4 }}>Probá con un periodo más largo</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {visibles.map(serie => (
                  <TarjetaEjercicio
                    key={serie.exerciseId}
                    serie={serie}
                    onOpen={() => setHistoryExerciseId(serie.exerciseId)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {historyExerciseId && (
        <ExerciseHistorySheet exerciseId={historyExerciseId} onClose={() => setHistoryExerciseId(null)} />
      )}
    </div>
  )
}

