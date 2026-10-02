import type { MuscleGroup } from '../types'
import { MODELOS, MUSCULOS_POR_LADO, ICONO_GRUPO, ZOOM_GRUPO, type Lado, type Sexo } from './bodyModels'

/**
 * Íconos de los grupos musculares: el cuerpo entero tenue con los músculos del
 * grupo pintados, y encuadrado sobre ellos (zoom con contexto), como los mapas
 * musculares de Hevy. Los trazados vienen de `bodyModels.ts`.
 *
 * Las piernas y los glúteos se muestran con el cuerpo femenino: la app es para
 * entrenar el plan de Mile.
 */
const GRUPOS_FEMENINOS: MuscleGroup[] = ['piernas', 'gluteos']
/** Grupos que, si son los únicos de una rutina, hacen que su figura sea femenina. */
const GRUPOS_DE_TREN_INFERIOR: MuscleGroup[] = ['piernas', 'gluteos', 'core']

export function sexoDeGrupo(group: MuscleGroup): Sexo {
  return GRUPOS_FEMENINOS.includes(group) ? 'm' : 'h'
}

/** Femenina si lo que se trabaja es sólo tren inferior (y core) y hay piernas o glúteos. */
export function sexoDeNiveles(niveles: Partial<Record<MuscleGroup, number>>): Sexo {
  const activos = (Object.keys(niveles) as MuscleGroup[]).filter((g) => (niveles[g] ?? 0) > 0)
  const hayInferior = activos.some((g) => GRUPOS_FEMENINOS.includes(g))
  return hayInferior && activos.every((g) => GRUPOS_DE_TREN_INFERIOR.includes(g)) ? 'm' : 'h'
}

/** Un corazón chico en un lienzo de 24×24: el cardio no es un músculo que se pinte. */
export const CORAZON = 'M12 20.5L4.6 13Q2.2 10.2 4.2 7.2Q6.8 4.2 10 6.6L12 8.4L14 6.6Q17.2 4.2 19.8 7.2Q21.8 10.2 19.4 13Z'

export interface FiguraIcono {
  vb: [number, number, number, number]
  /** Todas las partes del cuerpo de ese lado, con las pintadas marcadas. */
  partes: Array<{ paths: string[]; pintada: boolean }>
}

/** El cuerpo de un grupo para su ícono: lado, encuadre cuadrado sobre lo que trabaja y partes. */
export function figuraDeGrupo(group: MuscleGroup, sexo: Sexo = sexoDeGrupo(group)): FiguraIcono | null {
  const spec = ICONO_GRUPO[group]
  if (!spec) return null
  const [lado, musculos] = spec
  const modelo = MODELOS[sexo][lado]
  const [x, y, w, h] = ZOOM_GRUPO[sexo][group]
  const lado_ = Math.max(w, h) * 1.9
  const cx = x + w / 2
  const cy = y + h / 2
  return {
    vb: [cx - lado_ / 2, cy - lado_ / 2, lado_, lado_],
    partes: Object.entries(modelo.partes).map(([nombre, paths]) => ({ paths, pintada: musculos.includes(nombre) })),
  }
}

/**
 * La figura entera de un lado con cada músculo en un nivel de 0 a 1: el mayor de
 * los grupos que lo pintan. Sirve para el ícono de una rutina (niveles 0 o 1) y
 * para el mapa de Progreso (proporcional a las series).
 */
export function figuraPorNiveles(
  lado: Lado,
  niveles: Partial<Record<MuscleGroup, number>>,
  sexo: Sexo,
): { vb: [number, number, number, number]; partes: Array<{ paths: string[]; nivel: number }> } {
  const modelo = MODELOS[sexo][lado]
  const nivelMusculo = new Map<string, number>()
  for (const [grupo, musculos] of Object.entries(MUSCULOS_POR_LADO[lado])) {
    const n = niveles[grupo as MuscleGroup] ?? 0
    for (const m of musculos) nivelMusculo.set(m, Math.max(nivelMusculo.get(m) ?? 0, n))
  }
  return {
    vb: modelo.vb,
    partes: Object.entries(modelo.partes).map(([nombre, paths]) => ({ paths, nivel: nivelMusculo.get(nombre) ?? 0 })),
  }
}
