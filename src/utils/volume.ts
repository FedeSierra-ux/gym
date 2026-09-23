import type { Exercise, Workout } from '../types'

/**
 * Series efectivas (sin calentamiento). Es la medida de volumen que usa la
 * app: el tonelaje (kg × reps, "4,1 t") era una cifra difícil de leer.
 */
export function seriesEfectivas(workouts: Workout[], filtro?: (exerciseId: string) => boolean): number {
  let total = 0
  for (const w of workouts) {
    if (!w.finishedAt) continue
    for (const ex of w.exercises) {
      if (filtro && !filtro(ex.exerciseId)) continue
      total += ex.sets.filter((s) => !s.isWarmup).length
    }
  }
  return total
}

/** Lo hecho con un ejercicio en un mes: series efectivas y el peso más alto. */
export interface EjercicioMes {
  exerciseId: string
  sets: number
  maxKg: number
  /** Repeticiones de la serie con el peso más alto (la mejor, si hubo empate). */
  repsAlMax: number
  /** Mejor tiempo del mes, para los ejercicios por tiempo. */
  maxSeg: number
}

export interface ResumenMes {
  sesiones: number
  series: number
  grupos: { muscleGroup: string; sets: number }[]
  ejercicios: EjercicioMes[]
}

/** Resumen de un mes calendario (mes 0-11). */
export function resumenMensual(
  workouts: Workout[],
  exercises: Exercise[],
  anio: number,
  mes: number,
): ResumenMes {
  const desde = new Date(anio, mes, 1).getTime()
  const hasta = new Date(anio, mes + 1, 1).getTime()
  const porId = new Map(exercises.map((e) => [e.id, e]))
  const grupos = new Map<string, number>()
  const ejercicios = new Map<string, EjercicioMes>()
  let sesiones = 0
  let series = 0
  for (const w of workouts) {
    if (!w.finishedAt || w.startedAt < desde || w.startedAt >= hasta) continue
    sesiones++
    for (const wex of w.exercises) {
      const efectivas = wex.sets.filter((s) => !s.isWarmup)
      if (efectivas.length === 0) continue
      const acc = ejercicios.get(wex.exerciseId) ?? { exerciseId: wex.exerciseId, sets: 0, maxKg: 0, repsAlMax: 0, maxSeg: 0 }
      for (const s of efectivas) {
        acc.sets++
        acc.maxSeg = Math.max(acc.maxSeg, s.durationSec ?? 0)
        if (s.kg > acc.maxKg || (s.kg === acc.maxKg && s.reps > acc.repsAlMax)) {
          acc.maxKg = s.kg
          acc.repsAlMax = s.reps
        }
      }
      ejercicios.set(wex.exerciseId, acc)
      series += efectivas.length
      const mg = porId.get(wex.exerciseId)?.muscleGroup
      if (mg) grupos.set(mg, (grupos.get(mg) ?? 0) + efectivas.length)
    }
  }
  return {
    sesiones,
    series,
    grupos: [...grupos.entries()].map(([muscleGroup, sets]) => ({ muscleGroup, sets })),
    ejercicios: [...ejercicios.values()],
  }
}
