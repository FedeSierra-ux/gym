import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import type { Exercise, Routine, Workout, PR, NavTab, CalendarSubTab, ExerciseTips, AppToast, MuscleGroup, BodyMeasure } from '../types'
import { exercises as exerciseDb } from '../data/exercises'
import { buildCustomExercise, draftFromName, inferEquipmentType } from '../utils/exerciseMatch'
import { muscleGroupConfig } from '../data/muscleGroups'
import { seedRoutines, seedWorkouts } from '../data/seedData'
import { buildMileRoutines, MILE_WEEK_PLAN } from '../data/mileRoutines'
import { computeRecords } from '../utils/records'

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
  /** Entrenos por semana que se propone el usuario. null = los que pide la semana tipo. */
  weeklyGoal: number | null
  /** Peso corporal y circunferencias, de la medición más vieja a la más nueva. */
  measures: BodyMeasure[]
  /** Última vez que se exportó un backup, para poder recordarlo. */
  lastBackupAt: number | null
  customExercises: Exercise[]
  archivedRoutineNames: Record<string, { name: string; emoji: string }>

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
  /** Vuelve a poner un entreno borrado (el botón "Deshacer" del aviso). */
  restoreWorkout: (workout: Workout) => void
  updateWorkout: (workout: Workout) => void
  /** Vuelve a derivar todos los récords del historial. */
  recomputeRecords: () => void

  // Tips
  setExerciseTip: (exerciseId: string, tip: string) => void

  // Profile
  updateUserName: (name: string) => void
  setOnboarded: () => void
  setAnthropicApiKey: (key: string) => void

  // Toasts
  addToast: (message: string, type: AppToast['type']) => void
  /** Aviso con botón de deshacer: para borrados que no necesitan confirmación previa. */
  addUndoToast: (message: string, undo: () => void) => void
  removeToast: (id: string) => void

  // Week plan
  setWeekPlanDay: (dow: number, routineId: string | null) => void
  setWeeklyGoal: (goal: number | null) => void

  // Medidas
  addMeasure: (measure: Omit<BodyMeasure, 'id'>) => void
  updateMeasure: (measure: BodyMeasure) => void
  deleteMeasure: (id: string) => void

  /** Marca que se acaba de exportar un backup. */
  markBackupDone: () => void

  // Custom exercises
  addCustomExercise: (ex: Exercise) => void
  /** Crea un ejercicio propio a partir del nombre y devuelve el ejercicio creado. */
  createCustomExercise: (name: string, opts?: { group?: MuscleGroup; equipment?: string }) => Exercise | null
  /** Edita un ejercicio propio ya creado (el historial no se toca: el id no cambia). */
  updateCustomExercise: (id: string, patch: { nameEs: string; group: MuscleGroup; equipment: string }) => void
  deleteCustomExercise: (id: string) => void

  // Archived routines (for history display after deletion)
  getArchivedRoutineName: (routineId: string) => { name: string; emoji: string } | null

  /** Carga (o repone) las tres rutinas del plan de Mile. Devuelve cuántas agregó. */
  installMileRoutines: () => number

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
      weeklyGoal: null,
      measures: [],
      lastBackupAt: null,
      customExercises: [],
      archivedRoutineNames: {},

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
        // Si no se limpia acá, el día queda "planificado" contra una rutina que
        // ya no existe: el select la muestra como Descanso pero sigue contando
        // en el cumplimiento del plan.
        const weekPlan = Object.fromEntries(
          Object.entries(s.weekPlan).map(([dow, routineId]) => [dow, routineId === id ? null : routineId])
        )
        return {
          routines: s.routines.filter((r) => r.id !== id),
          activeRoutineId: s.activeRoutineId === id ? null : s.activeRoutineId,
          archivedRoutineNames: archived,
          weekPlan,
        }
      }),

      addExerciseToRoutine: (routineId, exerciseId) =>
        set((s) => {
          const exercise = [...s.exercises, ...s.customExercises].find((e) => e.id === exerciseId)
          // Los ejercicios por tiempo arrancan con un objetivo razonable según
          // su unidad: 15 minutos de cardio, 30 segundos de isométrico.
          const byTime = exercise?.trackingType === 'duration'
          const defaults = byTime
            ? {
                sets: 1,
                repsMin: 8,
                repsMax: 12,
                targetSeconds: exercise?.durationUnit === 'seg' ? 30 : 15 * 60,
              }
            : { sets: 3, repsMin: 8, repsMax: 12 }
          return {
            routines: s.routines.map((r) => {
              if (r.id !== routineId) return r
              if (r.exercises.some((e) => e.exerciseId === exerciseId)) return r
              const maxOrder = r.exercises.reduce((max, e) => Math.max(max, e.order), -1)
              return {
                ...r,
                exercises: [...r.exercises, { exerciseId, ...defaults, order: maxOrder + 1 }],
              }
            }),
          }
        }),

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

      deleteWorkout: (id) => set((s) => {
        const workouts = s.workouts.filter((w) => w.id !== id)
        // Los récords se derivan del historial: si se va el entreno, se va su marca.
        return { workouts, prs: computeRecords(workouts, [...s.exercises, ...s.customExercises]) }
      }),

      restoreWorkout: (workout) =>
        set((s) => {
          if (s.workouts.some((w) => w.id === workout.id)) return {}
          const workouts = [...s.workouts, workout].sort((a, b) => a.startedAt - b.startedAt)
          return { workouts, prs: computeRecords(workouts, [...s.exercises, ...s.customExercises]) }
        }),

      updateWorkout: (workout) =>
        set((s) => {
          const workouts = s.workouts.map((w) => (w.id === workout.id ? workout : w))
          return { workouts, prs: computeRecords(workouts, [...s.exercises, ...s.customExercises]) }
        }),

      recomputeRecords: () =>
        set((s) => ({ prs: computeRecords(s.workouts, [...s.exercises, ...s.customExercises]) })),

      setExerciseTip: (exerciseId, tip) =>
        set((s) => ({ exerciseTips: { ...s.exerciseTips, [exerciseId]: tip } })),

      updateUserName: (name) => set({ userName: name }),
      setOnboarded: () => set({ onboarded: true }),
      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      addToast: (message, type) =>
        set((s) => ({
          toasts: [...s.toasts, { id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`, message, type }],
        })),
      addUndoToast: (message, undo) =>
        set((s) => ({
          toasts: [
            ...s.toasts,
            { id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`, message, type: 'info', undo },
          ],
        })),

      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      setWeekPlanDay: (dow, routineId) =>
        set((s) => ({ weekPlan: { ...s.weekPlan, [dow]: routineId } })),

      setWeeklyGoal: (goal) => set({ weeklyGoal: goal }),

      addMeasure: (measure) =>
        set((s) => ({
          measures: [
            ...s.measures,
            { ...measure, id: `medida-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
          ].sort((a, b) => a.date - b.date),
        })),

      updateMeasure: (measure) =>
        set((s) => ({
          measures: s.measures.map((m) => (m.id === measure.id ? measure : m)).sort((a, b) => a.date - b.date),
        })),

      deleteMeasure: (id) => set((s) => ({ measures: s.measures.filter((m) => m.id !== id) })),

      markBackupDone: () => set({ lastBackupAt: Date.now() }),

      addCustomExercise: (ex) =>
        set((s) => ({ customExercises: [...s.customExercises, ex] })),

      createCustomExercise: (name, opts) => {
        const trimmed = name.trim()
        if (!trimmed) return null
        // Si ya existe uno con ese nombre (base o propio) lo reutilizamos, para
        // no terminar con tres "Press de banca" distintos en el historial.
        const existing = [...get().exercises, ...get().customExercises].find(
          (e) => e.nameEs.trim().toLowerCase() === trimmed.toLowerCase()
        )
        if (existing) return existing
        const ex = buildCustomExercise(trimmed, opts)
        set((s) => ({ customExercises: [...s.customExercises, ex] }))
        return ex
      },

      updateCustomExercise: (id, patch) =>
        set((s) => ({
          customExercises: s.customExercises.map((e) => {
            if (e.id !== id) return e
            const name = patch.nameEs.trim() || e.nameEs
            const equipment = patch.equipment.trim() || 'Libre'
            // El dibujo se recalcula con el nombre y el grupo nuevos.
            const draft = draftFromName(name, patch.group)
            return {
              ...e,
              nameEs: name,
              muscleGroup: patch.group,
              primaryMuscles: [muscleGroupConfig[patch.group].label],
              equipment,
              equipmentType: inferEquipmentType(equipment),
              frameSlug: draft.frameSlug ?? undefined,
            }
          }),
        })),

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

      installMileRoutines: () => {
        const existing = new Set(get().routines.map((r) => r.id))
        const nuevas = buildMileRoutines().filter((r) => !existing.has(r.id))
        if (!nuevas.length) return 0
        set((s) => ({
          routines: [...s.routines, ...nuevas],
          // Si todavía no hay plan semanal armado, dejamos el sugerido.
          weekPlan: Object.values(s.weekPlan).some(Boolean) ? s.weekPlan : { ...s.weekPlan, ...MILE_WEEK_PLAN },
        }))
        return nuevas.length
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
          // Las rutinas de Mile vienen prearmadas desde el primer arranque.
          routines: [...buildMileRoutines(), ...seedRoutines],
          workouts: seedWorkouts,
          prs,
          weekPlan: { ...MILE_WEEK_PLAN },
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
        weeklyGoal: state.weeklyGoal,
        measures: state.measures,
        lastBackupAt: state.lastBackupAt,
        customExercises: state.customExercises,
        archivedRoutineNames: state.archivedRoutineNames,
      }),
      // Los récords guardados por versiones anteriores pueden haber quedado
      // huérfanos (entrenos borrados, pesos corregidos, marcas de ejercicios que
      // ya no existen). Se recalculan una sola vez al abrir la app para que
      // coincidan siempre con el historial.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // El set va en el próximo tick: durante la rehidratación el store
        // todavía se está armando y escribirle acá no persiste ni redibuja.
        queueMicrotask(() => {
          useStore.setState((s) => ({
            prs: computeRecords(s.workouts, [...s.exercises, ...s.customExercises]),
          }))
        })
      },
    }
  )
)

/** Returns the merged list of built-in + custom exercises. Use this everywhere a user-created exercise might appear. */
export function useAllExercises(): Exercise[] {
  const exercises = useStore(s => s.exercises)
  const customExercises = useStore(s => s.customExercises)
  return useMemo(() => [...exercises, ...customExercises], [exercises, customExercises])
}
