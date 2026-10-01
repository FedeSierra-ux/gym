import { describe, expect, it } from 'vitest'
import { posicionEnSuperserie, separarDelSiguiente, unirConSiguiente } from '../superset'
import type { RoutineExercise } from '../../types'

const ej = (id: string, g?: string): RoutineExercise => ({ exerciseId: id, sets: 3, repsMin: 8, repsMax: 12, order: 0, supersetGroup: g })

describe('superseries', () => {
  it('une dos ejercicios y marca su posición', () => {
    const exs = unirConSiguiente([ej('a'), ej('b'), ej('c')], 0, 'g1')
    expect(exs.map((e) => e.supersetGroup)).toEqual(['g1', 'g1', undefined])
    expect(posicionEnSuperserie(exs, 0)).toEqual({ dentro: true, primero: true, ultimo: false })
    expect(posicionEnSuperserie(exs, 1)).toEqual({ dentro: true, primero: false, ultimo: true })
    expect(posicionEnSuperserie(exs, 2).dentro).toBe(false)
  })

  it('suma un tercero a la superserie existente', () => {
    const exs = unirConSiguiente([ej('a', 'g1'), ej('b', 'g1'), ej('c')], 1, 'g2')
    expect(exs.map((e) => e.supersetGroup)).toEqual(['g1', 'g1', 'g1'])
  })

  it('separar deja sin grupo al que queda solo', () => {
    const exs = separarDelSiguiente([ej('a', 'g1'), ej('b', 'g1')], 0, 'g2')
    expect(exs.map((e) => e.supersetGroup)).toEqual([undefined, undefined])
    const tres = separarDelSiguiente([ej('a', 'g1'), ej('b', 'g1'), ej('c', 'g1')], 0, 'g2')
    expect(tres.map((e) => e.supersetGroup)).toEqual([undefined, 'g2', 'g2'])
  })
})
