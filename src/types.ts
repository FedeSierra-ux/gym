export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'piernas'
  | 'gluteos'
  | 'core'
  | 'cardio'

export interface Exercise {
  id: string
  nameEs: string
  muscleGroup: MuscleGroup
  primaryMuscles: string[]
  equipment: string
  icon: string
  image?: string
}

export interface RoutineExercise {
  exerciseId: string
  sets: number
  repsMin: number
  repsMax: number
  order: number
}

export interface Routine {
  id: string
  name: string
  emoji: string
  exercises: RoutineExercise[]
  createdAt: number
}

export interface WorkoutSet {
  kg: number
  reps: number
  completedAt: number
}

export interface WorkoutExercise {
  exerciseId: string
  sets: WorkoutSet[]
}

export interface Workout {
  id: string
  routineId: string
  startedAt: number
  finishedAt?: number
  durationMin?: number
  exercises: WorkoutExercise[]
  kcal?: number
}

export interface PR {
  exerciseId: string
  kg: number
  reps: number
  date: number
}

export type NavTab = 'home' | 'rutinas' | 'calendario' | 'progreso'
export type CalendarSubTab = 'calendario' | 'records'

export interface ActiveWorkoutSet {
  kg: string
  reps: string
  completed: boolean
}

export interface ActiveWorkoutExercise {
  exerciseId: string
  sets: ActiveWorkoutSet[]
}

export type ExerciseTips = Record<string, string>
