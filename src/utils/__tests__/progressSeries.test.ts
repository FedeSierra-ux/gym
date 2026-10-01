import { describe, expect, it } from 'vitest'
import { estaEstancado, sesionesSinMejora } from '../progressSeries'

describe('sesionesSinMejora', () => {
  it('cuenta desde la última marca superada', () => {
    expect(sesionesSinMejora([50, 52.5, 55])).toBe(0)
    expect(sesionesSinMejora([50, 55, 55, 52.5, 55])).toBe(3)
    expect(sesionesSinMejora([60, 60, 60, 60, 60])).toBe(4)
    expect(sesionesSinMejora([])).toBe(0)
  })

  it('estancado a partir de 4 sesiones, salvo los ejercicios por tiempo', () => {
    expect(estaEstancado({ kind: 'kg', sinMejora: 4 })).toBe(true)
    expect(estaEstancado({ kind: 'kg', sinMejora: 3 })).toBe(false)
    expect(estaEstancado({ kind: 'tiempo', sinMejora: 9 })).toBe(false)
  })
})
