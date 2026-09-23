import { describe, expect, it } from 'vitest'
import { suggestNextWeight } from '../progression'
import { DIA, ejercicio, entreno, serie } from './helpers'

const banca = ejercicio('banca')
const plan = { sets: 3, repsMin: 6, repsMax: 8 }
const ayer = Date.now() - DIA

describe('suggestNextWeight', () => {
  it('primera vez sin historial', () => {
    expect(suggestNextWeight(banca, plan, [], 'banca')?.reason).toBe('primera-vez')
  })

  it('sube el peso cuando todas las series llegaron al tope', () => {
    const w = entreno(ayer, [{ exerciseId: 'banca', sets: [serie(80, 8), serie(80, 8), serie(80, 8)] }])
    const s = suggestNextWeight(banca, plan, [w], 'banca')
    expect(s?.reason).toBe('subir')
    expect(s?.kg).toBe(82.5)
    expect(s?.targetReps).toBe(6)
  })

  it('no confunde una serie más liviana con una serie que faltó', () => {
    const w = entreno(ayer, [{ exerciseId: 'banca', sets: [serie(80, 8), serie(80, 8), serie(77.5, 7)] }])
    const s = suggestNextWeight(banca, plan, [w], 'banca')
    expect(s?.reason).toBe('mantener')
    expect(s?.kg).toBe(80)
    expect(s?.note).toContain('1 serie con menos peso')
    expect(s?.note).not.toContain('faltó')
  })

  it('avisa cuando de verdad faltaron series', () => {
    const w = entreno(ayer, [{ exerciseId: 'banca', sets: [serie(80, 8), serie(80, 8)] }])
    expect(suggestNextWeight(banca, plan, [w], 'banca')?.note).toContain('faltó 1 serie')
  })

  it('ignora el calentamiento', () => {
    const w = entreno(ayer, [{ exerciseId: 'banca', sets: [serie(40, 12, { isWarmup: true }), serie(80, 8), serie(80, 8), serie(80, 8)] }])
    expect(suggestNextWeight(banca, plan, [w], 'banca')?.reason).toBe('subir')
  })

  it('baja el peso después de más de 3 semanas sin hacerlo', () => {
    const w = entreno(Date.now() - 30 * DIA, [{ exerciseId: 'banca', sets: [serie(80, 8)] }])
    const s = suggestNextWeight(banca, plan, [w], 'banca')
    expect(s?.reason).toBe('bajar')
    expect(s?.kg).toBe(72.5)
  })

  it('no sugiere nada para los ejercicios por tiempo', () => {
    const plancha = ejercicio('plancha', { trackingType: 'duration' })
    expect(suggestNextWeight(plancha, plan, [], 'plancha')).toBeNull()
  })
})
