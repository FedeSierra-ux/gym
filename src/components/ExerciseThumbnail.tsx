import { useMemo } from 'react'
import type { Exercise } from '../types'
import { muscleGroupConfig } from '../data/muscleGroups'
import { MuscleBodyMap } from './MuscleBodyMap'
import { ExerciseFrames } from './ExerciseFrames'
import { frameSlugFor } from '../utils/exerciseMatch'

interface Props {
  exercise: Exercise
  size?: number
  rounded?: string
  /** Se acepta por compatibilidad: ya no hay imágenes remotas que forzar. */
  forceStatic?: boolean
  /** Alterna las dos poses de la ilustración local para mostrar el movimiento. */
  animate?: boolean
}

/**
 * Dibujo del ejercicio. Todas las ilustraciones son locales
 * (public/exercise-frames): los 79 ejercicios base tienen la suya y los que
 * crea el usuario se resuelven por nombre. Si no hay dibujo cae al mapa
 * muscular, sin pedir nada a la red (la CSP de index.html no lo permitiría).
 */
export function ExerciseThumbnail({ exercise, size = 44, rounded = 'rounded-xl', animate = false }: Props) {
  const frameSlug = useMemo(() => frameSlugFor(exercise), [exercise])
  const config = muscleGroupConfig[exercise.muscleGroup]

  if (frameSlug) {
    return (
      <div
        className={`flex-shrink-0 ${rounded} overflow-hidden`}
        style={{ width: size, height: size, background: config.color + '12' }}
      >
        <ExerciseFrames slug={frameSlug} size={size} alt={exercise.nameEs} animate={animate} />
      </div>
    )
  }

  return (
    <div
      className={`flex-shrink-0 ${rounded} flex items-center justify-center`}
      style={{ width: size, height: size, backgroundColor: config.color + '18' }}
    >
      <MuscleBodyMap muscleGroup={exercise.muscleGroup} size={Math.round(size * 0.75)} />
    </div>
  )
}
