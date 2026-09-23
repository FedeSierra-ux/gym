import { describe, expect, it } from 'vitest'
import { computeRecords } from '../records'
import { ejercicio, entreno, serie } from './helpers'

describe('computeRecords', () => {
  const ejercicios = [ejercicio('banca'), ejercicio('dominadas', { equipmentType: 'peso_corporal' }), ejercicio('plancha', { trackingType: 'duration' })]

  it('el récord de kg es el peso más alto, y a igual peso más reps', () => {
    const ws = [
      entreno(1, [{ exerciseId: 'banca', sets: [serie(80, 6), serie(80, 8)] }]),
      entreno(2, [{ exerciseId: 'banca', sets: [serie(100, 3, { isWarmup: true }), serie(77.5, 10)] }]),
    ]
    const pr = computeRecords(ws, ejercicios).find(p => p.exerciseId === 'banca')
    expect(pr).toMatchObject({ kg: 80, reps: 8 })
  })

  it('a peso corporal cuentan las reps, y por tiempo los segundos', () => {
    const ws = [entreno(1, [
      { exerciseId: 'dominadas', sets: [serie(0, 8), serie(0, 11)] },
      { exerciseId: 'plancha', sets: [serie(0, 0, { durationSec: 50 }), serie(0, 0, { durationSec: 70 })] },
    ])]
    const prs = computeRecords(ws, ejercicios)
    expect(prs.find(p => p.exerciseId === 'dominadas')?.reps).toBe(11)
    expect(prs.find(p => p.exerciseId === 'plancha')?.durationSec).toBe(70)
  })
})
