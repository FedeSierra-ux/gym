import { dayKey } from './trainingDays'
import { lunesDe } from './program'

/** Un plan de siete días (0 = lunes → rutina, o null si es descanso). */
export type WeekPlan = Record<number, string | null>

/** Planes propios de algunas semanas, por la clave (dayKey) de su lunes. */
export type WeekOverrides = Record<string, WeekPlan>

/** Clave de la semana que contiene a `ts`: el dayKey de su lunes. */
export function claveDeSemana(ts: number): string {
  return dayKey(lunesDe(ts))
}

/**
 * El plan que rige en la semana de `ts`: el propio de esa semana si se armó
 * uno, y si no la semana por defecto.
 */
export function planDeSemana(base: WeekPlan, overrides: WeekOverrides, ts: number): WeekPlan {
  return overrides[claveDeSemana(ts)] ?? base
}
