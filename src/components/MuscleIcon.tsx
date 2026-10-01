import type { MuscleGroup } from '../types'
import { muscleGroupConfig } from '../data/muscleGroups'
import { CARDIO_PULSE, muscleIconPaths } from '../data/muscleIcons'

interface Props {
  group: MuscleGroup
  size?: number
  /** Por defecto, el color del grupo. */
  color?: string
}

/** Ícono del grupo muscular: la silueta tenue y el músculo pintado. */
export function MuscleIcon({ group, size = 16, color }: Props) {
  const paths = muscleIconPaths[group]
  if (!paths) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ color: color ?? muscleGroupConfig[group].color, flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
    >
      {paths.outline.map((d) => (
        <path key={d} d={d} fill="currentColor" fillOpacity={0.16} stroke="currentColor" strokeOpacity={0.55}
          strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" />
      ))}
      {paths.muscle.map((d) => <path key={d} d={d} fill="currentColor" />)}
      {group === 'cardio' && (
        <path d={CARDIO_PULSE} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      )}
    </svg>
  )
}
