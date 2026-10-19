import type { Routine, Workout } from '../types'

/**
 * Las rutinas que aparecen en el mes (y si hay días de rutinas borradas),
 * para la leyenda del encabezado del calendario de la Agenda.
 */
export function rutinasDelMes(workouts: Workout[], routines: Routine[], year: number, month: number): { rutinas: Routine[]; hayBorradas: boolean } {
  const ids = new Set<string>()
  for (const w of workouts) {
    if (!w.finishedAt) continue
    const d = new Date(w.startedAt)
    if (d.getFullYear() === year && d.getMonth() === month) ids.add(w.routineId)
  }
  const rutinas = routines.filter((r) => ids.has(r.id))
  const hayBorradas = [...ids].some((id) => !routines.some((r) => r.id === id))
  return { rutinas, hayBorradas }
}
