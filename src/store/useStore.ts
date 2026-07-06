import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import type { Exercise, Routine, Workout, PR, NavTab, CalendarSubTab, ExerciseTips, AppToast, BodyWeightEntry } from '../types'
import { exercises as exerciseDb } from '../data/exercises'
import { seedRoutines, seedWorkouts } from '../data/seedData'

interface AppState {
  // Navigation
  activeTab: NavTab
  calendarSubTab: CalendarSubTab
  activeRoutineId: string | null
  showExercisePicker: boolean

  // Data
  exercises: Exercise[]
  routines: Routine[]
  workouts: Workout[]
  prs: PR[]
  exerciseTips: ExerciseTips
  userName: string
  seeded: boolean
  onboarded: boolean
  anthropicApiKey: string
  toasts: AppToast[]
  weekPlan: Record<number, string | null>
  customExercises: Exercise[]
  archivedRoutineNames: Record<string, { name: string; emoji: string }>
  bodyWeights: BodyWeightEntry[]

  // Actions
  setActiveTab: (tab: NavTab) => void
  setCalendarSubTab: (tab: CalendarSubTab) => void
  setActiveRoutineId: (id: string | null) => void
  setShowExercisePicker: (show: boolean) => void

  // Routines
  addRoutine: (routine: Routine) => void
  updateRoutine: (routine: Routine) => void
  deleteRoutine: (id: string) => void
  addExerciseToRoutine: (routineId: string, exerciseId: string) => void
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void
  reorderRoutineExercises: (routineId: string, exercises: Routine['exercises']) => void

  // Workout history
  deleteWorkout: (id: string) => void
  updateWorkout: (workout: Workout) => void
  deletePr: (exerciseId: string) => void

  // Tips
  setExerciseTip: (exerciseId: string, tip: string) => void

  // Body weight
  addBodyWeight: (entry: BodyWeightEntry) => void

  // Profile
  updateUserName: (name: string) => void
  setOnboarded: () => void
  setAnthropicApiKey: (key: string) => void

  // Toasts
  addToast: (message: string, type: AppToast['type']) => void
  removeToast: (id: string) => void

  // Week plan
  setWeekPlanDay: (dow: number, routineId: string | null) => void

  // Custom exercises
  addCustomExercise: (ex: Exercise) => void
  deleteCustomExercise: (id: string) => void

  // Archived routines (for history display after deletion)
  getArchivedRoutineName: (routineId: string) => { name: string; emoji: string } | null

  // Seed
  seedData: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'home',
      calendarSubTab: 'calendario',
      activeRoutineId: null,
      showExercisePicker: false,
      exercises: exerciseDb,
      routines: [],
      workouts: [],
      prs: [],
      exerciseTips: {},
      userName: 'Atleta',
      seeded: false,
      onboarded: false,
      anthropicApiKey: '',
      toasts: [],
      weekPlan: {},
      customExercises: [],
      archivedRoutineNames: {},
      bodyWeights: [],

      setActiveTab: (tab) => set({ activeTab: tab }),
      setCalendarSubTab: (tab) => set({ calendarSubTab: tab }),
      setActiveRoutineId: (id) => set({ activeRoutineId: id }),
      setShowExercisePicker: (show) => set({ showExercisePicker: show }),

      addRoutine: (routine) => set((s) => ({ routines: [...s.routines, routine] })),
      updateRoutine: (routine) =>
        set((s) => ({ routines: s.routines.map((r) => (r.id === routine.id ? routine : r)) })),
      deleteRoutine: (id) => set((s) => {
        const routine = s.routines.find((r) => r.id === id)
        const archived = routine
          ? { ...s.archivedRoutineNames, [id]: { name: routine.name, emoji: routine.emoji } }
          : s.archivedRoutineNames
        return {
          routines: s.routines.filter((r) => r.id !== id),
          activeRoutineId: s.activeRoutineId === id ? null : s.activeRoutineId,
          archivedRoutineNames: archived,
        }
      }),

