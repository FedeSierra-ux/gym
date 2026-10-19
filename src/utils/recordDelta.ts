import type { PR } from '../types'
import { formatKg } from './format'

type Marca = { kg: number; reps: number; durationSec?: number }

/**
 * Cuánto subió un récord respecto de la marca anterior (`pr.history`), listo
 * para mostrar: "+5 kg", "+2 reps", "+10 s". Null si es el primer récord del
 * ejercicio o si no hay mejora que contar. La lista de récords decía la marca
 * pero no el progreso: el delta convierte cada fila en una historia.
 */
export function mejoraDeRecord(pr: PR): string | null {
  const previa: Marca | undefined = pr.history?.[pr.history.length - 1]
  if (!previa) return null
  if (pr.durationSec || previa.durationSec) {
    const d = (pr.durationSec ?? 0) - (previa.durationSec ?? 0)
    return d > 0 ? `+${d} s` : null
  }
  if (pr.kg > 0 || previa.kg > 0) {
    const dKg = Math.round((pr.kg - previa.kg) * 100) / 100
    if (dKg > 0) return `+${formatKg(dKg)} kg`
    // Mismo peso, más repeticiones.
    if (dKg === 0 && pr.reps > previa.reps) return `+${pr.reps - previa.reps} reps`
    return null
  }
  const dReps = pr.reps - previa.reps
  return dReps > 0 ? `+${dReps} reps` : null
}
