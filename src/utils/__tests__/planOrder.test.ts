import { describe, expect, it } from 'vitest'
import { ordenDelPlan, posicionEnPlan, prediccionDelPlan, proximaDelPlan } from '../planOrder'
import { dayKey } from '../trainingDays'
import { claveDeSemana, planDeSemana } from '../weekPlan'
import type { Workout } from '../../types'

const plan = { 0: 'piernas', 2: 'brazos', 4: 'full' }
const ids = ['piernas', 'brazos', 'full']
const hecho = (routineId: string, startedAt: number): Workout => ({ id: routineId + startedAt, routineId, startedAt, finishedAt: startedAt + 1, exercises: [] })

describe('plan en orden', () => {
  it('ordena las rutinas de lunes a domingo', () => {
    expect(ordenDelPlan(plan, ids)).toEqual(['piernas', 'brazos', 'full'])
    expect(ordenDelPlan({ ...plan, 4: 'borrada' }, ids)).toEqual(['piernas', 'brazos'])
  })

  it('toca la siguiente a la última hecha, aunque se haya faltado un día', () => {
    expect(proximaDelPlan(plan, ids, [])).toBe('piernas')
    expect(proximaDelPlan(plan, ids, [hecho('piernas', 1)])).toBe('brazos')
    // Se faltó el miércoles: el viernes sigue tocando brazos.
    expect(proximaDelPlan(plan, ids, [hecho('piernas', 1)])).toBe('brazos')
    expect(proximaDelPlan(plan, ids, [hecho('piernas', 1), hecho('brazos', 2), hecho('full', 3)])).toBe('piernas')
  })

  it('una rutina fuera del plan no lo mueve; una fuera de orden lo reubica', () => {
    const orden = ordenDelPlan(plan, ids)
    expect(posicionEnPlan(orden, [hecho('piernas', 1), hecho('otra', 2)])).toBe(1)
    expect(posicionEnPlan(orden, [hecho('full', 1)])).toBe(0)
  })

  it('predice los días que vienen corriendo las rutinas', () => {
    // Miércoles 7 de octubre de 2026, sin entrenar desde el lunes de piernas.
    const miercoles = new Date(2026, 9, 7, 10).getTime()
    const lunes = new Date(2026, 9, 5, 18).getTime()
    const pred = prediccionDelPlan(plan, ids, [hecho('piernas', lunes)], miercoles, 7)
    expect(pred.get(dayKey(miercoles))).toBe('brazos')
    expect(pred.get(dayKey(new Date(2026, 9, 9).getTime()))).toBe('full')
    expect(pred.get(dayKey(new Date(2026, 9, 12).getTime()))).toBe('piernas')
    // Si ya se entrenó hoy, hoy no se predice.
    const conHoy = prediccionDelPlan(plan, ids, [hecho('piernas', lunes), hecho('brazos', miercoles)], miercoles, 7)
    expect(conHoy.has(dayKey(miercoles))).toBe(false)
    expect(conHoy.get(dayKey(new Date(2026, 9, 9).getTime()))).toBe('full')
  })

  it('una semana con plan propio manda sobre la de por defecto', () => {
    // Semana del 5 al 11 de octubre: piernas el martes y full el jueves.
    const lunes = new Date(2026, 9, 5, 9).getTime()
    const propio = { 1: 'piernas', 3: 'full' }
    const pred = prediccionDelPlan(plan, ids, [], lunes, 14, { [claveDeSemana(lunes)]: propio })
    expect(pred.get(dayKey(new Date(2026, 9, 6).getTime()))).toBe('piernas')
    expect(pred.get(dayKey(new Date(2026, 9, 8).getTime()))).toBe('full')
    expect(pred.has(dayKey(new Date(2026, 9, 5).getTime()))).toBe(false)
    // La semana siguiente vuelve a la de por defecto, siguiendo desde "full".
    expect(pred.get(dayKey(new Date(2026, 9, 12).getTime()))).toBe('piernas')
  })
})

describe('planDeSemana', () => {
  it('usa la semana por defecto salvo que esa semana tenga la suya', () => {
    const jueves = new Date(2026, 9, 8, 12).getTime()
    const lunesSiguiente = new Date(2026, 9, 12, 12).getTime()
    const over = { [claveDeSemana(jueves)]: { 1: 'full' } }
    expect(planDeSemana(plan, over, jueves)).toEqual({ 1: 'full' })
    expect(planDeSemana(plan, over, lunesSiguiente)).toBe(plan)
  })
})
