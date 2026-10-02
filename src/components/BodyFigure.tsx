import type { MuscleGroup } from '../types'
import { figuraPorNiveles, sexoDeNiveles } from '../data/muscleIcons'
import type { Sexo } from '../data/bodyModels'

interface Props {
  niveles: Partial<Record<MuscleGroup, number>>
  /** Alto de cada figura. */
  size?: number
  color: string
  /** Por defecto, frente y espalda lado a lado. */
  lados?: Array<'frente' | 'espalda'>
  /** Opacidad de una zona sin trabajar. */
  base?: number
  /** Por defecto, femenina si sólo se trabaja tren inferior. */
  sexo?: Sexo
}

/** Figura entera de frente y de espaldas, con cada músculo pintado según su nivel (0 a 1). */
export function BodyFigure({ niveles, size = 20, color, lados = ['frente', 'espalda'], base = 0.28, sexo }: Props) {
  const s = sexo ?? sexoDeNiveles(niveles)
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: size * 0.1, color, flexShrink: 0 }}>
      {lados.map((lado) => {
        const { vb, partes } = figuraPorNiveles(lado, niveles, s)
        return (
          <svg key={lado} viewBox={vb.join(' ')} height={size} width={(size * vb[2]) / vb[3]} style={{ display: 'block' }}>
            {partes.map(({ paths, nivel }, i) => (
              <g key={i} fill="currentColor" opacity={base + (1 - base) * nivel}>
                {paths.map((d) => <path key={d} d={d} />)}
              </g>
            ))}
          </svg>
        )
      })}
    </span>
  )
}
