import { useEffect, useState } from 'react'
import type { MuscleGroup } from '../types'
import type { Sexo } from '../data/bodyModels'

type Modelos = typeof import('../data/muscleIcons')

// Los trazados del cuerpo (bodyModels, 67 kB) se bajan con import() la primera
// vez que hace falta una figura; después de eso quedan acá y las figuras
// siguientes se pintan en el primer render, sin placeholder.
let modelos: Modelos | null = null
let cargando: Promise<Modelos> | null = null
function cargarModelos(): Promise<Modelos> {
  if (!cargando) cargando = import('../data/muscleIcons').then((m) => { modelos = m; return m })
  return cargando
}

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
  const [m, setM] = useState<Modelos | null>(modelos)
  useEffect(() => {
    if (m) return
    let vivo = true
    cargarModelos().then((cargado) => { if (vivo) setM(cargado) })
    return () => { vivo = false }
  }, [m])

  // Mientras baja: un hueco del mismo tamaño, así la fila no salta al llegar.
  // La figura de frente y la de espalda tienen más o menos la misma proporción (≈ 0,4).
  if (!m) {
    return <span aria-hidden="true" style={{ display: 'inline-flex', gap: size * 0.1, flexShrink: 0, width: lados.length * size * 0.4 + (lados.length - 1) * size * 0.1, height: size }} />
  }

  const s = sexo ?? m.sexoDeNiveles(niveles)
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: size * 0.1, color, flexShrink: 0 }}>
      {lados.map((lado) => {
        const { vb, partes } = m.figuraPorNiveles(lado, niveles, s)
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
