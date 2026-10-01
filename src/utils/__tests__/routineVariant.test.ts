import { describe, expect, it } from 'vitest'
import { rutinaEnUso, tieneVariante } from '../routineVariant'
import type { Routine } from '../../types'

const rutina: Routine = {
  id: 'r', name: 'R', emoji: '💪', createdAt: 0,
  exercises: [
    { exerciseId: 'a', sets: 3, repsMin: 10, repsMax: 10, order: 0, alt: { sets: 3, repsMin: 8, repsMax: 8 } },
    { exerciseId: 'b', sets: 4, repsMin: 12, repsMax: 12, order: 1 },
  ],
}

describe('rutinaEnUso', () => {
  it('usa las series de base salvo que se elija semanas 4-6', () => {
    expect(rutinaEnUso(rutina).exercises[0].repsMax).toBe(10)
    const alt = rutinaEnUso({ ...rutina, variante: 'alt' })
    expect(alt.exercises[0].repsMax).toBe(8)
    // Un ejercicio sin variante queda igual.
    expect(alt.exercises[1].repsMax).toBe(12)
  })

  it('detecta si la rutina tiene variante', () => {
    expect(tieneVariante(rutina)).toBe(true)
    expect(tieneVariante({ exercises: [rutina.exercises[1]] })).toBe(false)
  })
})
