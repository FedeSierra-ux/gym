import { describe, expect, it } from 'vitest'
import { descansoDeNota } from '../restFromNote'

describe('descansoDeNota', () => {
  it('lee los formatos de las notas', () => {
    expect(descansoDeNota('Prensa 45° · descanso 2 min')).toBe(120)
    expect(descansoDeNota('Tras nuca con soga · descanso 1:30')).toBe(90)
    expect(descansoDeNota('descanso 1:30 · semanas 4-6 en pirámide: 15/12/10')).toBe(90)
    expect(descansoDeNota('descanso 90 s')).toBe(90)
    expect(descansoDeNota('Descanso 1 min 30')).toBe(90)
    expect(descansoDeNota("descanso 2'")).toBe(120)
    expect(descansoDeNota('descanso 2')).toBe(120)
    expect(descansoDeNota('descanso 45')).toBe(45)
  })

  it('sin descanso en la nota, null', () => {
    expect(descansoDeNota('Por pierna')).toBeNull()
    expect(descansoDeNota(undefined)).toBeNull()
    expect(descansoDeNota('4 series de 12')).toBeNull()
  })
})
