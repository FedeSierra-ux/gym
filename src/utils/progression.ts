import type { Exercise, RoutineExercise, Workout } from '../types'

/**
 * Doble progresión: se mantiene el peso hasta completar TODAS las series en el
 * tope del rango de reps; recién ahí se sube el peso y se vuelve al piso del
 * rango. Es una sugerencia: la app propone, el usuario decide.
 */
export type ProgressionReason = 'subir' | 'mantener' | 'bajar' | 'primera-vez' | 'sin-datos'

export interface ProgressionSuggestion {
  /** Peso sugerido para la próxima serie. */
  kg: number
  reason: ProgressionReason
  /** Explicación corta, lista para mostrar. */
  note: string
  /** Reps objetivo de esta sesión (el piso del rango cuando se sube de peso). */
  targetReps: number
}

/** "8–12" o "10" cuando el plan fija un número exacto de reps. */
function rangeLabel(re: Pick<RoutineExercise, 'repsMin' | 'repsMax'>): string {
  return re.repsMin === re.repsMax ? `${re.repsMin}` : `${re.repsMin}–${re.repsMax}`
}

/** Si pasó más de esto desde la última vez, no sugerimos subir. */
const STALE_DAYS = 21

/** Salto de peso según el equipamiento, redondeado a lo que hay en un gimnasio. */
export function incrementFor(exercise?: Exercise | null): number {
  switch (exercise?.equipmentType) {
    case 'mancuernas':
      return 2 // 1 kg por lado, que es el salto real del rack
    case 'kettlebell':
      return 4
    case 'maquina':
    case 'cable':
      return 5
    case 'banda':
    case 'peso_corporal':
      return 0 // progresan en reps, no en kg
    case 'barra':
      return 2.5
    default:
      return 2.5
  }
}

/** Redondea al múltiplo de medio disco chico para no proponer 41,25 kg. */
function roundToStep(kg: number, step: number): number {
  if (step <= 0) return Math.round(kg * 2) / 2
  return Math.round(kg / step) * step
}

interface LastSession {
  kg: number
  reps: number[]
  date: number
}

/** Última sesión (no calentamiento) de ese ejercicio, con el peso más pesado usado. */
function lastSessionFor(exerciseId: string, workouts: Workout[]): LastSession | null {
  const done = workouts
    .filter(w => w.finishedAt)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))

  for (const workout of done) {
    const entry = workout.exercises.find(e => e.exerciseId === exerciseId)
    const sets = entry?.sets.filter(s => !s.isWarmup && s.kg > 0 && s.reps > 0) ?? []
    if (!sets.length) continue
    const kg = Math.max(...sets.map(s => s.kg))
    return {
      kg,
      // Sólo cuentan las series hechas al peso más alto de esa sesión.
      reps: sets.filter(s => s.kg === kg).map(s => s.reps),
      date: workout.finishedAt ?? workout.startedAt,
    }
  }
  return null
}

export function suggestNextWeight(
  exercise: Exercise | undefined,
  routineExercise: Pick<RoutineExercise, 'sets' | 'repsMin' | 'repsMax'>,
  workouts: Workout[],
  exerciseId: string,
): ProgressionSuggestion | null {
  // El cardio y los isométricos progresan en tiempo, no en kilos.
  if (exercise?.trackingType === 'duration') return null

  const last = lastSessionFor(exerciseId, workouts)
  if (!last) {
    return {
      kg: 0,
      reason: 'primera-vez',
      note: `Primera vez: buscá un peso que te deje llegar a ${rangeLabel(routineExercise)} reps con 1–2 en reserva.`,
      targetReps: routineExercise.repsMax,
    }
  }

  const step = incrementFor(exercise)
  const daysAgo = (Date.now() - last.date) / 86400000

  if (daysAgo > STALE_DAYS) {
    const kg = roundToStep(last.kg * 0.9, step || 2.5)
    return {
      kg,
      reason: 'bajar',
      note: `Pasaron ${Math.round(daysAgo)} días: arrancá con ${kg} kg y subí de nuevo.`,
      targetReps: routineExercise.repsMax,
    }
  }

  // Doble progresión: todas las series del peso más alto en el tope del rango.
  const seriesCompletas = last.reps.length >= routineExercise.sets
  const todasAlTope = last.reps.every(r => r >= routineExercise.repsMax)

  if (seriesCompletas && todasAlTope) {
    if (step === 0) {
      return {
        kg: last.kg,
        reason: 'subir',
        note: `Llegaste a ${routineExercise.repsMax} en todas: sumá repeticiones o lastre.`,
        targetReps: routineExercise.repsMax + 2,
      }
    }
    const kg = roundToStep(last.kg + step, step)
    return {
      kg,
      reason: 'subir',
      note: `${last.reps.join('/')} la última vez: subí a ${kg} kg y volvé a ${routineExercise.repsMin} reps.`,
      targetReps: routineExercise.repsMin,
    }
  }

  const faltan = last.reps.filter(r => r < routineExercise.repsMax).length
  const seriesFaltantes = Math.max(0, routineExercise.sets - last.reps.length)
  return {
    kg: last.kg,
    reason: 'mantener',
    note: seriesFaltantes > 0
      ? `Mantené ${last.kg} kg: te faltaron ${seriesFaltantes} serie${seriesFaltantes > 1 ? 's' : ''} la última vez.`
      : `Mantené ${last.kg} kg hasta llegar a ${routineExercise.repsMax} en las ${routineExercise.sets} series (te falta${faltan > 1 ? 'n' : ''} ${faltan}).`,
    targetReps: routineExercise.repsMax,
  }
}
