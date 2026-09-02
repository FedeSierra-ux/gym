import type { Workout } from '../types'

/** Clave YYYY-MM-DD en hora local (no UTC: si no, los entrenos de la noche caen al día siguiente). */
export function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Series efectivas (sin calentamiento) por día. */
export function setsByDay(workouts: Workout[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const w of workouts) {
    if (!w.finishedAt) continue
    const key = dayKey(w.startedAt)
    const sets = w.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter(s => !s.isWarmup).length,
      0
    )
    map.set(key, (map.get(key) ?? 0) + sets)
  }
  return map
}

/** Intensidad del día, para pintar la celda del calendario. */
export function levelFor(sets: number): 0 | 1 | 2 | 3 | 4 {
  if (sets <= 0) return 0
  if (sets <= 8) return 1
  if (sets <= 15) return 2
  if (sets <= 24) return 3
  return 4
}

export const LEVEL_BG = [
  '#1C1F2A',
  'rgba(232,99,74,0.38)',
  'rgba(232,99,74,0.45)',
  'rgba(232,99,74,0.70)',
  '#E8634A',
]

export interface MonthStats {
  /** Días con al menos un entreno (sin contar los días futuros). */
  trained: number
  /** Series efectivas del mes. */
  totalSets: number
  /** Días transcurridos del mes: los que cuentan para la asistencia. */
  daysCounted: number
  attendance: number
}

/** Las mismas cuentas que muestra la grilla, para el encabezado de la pantalla. */
export function monthStats(workouts: Workout[], year: number, month: number, nowTs: number): MonthStats {
  const byDay = setsByDay(workouts)
  const now = new Date(nowTs)
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let trained = 0, totalSets = 0, daysCounted = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    if (date.getTime() > endOfToday) continue
    daysCounted++
    const sets = byDay.get(dayKey(date.getTime())) ?? 0
    if (sets > 0) { trained++; totalSets += sets }
  }
  return {
    trained, totalSets, daysCounted,
    attendance: daysCounted > 0 ? Math.round((trained / daysCounted) * 100) : 0,
  }
}
