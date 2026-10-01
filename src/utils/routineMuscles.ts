import type { MuscleGroup, Routine } from '../types'

/** Grupos que trabaja la rutina, en 1: el ícono no gradúa, sólo pinta. */
export function gruposDeRutina(routine: Pick<Routine, 'exercises'>, exercises: { id: string; muscleGroup: MuscleGroup }[]) {
  const porId = new Map(exercises.map((e) => [e.id, e.muscleGroup]))
  const niveles: Partial<Record<MuscleGroup, number>> = {}
  for (const re of routine.exercises) {
    const mg = porId.get(re.exerciseId)
    if (mg) niveles[mg] = 1
  }
  return niveles
}
