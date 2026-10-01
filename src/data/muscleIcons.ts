import type { MuscleGroup } from '../types'

/**
 * Íconos de los grupos musculares: la misma figura entera siempre, de frente o
 * de espaldas, con la zona que trabaja pintada (el estilo de los mapas
 * musculares de Hevy o Strong). No hay emojis de músculos: antes pecho era 🫁 y
 * espalda 🦅.
 *
 * Grilla de 24×24. Cada zona es un grupo de trazados; las que no se pintan se
 * dibujan tenues para que se lea el cuerpo completo.
 */
type Zona = string[]

const COMUNES = {
  cabeza: ['M12 0.5A2.1 2.1 0 1 1 12 4.7A2.1 2.1 0 1 1 12 0.5Z'],
  deltoides: ['M8.4 5.5Q6 5.4 5.7 8.4L7.6 8.8L8.6 7Z', 'M15.6 5.5Q18 5.4 18.3 8.4L16.4 8.8L15.4 7Z'],
  brazos: ['M5.7 9.2L7.5 9.6L7.1 12.6L5.4 12.4Z', 'M18.3 9.2L16.5 9.6L16.9 12.6L18.6 12.4Z'],
  antebrazos: ['M5.3 13L7 13.2L6.3 16.6L4.8 16.4Z', 'M18.7 13L17 13.2L17.7 16.6L19.2 16.4Z'],
  gemelos: ['M9.6 20.6H11.3L11.1 23.4H9.9Z', 'M14.4 20.6H12.7L12.9 23.4H14.1Z'],
}

const FRENTE: Record<string, Zona> = {
  ...COMUNES,
  pectorales: ['M8.9 6.2H11.7V9.6Q10 10.4 8.7 9.4Z', 'M15.1 6.2H12.3V9.6Q14 10.4 15.3 9.4Z'],
  abdominales: ['M9.2 10.3H14.8L14.4 14.4H9.6Z'],
  cadera: ['M9.5 14.9H14.5L14.8 16.4H9.2Z'],
  cuadriceps: ['M9.2 16.8H11.7L11.4 20.2H9.5Z', 'M14.8 16.8H12.3L12.6 20.2H14.5Z'],
}

const ESPALDA: Record<string, Zona> = {
  ...COMUNES,
  trapecio: ['M10 5.2H14L13.6 7.4L12 8.4L10.4 7.4Z'],
  dorsales: ['M8.8 7.4L11.6 8.8V13.4L9.6 13.8Z', 'M15.2 7.4L12.4 8.8V13.4L14.4 13.8Z'],
  lumbares: ['M9.8 14H14.2L14.4 14.8H9.6Z'],
  gluteos: ['M9.2 15.2H11.8V17.3Q10.3 17.9 9.1 17.1Z', 'M14.8 15.2H12.2V17.3Q13.7 17.9 14.9 17.1Z'],
  isquios: ['M9.2 17.9H11.7L11.4 20.2H9.5Z', 'M14.8 17.9H12.3L12.6 20.2H14.5Z'],
}

/** Un corazón chico en el pecho: el cardio no es un músculo que se pinte. */
const CORAZON = 'M12 12.6L9.6 10.3Q8.7 9.2 9.4 8.1Q10.3 7 11.4 7.6L12 8.2L12.6 7.6Q13.7 7 14.6 8.1Q15.3 9.2 14.4 10.3Z'

export interface MuscleIconSpec {
  /** Todas las zonas de la figura, con las que van pintadas marcadas. */
  zonas: Array<{ paths: Zona; pintada: boolean }>
  /** Trazados extra que van siempre pintados (el corazón del cardio). */
  extra: string[]
}

const PINTAR: Record<MuscleGroup, { lado: 'frente' | 'espalda'; zonas: string[] }> = {
  pecho: { lado: 'frente', zonas: ['pectorales'] },
  espalda: { lado: 'espalda', zonas: ['dorsales', 'trapecio'] },
  hombros: { lado: 'frente', zonas: ['deltoides'] },
  biceps: { lado: 'frente', zonas: ['brazos'] },
  triceps: { lado: 'espalda', zonas: ['brazos'] },
  piernas: { lado: 'frente', zonas: ['cuadriceps', 'gemelos'] },
  gluteos: { lado: 'espalda', zonas: ['gluteos'] },
  core: { lado: 'frente', zonas: ['abdominales'] },
  cardio: { lado: 'frente', zonas: [] },
}

export function muscleIconSpec(group: MuscleGroup): MuscleIconSpec {
  const { lado, zonas } = PINTAR[group] ?? PINTAR.core
  const figura = lado === 'frente' ? FRENTE : ESPALDA
  return {
    zonas: Object.entries(figura).map(([nombre, paths]) => ({ paths, pintada: zonas.includes(nombre) })),
    extra: group === 'cardio' ? [CORAZON] : [],
  }
}

/** Qué zonas pinta cada grupo, de frente y de espaldas, para la figura entera. */
const ZONAS_POR_LADO: Record<'frente' | 'espalda', Partial<Record<MuscleGroup, string[]>>> = {
  frente: {
    pecho: ['pectorales'], hombros: ['deltoides'], biceps: ['brazos'],
    piernas: ['cuadriceps', 'gemelos'], core: ['abdominales', 'cadera'],
  },
  espalda: {
    espalda: ['dorsales', 'trapecio'], hombros: ['deltoides'], triceps: ['brazos'],
    piernas: ['isquios', 'gemelos'], gluteos: ['gluteos'], core: ['lumbares'],
  },
}

/**
 * La figura de un lado con cada zona en un nivel de 0 a 1: el mayor de los
 * grupos que la pintan. Sirve para el ícono de una rutina (niveles 0 o 1) y
 * para el mapa de Progreso (proporcional a las series).
 */
export function figuraPorNiveles(
  lado: 'frente' | 'espalda',
  niveles: Partial<Record<MuscleGroup, number>>,
): Array<{ paths: Zona; nivel: number }> {
  const figura = lado === 'frente' ? FRENTE : ESPALDA
  const nivelZona = new Map<string, number>()
  for (const [grupo, zonas] of Object.entries(ZONAS_POR_LADO[lado]) as [MuscleGroup, string[]][]) {
    const n = niveles[grupo] ?? 0
    for (const z of zonas) nivelZona.set(z, Math.max(nivelZona.get(z) ?? 0, n))
  }
  return Object.entries(figura).map(([nombre, paths]) => ({ paths, nivel: nivelZona.get(nombre) ?? 0 }))
}
