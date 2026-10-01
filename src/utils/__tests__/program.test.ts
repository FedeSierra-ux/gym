import { describe, expect, it } from 'vitest'
import { faseDeSemana, inicioParaSemana, lunesDe, semanaDelPrograma } from '../program'

describe('programa por semanas', () => {
  it('cuenta semanas desde el lunes de la semana 1', () => {
    const jueves = new Date(2026, 9, 1, 15).getTime()
    expect(new Date(lunesDe(jueves)).getDate()).toBe(28) // lunes 28 de septiembre
    const inicio = inicioParaSemana(2, jueves)
    expect(semanaDelPrograma(inicio, jueves)).toBe(2)
    expect(semanaDelPrograma(inicio, new Date(2026, 9, 19, 9).getTime())).toBe(5)
    // El cambio de horario no corre la cuenta.
    expect(semanaDelPrograma(inicioParaSemana(1, new Date(2026, 2, 23).getTime()), new Date(2026, 3, 6).getTime())).toBe(3)
  })

  it('pasa a semanas 4-6 en la cuarta', () => {
    expect(faseDeSemana(3)).toBe('base')
    expect(faseDeSemana(4)).toBe('alt')
    expect(faseDeSemana(6)).toBe('alt')
  })
})
