import type { Exercise, Workout, WorkoutSet } from '../../types'

export const DIA = 86400000

export function ejercicio(id: string, extra: Partial<Exercise> = {}): Exercise {
  return { id, nameEs: id, muscleGroup: 'pecho', primaryMuscles: [], equipment: 'Barra', equipmentType: 'barra', ...extra }
}

export function serie(kg: number, reps: number, extra: Partial<WorkoutSet> = {}): WorkoutSet {
  return { kg, reps, completedAt: 0, ...extra }
}

export function entreno(startedAt: number, exercises: Workout['exercises'], id = String(startedAt)): Workout {
  return { id, routineId: 'r1', startedAt, finishedAt: startedAt + 3600000, exercises }
}
