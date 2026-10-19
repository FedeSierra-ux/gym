/**
 * Regresiones de las pantallas del frente 3 (Inicio, Progreso, informe de
 * ciclo, Perfil, Medidas y Ajustes): cada test reproduce un hallazgo y pasa
 * sólo con el arreglo.
 */
import { describe, expect, it } from 'vitest'
import { deltaColor, formatMedida, formatNum } from '../_pendiente3'
import { fromDateInputValue } from '../dates'
import { colors } from '../../../design-tokens.js'

describe('H27: un solo formato numérico en Medidas', () => {
  it('escribe las medidas con coma, un decimal fijo y la unidad', () => {
    expect(formatMedida(58.2, 'kg')).toBe('58,2 kg')
    expect(formatMedida(67.45, 'cm')).toBe('67,5 cm')
    expect(formatMedida(59, 'kg')).toBe('59,0 kg')
  })

  it('usa el punto de miles de es-AR en las cifras grandes', () => {
    expect(formatNum(3650)).toBe('3.650')
    expect(formatNum(109)).toBe('109')
  })
})

describe('semántica de deltas: las bajas no son errores', () => {
  it('pinta la subida en verde, la baja en gris y el récord en ámbar', () => {
    expect(deltaColor(5)).toBe(colors.good)
    expect(deltaColor(-5)).toBe(colors.dim)
    expect(deltaColor(-5)).not.toBe(colors.bad)
    expect(deltaColor(0)).toBe(colors.mute)
    expect(deltaColor(3, 'record')).toBe(colors.acc2)
  })

  it('el peso corporal es neutro: ni subir ni bajar llevan color', () => {
    expect(deltaColor(2.2, 'neutral')).toBe(colors.dim)
    expect(deltaColor(-2.2, 'neutral')).toBe(colors.dim)
  })
})

describe('H20: una fecha vacía no se convierte en "hoy" en silencio', () => {
  it('el campo de fecha vacío no da una fecha, así la hoja avisa en vez de guardar', () => {
    expect(fromDateInputValue('')).toBeNull()
    expect(fromDateInputValue('2026-10-15')).toBe(new Date(2026, 9, 15, 12).getTime())
  })
})