      addExerciseToRoutine: (routineId, exerciseId) =>
        set((s) => ({
          routines: s.routines.map((r) => {
            if (r.id !== routineId) return r
            if (r.exercises.some((e) => e.exerciseId === exerciseId)) return r
            const maxOrder = r.exercises.reduce((max, e) => Math.max(max, e.order), -1)
            return {
              ...r,
              exercises: [
                ...r.exercises,
                { exerciseId, sets: 3, repsMin: 8, repsMax: 12, order: maxOrder + 1 },
              ],
            }
          }),
        })),

      removeExerciseFromRoutine: (routineId, exerciseId) =>
        set((s) => ({
          routines: s.routines.map((r) => {
            if (r.id !== routineId) return r
            return { ...r, exercises: r.exercises.filter((e) => e.exerciseId !== exerciseId) }
          }),
        })),

      reorderRoutineExercises: (routineId, exercises) =>
        set((s) => ({
          routines: s.routines.map((r) => (r.id === routineId ? { ...r, exercises } : r)),
        })),

      deleteWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      updateWorkout: (workout) =>
        set((s) => ({ workouts: s.workouts.map((w) => (w.id === workout.id ? workout : w)) })),

      deletePr: (exerciseId) => set((s) => ({ prs: s.prs.filter((p) => p.exerciseId !== exerciseId) })),

      setExerciseTip: (exerciseId, tip) =>
        set((s) => ({ exerciseTips: { ...s.exerciseTips, [exerciseId]: tip } })),

      addBodyWeight: (entry) =>
        set((s) => ({ bodyWeights: [...s.bodyWeights, entry].sort((a, b) => a.date - b.date) })),

      updateUserName: (name) => set({ userName: name }),
      setOnboarded: () => set({ onboarded: true }),
      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      addToast: (message, type) =>
        set((s) => ({
          toasts: [...s.toasts, { id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`, message, type }],
        })),
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      setWeekPlanDay: (dow, routineId) =>
        set((s) => ({ weekPlan: { ...s.weekPlan, [dow]: routineId } })),

      addCustomExercise: (ex) =>
        set((s) => ({ customExercises: [...s.customExercises, ex] })),

      deleteCustomExercise: (id) =>
        set((s) => ({
          customExercises: s.customExercises.filter((e) => e.id !== id),
          // Remove deleted exercise from all routines to avoid orphaned refs
          routines: s.routines.map(r => ({
            ...r,
            exercises: r.exercises.filter(re => re.exerciseId !== id),
          })),
        })),

      getArchivedRoutineName: (routineId) => {
        const { archivedRoutineNames } = get()
        return archivedRoutineNames[routineId] ?? null
      },

      seedData: () => {
        const { seeded } = get()
        if (seeded) return

        const prs: PR[] = [
          { exerciseId: 'pecho-01', kg: 85, reps: 6, date: Date.now() - 86400000 * 2 },
          { exerciseId: 'espalda-01', kg: 120, reps: 4, date: Date.now() - 86400000 * 4 },
          { exerciseId: 'piernas-01', kg: 105, reps: 5, date: Date.now() - 86400000 * 6 },
          { exerciseId: 'biceps-01', kg: 42, reps: 10, date: Date.now() - 86400000 * 4 },
          { exerciseId: 'hombros-01', kg: 62.5, reps: 7, date: Date.now() - 86400000 * 2 },
        ]

        set({
          routines: seedRoutines,
          workouts: seedWorkouts,
          prs,
          seeded: true,
        })
      },
    }),
    {
      name: 'gympro-storage-v2',
      partialize: (state) => ({
        routines: state.routines,
        workouts: state.workouts,
        prs: state.prs,
        exerciseTips: state.exerciseTips,
        userName: state.userName,
        seeded: state.seeded,
        onboarded: state.onboarded,
        anthropicApiKey: state.anthropicApiKey,
        weekPlan: state.weekPlan,
        customExercises: state.customExercises,
        archivedRoutineNames: state.archivedRoutineNames,
        bodyWeights: state.bodyWeights,
      }),
    }
  )
)

/** Returns the merged list of built-in + custom exercises. Use this everywhere a user-created exercise might appear. */
export function useAllExercises(): Exercise[] {
  const exercises = useStore(s => s.exercises)
  const customExercises = useStore(s => s.customExercises)
  return useMemo(() => [...exercises, ...customExercises], [exercises, customExercises])
}
