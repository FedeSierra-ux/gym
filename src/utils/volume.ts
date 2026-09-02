import type { Exercise, Workout } from '../types'

/**
 * Volumen = tonelaje: kilos × repeticiones, sumado sobre las series efectivas.
 *
 * En el gimnasio "volumen" significa esto, no cantidad de series. La pantalla de
 * Progreso contaba series y la llamaba volumen, así que tres series de 20 kg
 * pesaban lo mismo que tres de 80.
 */
export function tonelaje(workouts: Workout[], filtro?: (exerciseId: string) => boolean): number {
  let total = 0
  for (const w of workouts) {
    if (!w.finishedAt) continue
    for (const ex of w.exercises) {
      if (filtro && !filtro(ex.exerciseId)) continue
      for (const s of ex.sets) {
        if (s.isWarmup) continue
        total += s.kg * s.reps
      }
    }
  }
  return total
}

/** Series efectivas, que sigue siendo una medida útil — con su propio nombre. */
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

/** "12,4 t" arriba de mil kilos, "840 kg" abajo. */
export function formatTonelaje(kg: number): string {
  if (kg <= 0) return '—'
  if (kg >= 1000) return `${(kg / 1000).toFixed(1).replace('.', ',')} t`
  return `${Math.round(kg)} kg`
}

/** Tonelaje y series por grupo muscular en un rango. */
export interface VolumenGrupo {
  muscleGroup: string
  kg: number
  sets: number
}

export function volumenPorGrupo(
  workouts: Workout[],
  exercises: Exercise[],
  desde: number,
  hasta: number,
): VolumenGrupo[] {
  const porId = new Map(exercises.map((e) => [e.id, e]))
  const acc = new Map<string, { kg: number; sets: number }>()
  for (const w of workouts) {
    if (!w.finishedAt || w.startedAt < desde || w.startedAt >= hasta) continue
    for (const wex of w.exercises) {
      const ex = porId.get(wex.exerciseId)
      if (!ex) continue
      const actual = acc.get(ex.muscleGroup) ?? { kg: 0, sets: 0 }
      for (const s of wex.sets) {
        if (s.isWarmup) continue
        actual.kg += s.kg * s.reps
        actual.sets += 1
      }
      acc.set(ex.muscleGroup, actual)
    }
  }
  return [...acc.entries()].map(([muscleGroup, v]) => ({ muscleGroup, ...v }))
}
