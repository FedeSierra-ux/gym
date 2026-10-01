import type { RoutineExercise } from '../types'

/**
 * Superseries: ejercicios consecutivos (en el orden de la rutina) con el mismo
 * `supersetGroup`. Por ahora sólo se marcan con una llave en la rutina; el
 * entreno sigue igual.
 */

/** Posición del ejercicio `idx` dentro de su superserie, si está en una. */
export function posicionEnSuperserie(exs: RoutineExercise[], idx: number): { dentro: boolean; primero: boolean; ultimo: boolean } {
  const g = exs[idx]?.supersetGroup
  const conAnterior = !!g && exs[idx - 1]?.supersetGroup === g
  const conSiguiente = !!g && exs[idx + 1]?.supersetGroup === g
  return { dentro: conAnterior || conSiguiente, primero: !conAnterior && conSiguiente, ultimo: conAnterior && !conSiguiente }
}

/** Saca el grupo a los que quedaron solos (una superserie de uno no es superserie). */
function limpiarSueltas(exs: RoutineExercise[]): RoutineExercise[] {
  return exs.map((re, i) => {
    if (!re.supersetGroup) return re
    const acompañado = exs[i - 1]?.supersetGroup === re.supersetGroup || exs[i + 1]?.supersetGroup === re.supersetGroup
    return acompañado ? re : { ...re, supersetGroup: undefined }
  })
}

/** Une el ejercicio `idx` con el siguiente en una superserie (sumándose a la que ya tengan). */
export function unirConSiguiente(exs: RoutineExercise[], idx: number, nuevoId: string): RoutineExercise[] {
  const actual = exs[idx]
  const siguiente = exs[idx + 1]
  if (!actual || !siguiente) return exs
  const grupo = actual.supersetGroup ?? siguiente.supersetGroup ?? nuevoId
  const viejoSiguiente = siguiente.supersetGroup
  return exs.map((re, i) => {
    if (i === idx || i === idx + 1) return { ...re, supersetGroup: grupo }
    // Si el siguiente ya estaba en otra superserie, la cadena se suma entera.
    if (viejoSiguiente && re.supersetGroup === viejoSiguiente && i > idx) return { ...re, supersetGroup: grupo }
    return re
  })
}

/** Corta la superserie entre `idx` y el siguiente. */
export function separarDelSiguiente(exs: RoutineExercise[], idx: number, nuevoId: string): RoutineExercise[] {
  const g = exs[idx]?.supersetGroup
  if (!g || exs[idx + 1]?.supersetGroup !== g) return exs
  let cortado = false
  const salida = exs.map((re, i) => {
    if (i <= idx) return re
    if (!cortado && re.supersetGroup === g) return { ...re, supersetGroup: nuevoId }
    cortado = true
    return re
  })
  return limpiarSueltas(salida)
}
