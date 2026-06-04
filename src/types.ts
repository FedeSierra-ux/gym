export type MuscleGroup =
  | 'pecho' | 'espalda' | 'hombros' | 'biceps'
  | 'triceps' | 'piernas' | 'gluteos' | 'core' | 'cardio'

export type ExerciseEquipment =
  | 'barra' | 'mancuernas' | 'cable' | 'maquina'
  | 'peso_corporal' | 'kettlebell' | 'banda' | 'cardio_maquina'

export interface Exercise {
  id: string
  nameEs: string
  nameArg?: string   // nombre vernacular argentino (ej: "Press de Banco")
  nameEn?: string    // nombre en inglés para búsqueda en wger API
  muscleGroup: MuscleGroup
  primaryMuscles: string[]
  equipment: string
  equipmentType?: ExerciseEquipment
  wgerId?: number
  image?: string     // GIF URL de ExerciseDB (hardcodeado para los 79 ejercicios base)
  instructions?: string[]
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
  history?: Array<{ kg: number; reps: number; date: number }>
}

export type NavTab = 'home' | 'rutinas' | 'calendario' | 'progreso'
export type CalendarSubTab = 'calendario' | 'records'

export interface AppToast {
  id: string
  message: string
  type: 'success' | 'pr' | 'info'
}

export interface ActiveWorkoutSet {
  kg: string
  reps: string
  completed: boolean
  isWarmup?: boolean
}

export interface ActiveWorkoutExercise {
  exerciseId: string
  sets: ActiveWorkoutSet[]
}

export type ExerciseTips = Record<string, string>

export interface AppSettings {
  anthropicApiKey: string
  openAiApiKey: string
  aiProvider: 'anthropic' | 'openai' | 'none'
}
