import type { Routine, RoutineExercise } from '../types'

/** Etiquetas del selector de bloque del plan. */
export const VARIANTE_LABEL = { base: 'Semanas 1-3', alt: 'Semanas 4-6' } as const

/** true si algún ejercicio de la rutina tiene series y reps para las semanas 4-6. */
export function tieneVariante(routine: Pick<Routine, 'exercises'>): boolean {
  return routine.exercises.some((re) => !!re.alt)
}

/** El ejercicio con las series y reps del bloque elegido en la rutina. */
export function ejercicioEnUso(re: RoutineExercise, variante: Routine['variante']): RoutineExercise {
  if (variante !== 'alt' || !re.alt) return re
  return { ...re, ...re.alt }
}

/**
 * La rutina tal como se entrena hoy: con "Semanas 4-6" elegido, cada ejercicio
 * que tiene variante toma sus series y reps; los demás quedan igual.
 */
export function rutinaEnUso(routine: Routine): Routine {
  if (routine.variante !== 'alt') return routine
  return { ...routine, exercises: routine.exercises.map((re) => ejercicioEnUso(re, 'alt')) }
}
