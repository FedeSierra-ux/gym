import type { MuscleGroup } from '../types'
import { muscleGroupConfig } from '../data/muscleGroups'
import { CORAZON, figuraDeGrupo } from '../data/muscleIcons'

interface Props {
  group: MuscleGroup
  size?: number
  /** Por defecto, el color del grupo. */
  color?: string
}

/** Ícono del grupo muscular: el cuerpo tenue encuadrado sobre los músculos que trabaja, pintados. */
export function MuscleIcon({ group, size = 18, color }: Props) {
  const estilo = { color: color ?? muscleGroupConfig[group]?.color, flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' } as const
  const figura = figuraDeGrupo(group)
  if (!figura) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={estilo}>
        <path d={CORAZON} fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox={figura.vb.join(' ')} aria-hidden="true" style={estilo}>
      {figura.partes.map(({ paths, pintada }, i) => (
        <g key={i} fill="currentColor" opacity={pintada ? 1 : 0.28}>
          {paths.map((d) => <path key={d} d={d} />)}
        </g>
      ))}
    </svg>
  )
}
