import { useHoy } from '../utils/useHoy'
import { useStore } from '../store/useStore'
import { lunesDe } from '../utils/program'
import { dayKey, inicioDeFaltas, plannedDowSet } from '../utils/trainingDays'
import { planDeSemana } from '../utils/weekPlan'
import { seriesEfectivas } from '../utils/volume'
import { S } from '../theme'

/**
 * Cómo fue la semana pasada, en una línea: días (o entrenos), series y
 * récords. Va en el bloque Semana de Inicio, al lado del dato de esta semana;
 * antes era una tarjeta propia con botón ×. Si la semana pasada no hubo
 * entrenos, no se muestra nada.
 */
export function WeeklyReview() {
  const { workouts, prs, weekPlan, weekOverrides, routines, weeklyGoal, inicioUso } = useStore()
  const nowTs = useHoy()
  const lunes = lunesDe(nowTs)

  const l = new Date(lunes)
  const lunesPasado = new Date(l.getFullYear(), l.getMonth(), l.getDate() - 7).getTime()
  const semana = workouts.filter((w) => w.finishedAt && w.startedAt >= lunesPasado && w.startedAt < lunes)
  if (!semana.length) return null

  // Si la app se empezó a usar en el medio de esa semana, cuentan sólo los días desde entonces.
  const desde = inicioDeFaltas(inicioUso, workouts) ?? lunesPasado
  const planificados = weeklyGoal ?? [...plannedDowSet(planDeSemana(weekPlan, weekOverrides, lunesPasado), routines.map((r) => r.id))]
    .filter((dow) => new Date(l.getFullYear(), l.getMonth(), l.getDate() - 7 + dow).getTime() >= desde).length
  // Días entrenados, no entrenos: dos sesiones el mismo día daban "4 de 3".
  const diasEntrenados = new Set(semana.map((w) => dayKey(w.startedAt))).size
  const series = seriesEfectivas(semana)
  const fechas = new Set(semana.map((w) => w.startedAt))
  const records = prs.reduce((n, p) => n + [p, ...(p.history ?? [])].filter((h) => fechas.has(h.date)).length, 0)

  const cifra = { color: S.ink, fontWeight: 700 } as const
  return (
    <>
      <span aria-label={`La semana pasada: ${planificados > 0 ? `${diasEntrenados} de ${planificados} días` : `${semana.length} entrenos`}`} style={{ whiteSpace: 'nowrap' }}>
        La pasada{' '}
        <b className="num" style={cifra}>{planificados > 0 ? diasEntrenados : semana.length}</b>
        {planificados > 0 ? <span className="num">/{planificados}</span> : semana.length === 1 ? ' entreno' : ' entrenos'}
      </span>
      <span style={{ whiteSpace: 'nowrap' }}>
        <b className="num" style={cifra}>{series}</b> series
        {' · '}<b className="num" style={{ ...cifra, color: records ? S.acc2 : S.ink }}>{records}</b> {records === 1 ? 'récord' : 'récords'}
      </span>
    </>
  )
}
