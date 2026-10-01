import type { MuscleGroup } from '../types'

export const muscleGroupConfig: Record<MuscleGroup, { label: string; color: string }> = {
  pecho: { label: 'Pecho', color: '#FF6B6B' },
  espalda: { label: 'Espalda', color: '#38BDF8' },
  hombros: { label: 'Hombros', color: '#FB923C' },
  biceps: { label: 'Bíceps', color: '#F472B6' },
  triceps: { label: 'Tríceps', color: '#A78BFA' },
  piernas: { label: 'Piernas', color: '#34D399' },
  gluteos: { label: 'Glúteos', color: '#EC4899' },
  core: { label: 'Core/Abs', color: '#FCD34D' },
  cardio: { label: 'Cardio', color: '#60A5FA' },
}
