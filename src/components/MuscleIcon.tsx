import type { MuscleGroup } from '../types'
import { muscleGroupConfig } from '../data/muscleGroups'
import { muscleIconSpec } from '../data/muscleIcons'

interface Props {
  group: MuscleGroup
  size?: number
  /** Por defecto, el color del grupo. */
  color?: string
}

/** Ícono del grupo muscular: la figura entera tenue, con la zona que trabaja pintada. */
export function MuscleIcon({ group, size = 18, color }: Props) {
  const { zonas, extra } = muscleIconSpec(group)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ color: color ?? muscleGroupConfig[group]?.color, flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
    >
      {zonas.map(({ paths, pintada }, i) => (
        <g key={i} fill="currentColor" opacity={pintada ? 1 : 0.25}>
          {paths.map((d) => <path key={d} d={d} />)}
        </g>
      ))}
      {extra.map((d) => <path key={d} d={d} fill="currentColor" />)}
    </svg>
  )
}
