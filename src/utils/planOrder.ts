import type { Workout } from '../types'
import { dayKey } from './trainingDays'
import { planDeSemana, type WeekOverrides } from './weekPlan'

/**
 * Plan en orden: la semana tipo fija qué días se entrena y en qué orden van
 * las rutinas, pero no ata cada rutina a un día. Si faltaste el miércoles,
 * el viernes te toca la de brazos (la siguiente a la última que hiciste) en
 * vez de saltearla.
 */

/** Las rutinas de la semana tipo, de lunes a domingo, sin días de descanso. */
export function ordenDelPlan(weekPlan: Record<number, string | null>, routineIds: string[]): string[] {
  const orden: string[] = []
  for (let dow = 0; dow < 7; dow++) {
    const id = weekPlan[dow]
    if (id && routineIds.includes(id)) orden.push(id)
  }
  return orden
}

/**
 * Posición del plan que toca ahora, recorriendo el historial en orden.
 * Una rutina que no está en el plan no lo mueve. Si se hizo una que no era la
 * esperada, el plan sigue desde ella (la próxima ocurrencia en el ciclo).
 */
export function posicionEnPlan(orden: string[], workouts: Workout[]): number {
  if (!orden.length) return 0
  let pos = 0
  const hechos = workouts.filter((w) => w.finishedAt).sort((a, b) => a.startedAt - b.startedAt)
  for (const w of hechos) {
    for (let k = 0; k < orden.length; k++) {
      const i = (pos + k) % orden.length
      if (orden[i] === w.routineId) { pos = (i + 1) % orden.length; break }
    }
  }
  return pos
}

/** La rutina que toca a continuación según el plan, o null si no hay plan. */
export function proximaDelPlan(
  weekPlan: Record<number, string | null>, routineIds: string[], workouts: Workout[],
): string | null {
  const orden = ordenDelPlan(weekPlan, routineIds)
  if (!orden.length) return null
  return orden[posicionEnPlan(orden, workouts)]
}

/**
 * Qué rutina cae en cada día de entreno a partir de hoy, siguiendo el orden.
 * Si hoy ya se entrenó, la cuenta arranca mañana.
 */
export function prediccionDelPlan(
  weekPlan: Record<number, string | null>, routineIds: string[], workouts: Workout[], nowTs: number, dias = 42,
  overrides: WeekOverrides = {},
): Map<string, string> {
  const orden = ordenDelPlan(weekPlan, routineIds)
  const out = new Map<string, string>()
  if (!orden.length) return out
  let pos = posicionEnPlan(orden, workouts)
  const hoy = new Date(nowTs)
  const entrenoHoy = workouts.some((w) => w.finishedAt && dayKey(w.startedAt) === dayKey(nowTs))
  for (let d = entrenoHoy ? 1 : 0; d < dias; d++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + d, 12)
    const dow = (fecha.getDay() + 6) % 7
    const delaSemana = planDeSemana(weekPlan, overrides, fecha.getTime())
    const id = delaSemana[dow]
    if (!id || !routineIds.includes(id)) continue
    if (delaSemana === weekPlan) {
      out.set(dayKey(fecha.getTime()), orden[pos])
      pos = (pos + 1) % orden.length
    } else {
      // Una semana con plan propio manda: cada día es la rutina que se puso,
      // y el orden por defecto sigue desde ahí.
      out.set(dayKey(fecha.getTime()), id)
      const i = orden.indexOf(id)
      if (i >= 0) pos = (i + 1) % orden.length
    }
  }
  return out
}
