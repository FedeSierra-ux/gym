import type { MuscleGroup } from '../types'

export const muscleGroupConfig: Record<MuscleGroup, { label: string; emoji: string; color: string }> = {
  pecho: { label: 'Pecho', emoji: '🫁', color: '#FF6B6B' },
  espalda: { label: 'Espalda', emoji: '🦅', color: '#38BDF8' },
  hombros: { label: 'Hombros', emoji: '🙌', color: '#FB923C' },
  biceps: { label: 'Bíceps', emoji: '💪', color: '#F472B6' },
  triceps: { label: 'Tríceps', emoji: '🔻', color: '#A78BFA' },
  piernas: { label: 'Piernas', emoji: '🦵', color: '#34D399' },
  gluteos: { label: 'Glúteos', emoji: '🍑', color: '#EC4899' },
  core: { label: 'Core/Abs', emoji: '⬡', color: '#FCD34D' },
  cardio: { label: 'Cardio', emoji: '🫀', color: '#60A5FA' },
}
