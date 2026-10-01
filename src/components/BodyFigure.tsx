import type { MuscleGroup } from '../types'
import { figuraPorNiveles } from '../data/muscleIcons'

interface Props {
  niveles: Partial<Record<MuscleGroup, number>>
  /** Alto de cada figura. */
  size?: number
  color: string
  /** Por defecto, frente y espalda lado a lado. */
  lados?: Array<'frente' | 'espalda'>
  /** Opacidad de una zona sin trabajar. */
  base?: number
}

/** Figura entera de frente y de espaldas, con cada zona pintada según su nivel (0 a 1). */
export function BodyFigure({ niveles, size = 20, color, lados = ['frente', 'espalda'], base = 0.18 }: Props) {
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: size * 0.08, color, flexShrink: 0 }}>
      {lados.map((lado) => (
        <svg key={lado} width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          {figuraPorNiveles(lado, niveles).map(({ paths, nivel }, i) => (
            <g key={i} fill="currentColor" opacity={base + (1 - base) * nivel}>
              {paths.map((d) => <path key={d} d={d} />)}
            </g>
          ))}
        </svg>
      ))}
    </span>
  )
}
