const DAY = 86400000

/**
 * Días que pueden pasar entre dos entrenos sin cortar la racha. Con 3 se
 * banca hasta dos días seguidos de descanso, que es lo que pasa yendo tres
 * veces por semana aunque los días cambien (lun-mié-vie, mar-jue-sáb, o
 * viernes y después el lunes).
 */
export const MAX_GAP_DAYS = 3

export interface StreakInfo {
  /** Entrenos encadenados sin pasarse del margen. */
  current: number
  /** La racha más larga que se logró alguna vez. */
  best: number
  /** Días desde el último entreno (0 = hoy). null si nunca entrenó. */
  daysSinceLast: number | null
  /** Días que quedan para entrenar antes de perder la racha. */
  daysLeft: number
  /** true cuando queda un solo día de margen. */
  atRisk: boolean
}

function dayStart(ts: number): number {
  const d = new Date(ts)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/**
 * Racha por entrenos, no por días corridos: cuenta cuántas sesiones venís
 * encadenando sin dejar pasar más de MAX_GAP_DAYS entre una y la siguiente.
 * Contar días corridos castigaba a cualquiera que entrene día por medio, que
 * es como entrena casi todo el mundo.
 */
export function getWorkoutStreak(
  workouts: Array<{ startedAt: number; finishedAt?: number }>,
  nowTs: number = Date.now(),
): StreakInfo {
  const dias = [...new Set(
    workouts.filter(w => w.finishedAt).map(w => dayStart(w.startedAt))
  )].sort((a, b) => b - a)

  if (dias.length === 0) {
    return { current: 0, best: 0, daysSinceLast: null, daysLeft: 0, atRisk: false }
  }

  const hoy = dayStart(nowTs)
  // Un entreno con fecha futura (cargado a mano) cuenta como si fuera de hoy.
  const daysSinceLast = Math.max(0, Math.round((hoy - dias[0]) / DAY))

  let current = 0
  if (daysSinceLast <= MAX_GAP_DAYS) {
    current = 1
    for (let i = 1; i < dias.length; i++) {
      const hueco = Math.round((dias[i - 1] - dias[i]) / DAY)
      if (hueco > MAX_GAP_DAYS) break
      current++
    }
  }

  // Mejor racha histórica, con el mismo criterio.
  let best = 0
  let corriendo = 0
  for (let i = dias.length - 1; i >= 0; i--) {
    if (i === dias.length - 1) corriendo = 1
    else {
      const hueco = Math.round((dias[i] - dias[i + 1]) / DAY)
      corriendo = hueco > MAX_GAP_DAYS ? 1 : corriendo + 1
    }
    if (corriendo > best) best = corriendo
  }

  const daysLeft = current > 0 ? Math.max(0, MAX_GAP_DAYS - daysSinceLast) : 0
  return { current, best, daysSinceLast, daysLeft, atRisk: current > 0 && daysLeft <= 1 }
}
