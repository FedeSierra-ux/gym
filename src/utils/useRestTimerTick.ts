import { useEffect, useRef } from 'react'
import { useWorkoutStore } from '../stores/workoutStore'
import { vibrate, playBeep } from './haptics'

/**
 * El conteo del descanso. Vive en la pantalla del entreno y no en este panel,
 * así sigue corriendo (y suena al terminar) aunque el panel esté minimizado.
 */
export function useRestTimerTick() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // El tiempo restante sale siempre de restEndsAt (reloj de pared): si iOS
    // suspende la PWA con la pantalla bloqueada, al volver el contador muestra
    // lo que realmente queda en vez de haberse quedado congelado.
    const tick = () => {
      const state = useWorkoutStore.getState()
      const workout = state.activeWorkout
      if (!workout?.restTimerVisible) return

      // Un entreno guardado por una versión anterior no tiene restEndsAt.
      // Hay que fijarlo UNA vez a partir de los segundos que le quedaban: si lo
      // recalculáramos en cada tick, el descuento nunca avanzaría.
      if (!workout.restEndsAt) {
        useWorkoutStore.setState((s) => ({
          activeWorkout: s.activeWorkout
            ? { ...s.activeWorkout, restEndsAt: Date.now() + s.activeWorkout.restSecondsLeft * 1000 }
            : null,
        }))
        return
      }

      const left = Math.max(0, Math.ceil((workout.restEndsAt - Date.now()) / 1000))
      const prev = workout.restSecondsLeft
      if (left === prev) return

      if (left <= 0) {
        vibrate([150, 80, 150, 80, 300])
        playBeep(660, 250)
        setTimeout(() => playBeep(880, 300), 300)
        useWorkoutStore.setState((s) => ({
          activeWorkout: s.activeWorkout
            ? { ...s.activeWorkout, restTimerVisible: false, restSecondsLeft: 0 }
            : null,
        }))
        return
      }

      // Los avisos se disparan al cruzar el umbral, no al valer exactamente N:
      // si la app estuvo dormida el contador puede saltar varios segundos.
      if (prev > 10 && left <= 10) vibrate([80])
      if (prev > 5 && left <= 5) vibrate([100, 50, 100])
      if (prev > 3 && left <= 3) playBeep(660, 100)

      useWorkoutStore.setState((s) => ({
        activeWorkout: s.activeWorkout ? { ...s.activeWorkout, restSecondsLeft: left } : null,
      }))
    }

    intervalRef.current = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])
}
