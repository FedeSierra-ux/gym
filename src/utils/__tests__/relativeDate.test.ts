import { describe, expect, it } from 'vitest'
import { haceCuanto } from '../relativeDate'

const ahora = new Date(2026, 9, 1, 10).getTime()
const dia = (d: number, h = 12) => new Date(2026, 9, 1 - d, h).getTime()

describe('haceCuanto', () => {
  it('cuenta días de calendario', () => {
    expect(haceCuanto(dia(0, 8), ahora)).toBe('hoy')
    expect(haceCuanto(dia(1, 23), ahora)).toBe('ayer')
    expect(haceCuanto(dia(3), ahora)).toBe('hace 3 días')
    expect(haceCuanto(dia(8), ahora)).toBe('hace 1 semana')
    expect(haceCuanto(dia(20), ahora)).toBe('hace 2 semanas')
    expect(haceCuanto(dia(65), ahora)).toBe('hace 2 meses')
  })
})
