import { create } from 'zustand'
import type { ActiveWorkoutExercise, AppToast, Workout, PR } from '../types'
import { useStore } from '../store/useStore'

export interface ActiveWorkout {
  routineId: string
  startedAt: number      // date the workout is recorded for (may be a past-date override)
  realStartedAt: number  // actual wall-clock time when the screen opened (for duration)
  exercises: ActiveWorkoutExercise[]
  restTimerVisible: boolean
  restSecondsLeft: number
  restTotalSeconds: number
  lastCompletedSet?: { exerciseId: string; setIdx: number; kg: number; reps: number }
}

interface WorkoutState {
  activeWorkout: ActiveWorkout | null

  startWorkout: (routineId: string, dateOverride?: number) => void
  updateSetValue: (exerciseIdx: number, setIdx: number, field: 'kg' | 'reps', value: string) => void
  completeSet: (exerciseIdx: number, setIdx: number) => void
  addSetToExercise: (exerciseIdx: number) => void
  removeSetFromExercise: (exerciseIdx: number, setIdx: number) => void
  finishWorkout: () => void
  cancelWorkout: () => void
  dismissRestTimer: () => void
  adjustRestTimer: (delta: number) => void
  setRestPreset: (seconds: number) => void
}

function clampValue(field: 'kg' | 'reps', value: string): string {
  if (value === '') return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  if (field === 'kg') {
    return String(Math.min(500, Math.max(0, num)))
  } else {
    return String(Math.min(100, Math.max(0, Math.round(num))))
  }
}

export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
  activeWorkout: null,

  startWorkout: (routineId, dateOverride) => {
    const { routines, workouts } = useStore.getState()

    const routine = routines.find((r) => r.id === routineId)
    if (!routine) return

    const activeExercises: ActiveWorkoutExercise[] = routine.exercises.map((re) => {
      const prevWorkout = [...workouts]
        .filter((w) => w.routineId === routineId && w.finishedAt)
        .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0]

      const prevSets = prevWorkout?.exercises.find((e) => e.exerciseId === re.exerciseId)?.sets ?? []

      return {
        exerciseId: re.exerciseId,
        sets: Array.from({ length: re.sets }, (_, i) => ({
          kg: prevSets[i] ? String(prevSets[i].kg) : '',
          reps: prevSets[i] ? String(prevSets[i].reps) : '',
          completed: false,
        })),
      }
    })

    const now = Date.now()
    set({
      activeWorkout: {
        routineId,
        startedAt: dateOverride ?? now,
        realStartedAt: now,
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
      const clamped = clampValue(field, value)
      const exercises = s.activeWorkout.exercises.map((ex, ei) => {
        if (ei !== exerciseIdx) return ex
        return {
          ...ex,
          sets: ex.sets.map((st, si) => (si === setIdx ? { ...st, [field]: clamped } : st)),
        }
      })
      return { activeWorkout: { ...s.activeWorkout, exercises } }
    }),

  completeSet: (exerciseIdx, setIdx) =>
    set((s) => {
      if (!s.activeWorkout) return {}
      const targetSet = s.activeWorkout.exercises[exerciseIdx]?.sets[setIdx]
      if (!targetSet) return {}
      // Prevent completing a set with no data (unless un-completing)
      if (!targetSet.completed) {
        const kg = parseFloat(targetSet.kg)
        const reps = parseInt(targetSet.reps)
        if (isNaN(kg) || kg <= 0 || isNaN(reps) || reps <= 0) return {}
      }
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
          restSecondsLeft: s.activeWorkout.restTotalSeconds,
          restTotalSeconds: s.activeWorkout.restTotalSeconds,
        },
      }
    }),

  addSetToExercise: (exerciseIdx) =>
    set((s) => {
      if (!s.activeWorkout) return {}
      const exercises = s.activeWorkout.exercises.map((ex, ei) => {
        if (ei !== exerciseIdx) return ex
        // Copy from last set that has actual values, fall back to last set
        const lastWithValues = [...ex.sets].reverse().find((st) => st.kg !== '' || st.reps !== '')
        const template = lastWithValues ?? ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [...ex.sets, { kg: template?.kg ?? '', reps: template?.reps ?? '', completed: false }],
        }
      })
      return { activeWorkout: { ...s.activeWorkout, exercises } }
    }),

  removeSetFromExercise: (exerciseIdx, setIdx) =>
    set((s) => {
      if (!s.activeWorkout) return {}
      const exercises = s.activeWorkout.exercises.map((ex, ei) => {
        if (ei !== exerciseIdx) return ex
        if (ex.sets.length <= 1) return ex
        return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
      })
      return { activeWorkout: { ...s.activeWorkout, exercises } }
    }),

  finishWorkout: () => {
    const { activeWorkout } = get()
    if (!activeWorkout) return

    const { prs } = useStore.getState()

    const finishedAt = Date.now()
    const durationMin = Math.round((finishedAt - activeWorkout.realStartedAt) / 60000)

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

    const newPrs = [...prs]
    for (const ex of workoutExercises) {
      for (const s of ex.sets) {
        if (s.kg <= 0) continue
        const existing = newPrs.find((p) => p.exerciseId === ex.exerciseId)
        const isNewPr = !existing || s.kg > existing.kg || (s.kg === existing.kg && s.reps > existing.reps)
        if (isNewPr) {
          const idx = newPrs.findIndex((p) => p.exerciseId === ex.exerciseId)
          const pr: PR = { exerciseId: ex.exerciseId, kg: s.kg, reps: s.reps, date: activeWorkout.startedAt }
          if (idx >= 0) newPrs[idx] = pr
          else newPrs.push(pr)
        }
      }
    }

    const newPrCount = newPrs.filter((np) => {
      const old = prs.find((p) => p.exerciseId === np.exerciseId)
      return !old || np.kg > (old.kg) || (np.kg === old.kg && np.reps > old.reps)
    }).length

    const successToast: AppToast = {
      id: `toast-${Date.now()}`,
      message: `¡Entreno terminado! ${durationMin} min · ${workoutExercises.reduce((a, e) => a + e.sets.length, 0)} series`,
      type: 'success',
    }
    const prToast: AppToast | null = newPrCount > 0
      ? { id: `toast-${Date.now() + 1}`, message: `🏆 ${newPrCount} nuevo${newPrCount > 1 ? 's' : ''} PR!`, type: 'pr' }
      : null

    // Write finished workout + PRs + toasts to persisted store
    useStore.setState((s) => ({
      workouts: [...s.workouts, newWorkout],
      prs: newPrs,
      activeTab: 'home',
      toasts: [...s.toasts, successToast, ...(prToast ? [prToast] : [])],
    }))

    // Clear active workout
    set({ activeWorkout: null })
  },

  cancelWorkout: () => set({ activeWorkout: null }),

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
}))
