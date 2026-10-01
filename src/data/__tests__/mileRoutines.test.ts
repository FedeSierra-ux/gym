import { describe, expect, it } from 'vitest'
import { buildMileRoutines, completarPlanMile } from '../mileRoutines'

describe('completarPlanMile', () => {
  it('agrega bloques, superseries y semanas 4-6 a una rutina guardada sin ellos', () => {
    const vieja = buildMileRoutines(0)[2]
    const sinDatos = {
      ...vieja,
      exercises: vieja.exercises.map((re) => ({
        ...re, block: undefined, alt: undefined, supersetGroup: undefined,
        sets: 5, note: 'Prensa 45° · descanso 2 min · semana 4-6: 4 × 8',
      })),
    }
    const lista = completarPlanMile(sinDatos)
    const prensa = lista.exercises.find((re) => re.exerciseId === 'piernas-03')!
    expect(prensa.block).toBe('Principal')
    expect(prensa.alt).toEqual({ sets: 4, repsMin: 8, repsMax: 8 })
    // Lo que cambió el usuario se respeta.
    expect(prensa.sets).toBe(5)
    expect(prensa.note).not.toContain('semana 4-6')
    expect(lista.exercises.filter((re) => re.supersetGroup).length).toBe(2)
  })

  it('no toca rutinas que no son del plan ni las que ya están completas', () => {
    const otra = { id: 'x', name: 'X', emoji: '💪', createdAt: 0, exercises: [] }
    expect(completarPlanMile(otra)).toBe(otra)
    const completa = buildMileRoutines(0)[0]
    expect(completarPlanMile(completa)).toBe(completa)
  })
})
