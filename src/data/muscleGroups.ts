import type { MuscleGroup } from '../types'

export const muscleGroupConfig: Record<MuscleGroup, { label: string; emoji: string; color: string }> = {
  pecho: { label: 'Pecho', emoji: '🫁', color: '#00ff88' },
  espalda: { label: 'Espalda', emoji: '🦅', color: '#00d4ff' },
  hombros: { label: 'Hombros', emoji: '🙌', color: '#ff9500' },
  biceps: { label: 'Bíceps', emoji: '💪', color: '#ff4488' },
  triceps: { label: 'Tríceps', emoji: '🔻', color: '#aa44ff' },
  piernas: { label: 'Piernas', emoji: '🦵', color: '#ffdd00' },
  gluteos: { label: 'Glúteos', emoji: '🍑', color: '#ff7744' },
  core: { label: 'Core/Abs', emoji: '⬡', color: '#44ffdd' },
  cardio: { label: 'Cardio', emoji: '🫀', color: '#88aaff' },
}
