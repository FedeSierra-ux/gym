import { describe, expect, it } from 'vitest'
import { resumenMensual, seriesEfectivas } from '../volume'
import { ejercicio, entreno, serie } from './helpers'

const ejercicios = [ejercicio('banca'), ejercicio('remo', { muscleGroup: 'espalda' }), ejercicio('plancha', { muscleGroup: 'core', trackingType: 'duration' })]
const sep = (dia: number) => new Date(2026, 8, dia, 10).getTime()

const workouts = [
  entreno(sep(2), [
    { exerciseId: 'banca', sets: [serie(40, 12, { isWarmup: true }), serie(80, 8), serie(80, 7)] },
    { exerciseId: 'remo', sets: [serie(60, 10)] },
  ]),
  entreno(sep(20), [
    { exerciseId: 'banca', sets: [serie(82.5, 5), serie(82.5, 6)] },
    { exerciseId: 'plancha', sets: [serie(0, 0, { durationSec: 60 }), serie(0, 0, { durationSec: 45 })] },
  ]),
  entreno(new Date(2026, 7, 28).getTime(), [{ exerciseId: 'banca', sets: [serie(75, 8)] }]),
]

describe('seriesEfectivas', () => {
  it('no cuenta el calentamiento ni los entrenos sin terminar', () => {
    const abierto = { ...entreno(sep(3), [{ exerciseId: 'banca', sets: [serie(80, 8)] }]), finishedAt: undefined }
    expect(seriesEfectivas([...workouts, abierto])).toBe(8)
  })
})

describe('resumenMensual', () => {
  const r = resumenMensual(workouts, ejercicios, 2026, 8)

  it('suma sólo el mes pedido', () => {
    expect(r.sesiones).toBe(2)
    expect(r.series).toBe(7)
  })

  it('agrupa por músculo', () => {
    const porGrupo = Object.fromEntries(r.grupos.map(g => [g.muscleGroup, g.sets]))
    expect(porGrupo).toEqual({ pecho: 4, espalda: 1, core: 2 })
  })

  it('toma el peso máximo del mes y sus mejores reps', () => {
    const banca = r.ejercicios.find(e => e.exerciseId === 'banca')
    expect(banca).toMatchObject({ sets: 4, maxKg: 82.5, repsAlMax: 6 })
  })

  it('guarda el mejor tiempo de los ejercicios por tiempo', () => {
    expect(r.ejercicios.find(e => e.exerciseId === 'plancha')?.maxSeg).toBe(60)
  })

  it('funciona con el mes anterior aunque cruce de año', () => {
    expect(resumenMensual(workouts, ejercicios, 2026, -4).series).toBe(0)
    expect(resumenMensual(workouts, ejercicios, 2026, 7).ejercicios[0].maxKg).toBe(75)
  })
})
