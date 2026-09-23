import { describe, expect, it } from 'vitest'
import { estimate1RM } from '../oneRM'

describe('estimate1RM', () => {
  it('con una repetición es el peso mismo', () => {
    expect(estimate1RM(100, 1)).toBe(100)
  })
  it('usa Epley y redondea', () => {
    expect(estimate1RM(80, 8)).toBe(101) // 80 × 1,2667
    expect(estimate1RM(100, 5)).toBe(117)
  })
})
