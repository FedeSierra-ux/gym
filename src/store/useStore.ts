import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Exercise, Routine, Workout, PR, NavTab, CalendarSubTab, ActiveWorkoutExercise, ExerciseTips } from '../types'
import { exercises as exerciseDb } from '../data/exercises'
import { seedRoutines, seedWorkouts } from '../data/seedData'

interface ActiveWorkout {
  routineId: string
  startedAt: number
  exercises: ActiveWorkoutExercise[]
  restTimerVisible: boolean
  restSecondsLeft: number
  restTotalSeconds: number
  lastCompletedSet?: { exerciseId: string; setIdx: number; kg: number; reps: number }
}

interface AppState {
  // Navigation
  activeTab: NavTab
  calendarSubTab: CalendarSubTab
  activeRoutineId: string | null
  showExercisePicker: boolean
  activeWorkout: ActiveWorkout | null

  // Data
  exercises: Exercise[]
  routines: Routine[]
  workouts: Workout[]
  prs: PR[]
  exerciseTips: ExerciseTips
  userName: string
  seeded: boolean

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

  // Workout
  startWorkout: (routineId: string) => void
  updateSetValue: (exerciseIdx: number, setIdx: number, field: 'kg' | 'reps', value: string) => void
  completeSet: (exerciseIdx: number, setIdx: number) => void
  addSetToExercise: (exerciseIdx: number) => void
  finishWorkout: () => void
  cancelWorkout: () => void
  deleteWorkout: (id: string) => void
  deletePr: (exerciseId: string) => void
  dismissRestTimer: () => void
  adjustRestTimer: (delta: number) => void
  setRestPreset: (seconds: number) => void

  // Tips
  setExerciseTip: (exerciseId: string, tip: string) => void

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
      activeWorkout: null,
      exercises: exerciseDb,
      routines: [],
      workouts: [],
      prs: [],
      exerciseTips: {},
      userName: 'Atleta',
      seeded: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setCalendarSubTab: (tab) => set({ calendarSubTab: tab }),
      setActiveRoutineId: (id) => set({ activeRoutineId: id }),
      setShowExercisePicker: (show) => set({ showExercisePicker: show }),

