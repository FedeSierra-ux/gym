import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActiveWorkoutExercise, AppToast, Workout, PR } from '../types'
import { useStore } from '../store/useStore'
import { isDurationExercise, durationUnit, toSeconds, fromSeconds } from '../utils/duration'
import { clampDecimalInput, normalizeIntegerInput, parseDecimal } from '../utils/numberInput'
import { suggestNextWeight } from '../utils/progression'

export interface ActiveWorkout {
  routineId: string
  startedAt: number      // date the workout is recorded for (may be a past-date override)
  realStartedAt: number  // actual wall-clock time when the screen opened (for duration)
  exercises: ActiveWorkoutExercise[]
  restTimerVisible: boolean
  restSecondsLeft: number
  restTotalSeconds: number
  /**
   * Momento (epoch ms) en que termina el descanso. El contador se deriva de
   * este timestamp y no de restar 1 por segundo: iOS congela los timers cuando
   * la PWA queda en segundo plano o se bloquea la pantalla, así que un contador
   * incremental volvía con minutos de atraso.
   */
  restEndsAt?: number
  lastCompletedSet?: { exerciseId: string; setIdx: number; kg: number; reps: number }
  livePr?: { exerciseId: string; kg: number; reps: number } | null
}

interface WorkoutState {
  activeWorkout: ActiveWorkout | null
  summaryWorkout: import('../types').Workout | null
  summaryPrCount: number

  startWorkout: (routineId: string, dateOverride?: number) => void
  /** Cambia el día al que se imputa el entreno en curso (cargar el de ayer). */
  setWorkoutDate: (timestamp: number) => void
  updateSetValue: (exerciseIdx: number, setIdx: number, field: 'kg' | 'reps' | 'duration', value: string) => void
  toggleSetWarmup: (exerciseIdx: number, setIdx: number) => void
  /**
   * Marca/desmarca la serie. `startRest` decide si además arranca el
   * cronómetro de descanso: el ✓ sólo confirma y el ✓⏱ confirma y cuenta.
   */
  completeSet: (exerciseIdx: number, setIdx: number, options?: { startRest?: boolean }) => void
  addSetToExercise: (exerciseIdx: number) => void
  removeSetFromExercise: (exerciseIdx: number, setIdx: number) => void
  /** `auto` marca el cierre automático: guarda sin abrir el resumen. */
  finishWorkout: (options?: { auto?: boolean }) => void
  /**
   * Cierra el entreno del día si quedó abierto más de 4 horas. Devuelve true si
   * hizo algo. Se llama al abrir la app, al volver del segundo plano y cada
   * minuto mientras está abierta.
   */
  autoCloseStaleWorkout: () => boolean
  cancelWorkout: () => void
  dismissRestTimer: () => void
  adjustRestTimer: (delta: number) => void
  setRestPreset: (seconds: number) => void
  dismissLivePr: () => void
  dismissSummary: () => void
}

// A real workout rarely exceeds ~2h; if more than 3h elapse before the user
// hits "finish" (app left open/backgrounded), treat the session as if it had
// been closed at the 2h mark instead of recording the raw elapsed time.
const AUTO_CLOSE_THRESHOLD_MIN = 180
const MAX_WORKOUT_DURATION_MIN = 120

/**
 * A las 4 horas el entreno se cierra solo: si la app quedó abierta (o el
 * teléfono se guardó en el bolso), la sesión del día se guarda con la duración
 * capeada en vez de quedar viva para siempre y arrastrarse al día siguiente.
 */
const AUTO_CLOSE_AFTER_MIN = 240

