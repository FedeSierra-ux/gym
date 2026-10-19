import { colors, text, radius, row, space, tabata, TAP_MIN } from '../design-tokens.js'

/**
 * Los tokens de diseño para las pantallas que estilan en línea.
 *
 * Importá `S` en vez de volver a escribir la paleta: sale del mismo objeto que
 * alimenta a tailwind.config.js y a las variables CSS, así que un color
 * cambiado acá cambia en toda la app. `S.tabata` son los colores del
 * cronómetro del tabata (ver design-tokens.js): quedan aparte para que no se
 * vuelvan variables CSS sueltas.
 */
export const S: Record<keyof typeof colors, string> & { tabata: Record<keyof typeof tabata, string> } = { ...colors, tabata }

/** Escala tipográfica con piso de 11px. Ver design-tokens.js. */
export const T: Record<keyof typeof text, number> = text

/** Radios: sm 8 (chips), md 12 (botones), lg 16 (tarjetas), xl 24 (hojas y modales). */
export const R: Record<keyof typeof radius, number> = radius

export { TAP_MIN }

/** Escala de espaciado de 4 px: SP[1] = 4 … SP[4] = 16 … SP[8] = 32. Ver design-tokens.js. */
export const SP: Record<keyof typeof space, number> = space

/** Alturas de fila: compact 44 (una línea, tocable), regular 56 (título y subtítulo), loose 60. */
export const ROW: Record<keyof typeof row, number> = row

/**
 * El color de una diferencia: verde si sube, `dim` si baja o no cambia (bajar
 * no es un error: el rojo queda para los errores), ámbar si es un récord y
 * `dim` siempre si la diferencia es neutra.
 * Es la misma semántica en toda la app, salvo Progreso → Resumen del mes.
 */
export function deltaColor(delta: number, kind?: 'record' | 'neutral'): string {
  if (kind === 'record') return S.acc2
  // `neutral`: el peso corporal, donde bajar no es ni bueno ni malo.
  if (kind === 'neutral') return S.dim
  return delta > 0 ? S.good : S.dim
}

/** Alto mínimo de un control que se toca con el dedo. */
export const tappable = {
  minHeight: TAP_MIN,
  minWidth: TAP_MIN,
}
