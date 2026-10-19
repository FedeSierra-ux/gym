import type { WorkoutExercise } from '../types'

/**
 * Lo que queda de un entreno editado a mano: sólo las series con algo hecho
 * (reps o tiempo) y sólo los ejercicios que conservan alguna. Antes
 * "+ Agregar serie" arrancaba en 0 × 0 y se guardaba como serie real, y borrar
 * todas las series persistía un entreno vacío que seguía contando para la
 * racha, los entrenos del mes y las horas.
 */
export function filtrarSeriesEditadas(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises
    .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.reps > 0 || (s.durationSec ?? 0) > 0) }))
    .filter((ex) => ex.sets.length > 0)
}