function clampValue(field: 'kg' | 'reps' | 'duration', value: string): string {
  if (value === '') return ''
  if (field === 'reps') {
    const digits = normalizeIntegerInput(value)
    if (digits === '') return ''
    return String(Math.min(100, Math.max(0, parseInt(digits, 10))))
  }
  // kg y duration aceptan decimales escritos con coma o con punto. El tope alto
  // de duration cubre minutos (cinta) y segundos (planchas): la unidad la
  // resuelve la pantalla.
  return clampDecimalInput(value, field === 'kg' ? 500 : 600)
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      summaryWorkout: null,
      summaryPrCount: 0,

      startWorkout: (routineId, dateOverride) => {
        const { routines, workouts } = useStore.getState()

        const routine = routines.find((r) => r.id === routineId)
        if (!routine) return

        // Sesiones terminadas, de la más reciente a la más vieja. Se usan para
        // prellenar cada ejercicio con lo que se hizo la última vez.
        const finishedWorkouts = [...workouts]
          .filter((w) => w.finishedAt)
          .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))

        /**
         * Series de la última vez que se hizo ese ejercicio. Se prioriza la
         * misma rutina, pero si el ejercicio se hizo en otra (o la rutina se
         * editó) igual se traen esos valores en vez de dejar el campo vacío.
         */
        const lastSetsFor = (exerciseId: string) => {
          const sameRoutine = finishedWorkouts.find((w) =>
            w.routineId === routineId && w.exercises.some((e) => e.exerciseId === exerciseId && e.sets.length > 0)
          )
          const source = sameRoutine ?? finishedWorkouts.find((w) =>
            w.exercises.some((e) => e.exerciseId === exerciseId && e.sets.length > 0)
          )
          const sets = source?.exercises.find((e) => e.exerciseId === exerciseId)?.sets ?? []
          // El calentamiento no sirve como referencia salvo que sea lo único.
          const working = sets.filter((s) => !s.isWarmup)
          return working.length > 0 ? working : sets
        }

        const { exercises: exerciseDb, customExercises } = useStore.getState()
        const allExercises = [...exerciseDb, ...customExercises]

        const activeExercises: ActiveWorkoutExercise[] = routine.exercises.map((re) => {
          const prevSets = lastSetsFor(re.exerciseId)
          const exercise = allExercises.find((e) => e.id === re.exerciseId)

          if (isDurationExercise(exercise)) {
            const unit = durationUnit(exercise)
            // El objetivo del plan manda; si no hay, se repite lo de la última vez.
            const target = re.targetSeconds ?? prevSets[0]?.durationSec ?? 0
            return {
              exerciseId: re.exerciseId,
              sets: Array.from({ length: re.sets }, (_, i) => ({
                kg: '',
                reps: '',
                duration: fromSeconds(prevSets[i]?.durationSec ?? prevSets[prevSets.length - 1]?.durationSec ?? target, unit),
                completed: false,
              })),
            }
          }

          // Doble progresión: el peso que se prellena es el sugerido, no el de
          // la sesión anterior, así el objetivo del día queda cargado solo.
          const suggestion = suggestNextWeight(exercise, re, workouts, re.exerciseId)
          const suggestedKg = suggestion && suggestion.kg > 0 ? String(suggestion.kg) : ''
          // Si la sesión anterior tuvo menos series que la rutina, las de más
          // se prellenan con la última serie registrada.
          const lastPrevSet = prevSets[prevSets.length - 1]
          return {
            exerciseId: re.exerciseId,
            sets: Array.from({ length: re.sets }, (_, i) => {
              const prev = prevSets[i] ?? lastPrevSet
              const prevKg = prev && prev.kg > 0 ? String(prev.kg) : ''
              const prevReps = prev && prev.reps > 0 ? String(prev.reps) : ''
              return {
                kg: suggestedKg || prevKg,
                reps: prevReps,
                completed: false,
              }
            }),
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
            restEndsAt: undefined,
          },
        })
      },

      setWorkoutDate: (timestamp) =>
        set((s) => {
          if (!s.activeWorkout) return {}
          // Se conserva la hora original: sólo se mueve el día al que se imputa.
          const previous = new Date(s.activeWorkout.startedAt)
          const target = new Date(timestamp)
          const startedAt = new Date(
            target.getFullYear(), target.getMonth(), target.getDate(),
            previous.getHours(), previous.getMinutes(), previous.getSeconds(),
          ).getTime()
          return { activeWorkout: { ...s.activeWorkout, startedAt } }
        }),

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

      toggleSetWarmup: (exerciseIdx, setIdx) =>
        set((s) => {
          if (!s.activeWorkout) return {}
          const exercises = s.activeWorkout.exercises.map((ex, ei) => {
            if (ei !== exerciseIdx) return ex
            return {
              ...ex,
              sets: ex.sets.map((st, si) => (si === setIdx ? { ...st, isWarmup: !st.isWarmup } : st)),
            }
          })
          return { activeWorkout: { ...s.activeWorkout, exercises } }
        }),

      completeSet: (exerciseIdx, setIdx, options) =>
        set((s) => {
          if (!s.activeWorkout) return {}
          const targetSet = s.activeWorkout.exercises[exerciseIdx]?.sets[setIdx]
          if (!targetSet) return {}
          if (!targetSet.completed) {
            const { exercises: exDb, customExercises: customEx } = useStore.getState()
            const exercise = [...exDb, ...customEx].find(
              (e) => e.id === s.activeWorkout?.exercises[exerciseIdx]?.exerciseId
            )
            if (isDurationExercise(exercise)) {
              const seconds = toSeconds(targetSet.duration ?? '', durationUnit(exercise))
              if (seconds <= 0) {
                useStore.getState().addToast(
                  durationUnit(exercise) === 'min'
                    ? 'Ingresá los minutos antes de completar'
                    : 'Ingresá los segundos antes de completar',
                  'info'
                )
                return {}
              }
            } else {
              const reps = parseInt(targetSet.reps)
              if (isNaN(reps) || reps <= 0) {
                useStore.getState().addToast('Ingresá la cantidad de reps antes de completar', 'info')
                return {}
              }
              // El peso es opcional: abdominales, dominadas o cualquier
              // ejercicio a peso corporal se registran sólo con reps.
            }
          }
          const exercises = s.activeWorkout.exercises.map((ex, ei) => {
            if (ei !== exerciseIdx) return ex
            return {
              ...ex,
              sets: ex.sets.map((st, si) => (si === setIdx ? { ...st, completed: !st.completed } : st)),
            }
          })
          const completedSet = exercises[exerciseIdx].sets[setIdx]
          const startRest = completedSet.completed && options?.startRest === true
          const lastCompletedSet = completedSet.completed
            ? {
                exerciseId: exercises[exerciseIdx].exerciseId,
                setIdx,
                kg: parseDecimal(completedSet.kg) || 0,
                reps: parseInt(completedSet.reps) || 0,
              }
            : s.activeWorkout.lastCompletedSet

          // Detect live PR (warm-up sets never count as PRs)
          let livePr = s.activeWorkout.livePr
          if (completedSet.completed && !completedSet.isWarmup) {
            const { prs } = useStore.getState()
            const exerciseId = exercises[exerciseIdx].exerciseId
            const kg = parseDecimal(completedSet.kg) || 0
            const reps = parseInt(completedSet.reps) || 0
            if (kg > 0) {
              const existing = prs.find((p) => p.exerciseId === exerciseId)
              const isPr = !existing || kg > existing.kg || (kg === existing.kg && reps > existing.reps)
              livePr = isPr ? { exerciseId, kg, reps } : null
            }
          } else {
            livePr = null
          }

          return {
            activeWorkout: {
              ...s.activeWorkout,
              exercises,
              lastCompletedSet,
              livePr,
              // El descanso arranca sólo si se confirmó con el ✓⏱.
              restTimerVisible: startRest,
              restSecondsLeft: s.activeWorkout.restTotalSeconds,
              restTotalSeconds: s.activeWorkout.restTotalSeconds,
              restEndsAt: startRest
                ? Date.now() + s.activeWorkout.restTotalSeconds * 1000
                : s.activeWorkout.restEndsAt,
            },
          }
        }),

      addSetToExercise: (exerciseIdx) =>
        set((s) => {
          if (!s.activeWorkout) return {}
          const exercises = s.activeWorkout.exercises.map((ex, ei) => {
            if (ei !== exerciseIdx) return ex
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

      autoCloseStaleWorkout: () => {
        const { activeWorkout } = get()
        if (!activeWorkout) return false
        const openMin = (Date.now() - activeWorkout.realStartedAt) / 60000
        if (openMin < AUTO_CLOSE_AFTER_MIN) return false

        const tieneSeries = activeWorkout.exercises.some((ex) => ex.sets.some((s) => s.completed))
        if (tieneSeries) {
          // Se guarda con la duración capeada (MAX_WORKOUT_DURATION_MIN).
          get().finishWorkout({ auto: true })
        } else {
          // Sin series completadas no hay nada que guardar: se descarta.
          set({ activeWorkout: null })
          useStore.getState().addToast('Se cerró un entreno que quedó abierto sin series', 'info')
        }
        return true
      },

      finishWorkout: (options) => {
        const { activeWorkout } = get()
        if (!activeWorkout) return

        const hasWorkingSets = activeWorkout.exercises.some(ex =>
          ex.sets.some(s => s.completed)
        )
        if (!hasWorkingSets) {
          useStore.getState().addToast('Completá al menos una serie antes de terminar', 'info')
          return
        }

        const { prs, routines, exercises: allExDb, customExercises } = useStore.getState()
        const allExercises = [...allExDb, ...customExercises]

        const realFinishedAt = Date.now()
        const rawDurationMin = Math.round((realFinishedAt - activeWorkout.realStartedAt) / 60000)
        // If the app was left open/backgrounded for a long time (e.g. the user
        // forgot to close it), don't record the raw elapsed time as the workout
        // duration — cap it at a realistic session length instead.
        const durationMin = rawDurationMin > AUTO_CLOSE_THRESHOLD_MIN ? MAX_WORKOUT_DURATION_MIN : rawDurationMin
        // Use startedAt (which respects dateOverride) plus the (possibly capped)
        // duration so that backdated workouts land on the correct date instead of today.
        const finishedAt = activeWorkout.startedAt + durationMin * 60000

        const workoutExercises = activeWorkout.exercises.map((ex) => {
          const exercise = allExercises.find((e) => e.id === ex.exerciseId)
          const unit = durationUnit(exercise)
          return {
            exerciseId: ex.exerciseId,
            sets: ex.sets
              .filter((s) => s.completed)
              .map((s) => ({
                kg: parseDecimal(s.kg) || 0,
                reps: parseInt(s.reps) || 0,
                completedAt: finishedAt,
                isWarmup: s.isWarmup || undefined,
                durationSec: isDurationExercise(exercise)
                  ? toSeconds(s.duration ?? '', unit)
                  : undefined,
              })),
          }
        })

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
        for (const ex of activeWorkout.exercises) {
          for (const s of ex.sets) {
            if (!s.completed || s.isWarmup) continue
            const kg = parseDecimal(s.kg) || 0
            const reps = parseInt(s.reps) || 0
            if (kg <= 0) continue
            const existing = newPrs.find((p) => p.exerciseId === ex.exerciseId)
            const isNewPr = !existing || kg > existing.kg || (kg === existing.kg && reps > existing.reps)
            if (isNewPr) {
              const idx = newPrs.findIndex((p) => p.exerciseId === ex.exerciseId)
              const history = existing
                ? [...(existing.history ?? []), { kg: existing.kg, reps: existing.reps, date: existing.date }]
                : []
              const pr: PR = { exerciseId: ex.exerciseId, kg, reps, date: activeWorkout.startedAt, history }
              if (idx >= 0) newPrs[idx] = pr
              else newPrs.push(pr)
            }
          }
        }

        const newPrCount = newPrs.filter((np) => {
          const old = prs.find((p) => p.exerciseId === np.exerciseId)
          return !old || np.kg > (old.kg) || (np.kg === old.kg && np.reps > old.reps)
        }).length

        // Auto-progression suggestions (max 2)
        const progressionToasts: AppToast[] = []
        const routine = routines.find((r) => r.id === activeWorkout.routineId)
        if (routine) {
          // Mismo criterio de doble progresión que usa la pantalla de entreno,
          // evaluado ya con el entreno recién terminado incluido.
          const workoutsWithThisOne = [...useStore.getState().workouts, newWorkout]
          for (const re of routine.exercises) {
            if (progressionToasts.length >= 2) break
            const exercise = allExercises.find((e) => e.id === re.exerciseId)
            const suggestion = suggestNextWeight(exercise, re, workoutsWithThisOne, re.exerciseId)
            if (!suggestion || suggestion.reason !== 'subir') continue
            const exName = exercise?.nameEs ?? re.exerciseId
            progressionToasts.push({
              id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              message: `💪 ${exName}: la próxima, ${suggestion.kg} kg`,
              type: 'info',
            })
          }
        }

        const seriesTotales = workoutExercises.reduce((a, e) => a + e.sets.length, 0)
        const successToast: AppToast = {
          id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          message: options?.auto
            ? `El entreno quedó abierto más de 4 h: lo guardamos con ${durationMin} min · ${seriesTotales} series`
            : `¡Entreno terminado! ${durationMin} min · ${seriesTotales} series`,
          type: options?.auto ? 'info' : 'success',
        }
        const prToast: AppToast | null = newPrCount > 0
          ? { id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`, message: `🏆 ${newPrCount} nuevo${newPrCount > 1 ? 's' : ''} PR!`, type: 'pr' }
          : null

        // Write finished workout + PRs + toasts to persisted store
        useStore.setState((s) => ({
          workouts: [...s.workouts, newWorkout],
          prs: newPrs,
          toasts: [...s.toasts, successToast, ...(prToast ? [prToast] : []), ...progressionToasts],
        }))

        set((s) => ({
          // En el cierre automático no abrimos el resumen: el usuario no está
          // mirando y se lo encontraría de golpe al día siguiente.
          summaryWorkout: options?.auto ? null : newWorkout,
          summaryPrCount: options?.auto ? 0 : newPrCount,
          activeWorkout: s.activeWorkout,
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
              restEndsAt: Date.now() + newSeconds * 1000,
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
              restEndsAt: Date.now() + seconds * 1000,
            },
          }
        }),

      dismissLivePr: () =>
        set((s) => {
          if (!s.activeWorkout) return {}
          return { activeWorkout: { ...s.activeWorkout, livePr: null } }
        }),

      dismissSummary: () => {
        useStore.setState({ activeTab: 'home' })
        set({ summaryWorkout: null, summaryPrCount: 0 })
      },
    }),
    { name: 'gympro-active-workout', partialize: (s) => ({ activeWorkout: s.activeWorkout }) }
  )
)