      addRoutine: (routine) => set((s) => ({ routines: [...s.routines, routine] })),
      updateRoutine: (routine) =>
        set((s) => ({ routines: s.routines.map((r) => (r.id === routine.id ? routine : r)) })),
      deleteRoutine: (id) => set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      addExerciseToRoutine: (routineId, exerciseId) =>
        set((s) => ({
          routines: s.routines.map((r) => {
            if (r.id !== routineId) return r
            if (r.exercises.some((e) => e.exerciseId === exerciseId)) return r
            return {
              ...r,
              exercises: [
                ...r.exercises,
                { exerciseId, sets: 3, repsMin: 8, repsMax: 12, order: r.exercises.length },
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

      startWorkout: (routineId) => {
        const { routines, workouts, exercises: exDb } = get()
        const routine = routines.find((r) => r.id === routineId)
        if (!routine) return

        const activeExercises: ActiveWorkoutExercise[] = routine.exercises.map((re) => {
          const prevWorkout = [...workouts]
            .filter((w) => w.routineId === routineId && w.finishedAt)
            .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0]

          const prevSets = prevWorkout?.exercises.find((e) => e.exerciseId === re.exerciseId)?.sets ?? []

          const ex = exDb.find((e) => e.id === re.exerciseId)
          void ex

          return {
            exerciseId: re.exerciseId,
            sets: Array.from({ length: re.sets }, (_, i) => ({
              kg: prevSets[i] ? String(prevSets[i].kg) : '',
              reps: prevSets[i] ? String(prevSets[i].reps) : '',
              completed: false,
            })),
          }
        })

        set({
          activeWorkout: {
            routineId,
            startedAt: Date.now(),
            exercises: activeExercises,
            restTimerVisible: false,
            restSecondsLeft: 75,
            restTotalSeconds: 75,
          },
        })
      },

      updateSetValue: (exerciseIdx, setIdx, field, value) =>
        set((s) => {
          if (!s.activeWorkout) return {}
          const exercises = s.activeWorkout.exercises.map((ex, ei) => {
            if (ei !== exerciseIdx) return ex
            return {
              ...ex,
              sets: ex.sets.map((st, si) => (si === setIdx ? { ...st, [field]: value } : st)),
            }
          })
          return { activeWorkout: { ...s.activeWorkout, exercises } }
        }),

      completeSet: (exerciseIdx, setIdx) =>
        set((s) => {
          if (!s.activeWorkout) return {}
          const exercises = s.activeWorkout.exercises.map((ex, ei) => {
            if (ei !== exerciseIdx) return ex
            return {
              ...ex,
              sets: ex.sets.map((st, si) => (si === setIdx ? { ...st, completed: !st.completed } : st)),
            }
          })
          const completedSet = exercises[exerciseIdx].sets[setIdx]
          const lastCompletedSet = completedSet.completed
            ? {
                exerciseId: exercises[exerciseIdx].exerciseId,
                setIdx,
                kg: parseFloat(completedSet.kg) || 0,
                reps: parseInt(completedSet.reps) || 0,
              }
            : s.activeWorkout.lastCompletedSet

          return {
            activeWorkout: {
              ...s.activeWorkout,
              exercises,
              lastCompletedSet,
              restTimerVisible: completedSet.completed,
              restSecondsLeft: 75,
              restTotalSeconds: 75,
            },
          }
        }),

      addSetToExercise: (exerciseIdx) =>
        set((s) => {
          if (!s.activeWorkout) return {}
          const exercises = s.activeWorkout.exercises.map((ex, ei) => {
            if (ei !== exerciseIdx) return ex
            const lastSet = ex.sets[ex.sets.length - 1]
            return {
              ...ex,
              sets: [...ex.sets, { kg: lastSet?.kg ?? '', reps: lastSet?.reps ?? '', completed: false }],
            }
          })
          return { activeWorkout: { ...s.activeWorkout, exercises } }
        }),

      finishWorkout: () => {
        const { activeWorkout, routines, prs } = get()
        if (!activeWorkout) return

        const finishedAt = Date.now()
        const durationMin = Math.round((finishedAt - activeWorkout.startedAt) / 60000)

        const workoutExercises = activeWorkout.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets
            .filter((s) => s.completed)
            .map((s) => ({
              kg: parseFloat(s.kg) || 0,
              reps: parseInt(s.reps) || 0,
              completedAt: finishedAt,
            })),
        }))

        const newWorkout: Workout = {
          id: `workout-${Date.now()}`,
          routineId: activeWorkout.routineId,
          startedAt: activeWorkout.startedAt,
          finishedAt,
          durationMin,
          kcal: Math.round(durationMin * 6.5),
          exercises: workoutExercises,
        }

        const totalSets = workoutExercises.reduce((acc, ex) => acc + ex.sets.length, 0)
        const routineExerciseCount = routines.find((r) => r.id === activeWorkout.routineId)?.exercises.length ?? 1
        void totalSets
        void routineExerciseCount

        const newPrs = [...prs]
        for (const ex of workoutExercises) {
          for (const s of ex.sets) {
            const existing = newPrs.find((p) => p.exerciseId === ex.exerciseId)
            const volume = s.kg * s.reps
            const existingVolume = existing ? existing.kg * existing.reps : 0
            if (!existing || volume > existingVolume) {
              const idx = newPrs.findIndex((p) => p.exerciseId === ex.exerciseId)
              const pr = { exerciseId: ex.exerciseId, kg: s.kg, reps: s.reps, date: finishedAt }
              if (idx >= 0) newPrs[idx] = pr
              else newPrs.push(pr)
            }
          }
        }

        set((s) => ({
          workouts: [...s.workouts, newWorkout],
          prs: newPrs,
          activeWorkout: null,
          activeTab: 'home',
        }))
      },

      cancelWorkout: () => set({ activeWorkout: null }),

      deleteWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      deletePr: (exerciseId) => set((s) => ({ prs: s.prs.filter((p) => p.exerciseId !== exerciseId) })),

      setExerciseTip: (exerciseId, tip) =>
        set((s) => ({ exerciseTips: { ...s.exerciseTips, [exerciseId]: tip } })),

      dismissRestTimer: () =>
        set((s) => {
          if (!s.activeWorkout) return {}
          return { activeWorkout: { ...s.activeWorkout, restTimerVisible: false } }
        }),

      adjustRestTimer: (delta) =>
        set((s) => {
          if (!s.activeWorkout) return {}
          const newSeconds = Math.max(0, s.activeWorkout.restSecondsLeft + delta)
          return {
            activeWorkout: {
              ...s.activeWorkout,
              restSecondsLeft: newSeconds,
              restTotalSeconds: Math.max(s.activeWorkout.restTotalSeconds, newSeconds),
            },
          }
        }),

      setRestPreset: (seconds) =>
        set((s) => {
          if (!s.activeWorkout) return {}
          return {
            activeWorkout: {
              ...s.activeWorkout,
              restSecondsLeft: seconds,
              restTotalSeconds: seconds,
            },
          }
        }),

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
      }),
    }
  )
)
