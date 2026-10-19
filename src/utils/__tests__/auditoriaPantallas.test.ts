/**
 * Regresiones de la auditoría de octubre de 2026, parte de las pantallas del
 * entreno, la Agenda y los récords: cada test reproduce un bug que se encontró
 * y pasa sólo con el arreglo.
 */
import { describe, expect, it, vi } from 'vitest'
import { filtrarSeriesEditadas } from '../entrenoEditado'
import { mejoraDeRecord } from '../recordDelta'
import { confirmarNombreRutina, nombreCortoRutina } from '../rutinaNombre'
import { esFuturo, toDateInputValue } from '../dates'
import { deltaColor, formatMedida, formatNum } from '../_pendiente'
import { S } from '../../theme'
import { DIA, serie } from './helpers'

describe('H11 · editar un entreno a mano', () => {
  it('una serie agregada y dejada en 0 × 0 no se guarda', () => {
    const [ex] = filtrarSeriesEditadas([{ exerciseId: 'a', sets: [serie(40, 10), serie(0, 0)] }])
    expect(ex.sets).toHaveLength(1)
    expect(ex.sets[0].reps).toBe(10)
  })

  it('una serie por tiempo vale aunque no tenga reps', () => {
    const [ex] = filtrarSeriesEditadas([{ exerciseId: 'plancha', sets: [serie(0, 0, { durationSec: 30 }), serie(0, 0)] }])
    expect(ex.sets).toHaveLength(1)
    expect(ex.sets[0].durationSec).toBe(30)
  })

  it('sin ninguna serie con datos no queda entreno: la pantalla pasa a borrarlo', () => {
    expect(filtrarSeriesEditadas([{ exerciseId: 'a', sets: [serie(0, 0)] }, { exerciseId: 'b', sets: [] }])).toEqual([])
  })
})

describe('H20 · la fecha del entreno en curso', () => {
  it('rechaza un día que todavía no llegó', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 18, 23, 50))
    expect(esFuturo(new Date(2026, 9, 19, 12).getTime())).toBe(true)
    expect(esFuturo(new Date(2026, 9, 18, 12).getTime())).toBe(false)
    vi.useRealTimers()
  })
})

describe('H21 · nombre del PNG del resumen', () => {
  it('usa la fecha local, no la UTC: a las 22 en Buenos Aires sigue siendo hoy', () => {
    const ts = new Date(2026, 9, 18, 22, 0).getTime()
    expect(toDateInputValue(ts)).toBe('2026-10-18')
    // toISOString ya está del lado de mañana para cualquier zona al oeste de Greenwich.
    if (new Date(ts).getTimezoneOffset() > 120) expect(new Date(ts).toISOString().slice(0, 10)).toBe('2026-10-19')
  })
})

describe('H22 · nombre de la rutina', () => {
  it('borrar todo el nombre deja el anterior', () => {
    expect(confirmarNombreRutina('   ', 'Piernas')).toBe('Piernas')
    expect(confirmarNombreRutina('  Brazos ', 'Piernas')).toBe('Brazos')
  })
})

describe('Agenda · nombre corto de la rutina en la leyenda', () => {
  it('saca el prefijo del plan y pone mayúscula inicial', () => {
    expect(nombreCortoRutina('Rutina Mile piernas')).toBe('Piernas')
    expect(nombreCortoRutina('Rutina brazos')).toBe('Brazos')
    expect(nombreCortoRutina('Rutina Mile full body')).toBe('Full')
  })
  it('un nombre propio corto queda entero', () => {
    expect(nombreCortoRutina('push')).toBe('Push')
    expect(nombreCortoRutina('Pecho y tríceps')).toBe('Pecho')
    expect(nombreCortoRutina('Rutina')).toBe('Rutina')
  })
})

describe('Récords · cuánto subió cada récord', () => {
  const base = { exerciseId: 'a', date: 10 * DIA }
  it('kilos contra la marca anterior', () => {
    expect(mejoraDeRecord({ ...base, kg: 70, reps: 15, history: [{ kg: 65, reps: 12, date: 3 * DIA }] })).toBe('+5 kg')
    expect(mejoraDeRecord({ ...base, kg: 32.5, reps: 10, history: [{ kg: 30, reps: 10, date: 3 * DIA }] })).toBe('+2,5 kg')
  })
  it('mismo peso y más repeticiones, o peso corporal', () => {
    expect(mejoraDeRecord({ ...base, kg: 40, reps: 12, history: [{ kg: 40, reps: 10, date: DIA }] })).toBe('+2 reps')
    expect(mejoraDeRecord({ ...base, kg: 0, reps: 12, history: [{ kg: 0, reps: 10, date: DIA }] })).toBe('+2 reps')
  })
  it('tiempo en los isométricos', () => {
    expect(mejoraDeRecord({ ...base, kg: 0, reps: 0, durationSec: 45, history: [{ kg: 0, reps: 0, durationSec: 30, date: DIA }] })).toBe('+15 s')
  })
  it('el primer récord no tiene contra qué compararse', () => {
    expect(mejoraDeRecord({ ...base, kg: 40, reps: 10 })).toBeNull()
    expect(mejoraDeRecord({ ...base, kg: 40, reps: 10, history: [] })).toBeNull()
  })
})

describe('semántica de deltas y formato numérico (provisorio hasta la fusión)', () => {
  it('subir es verde, bajar o igual va en gris, récord en ámbar', () => {
    expect(deltaColor(3)).toBe(S.good)
    expect(deltaColor(-3)).toBe(S.dim)
    expect(deltaColor(0)).toBe(S.dim)
    expect(deltaColor(3, 'record')).toBe(S.acc2)
  })
  it('es-AR: coma decimal y punto de miles', () => {
    expect(formatNum(3650)).toBe('3.650')
    expect(formatNum(58.2)).toBe('58,2')
    expect(formatNum(67.5, 1)).toBe('67,5')
    expect(formatMedida(58.2, 'kg')).toBe('58,2 kg')
  })
})
