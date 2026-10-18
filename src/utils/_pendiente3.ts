import { colors } from '../../design-tokens.js'

/**
 * Puente provisorio del frente 3. El frente 1 exporta estas mismas funciones
 * desde `src/theme.ts` (deltaColor, SP, ROW) y `src/utils/format.ts`
 * (formatNum, formatMedida); al fusionar, los imports de este archivo se
 * redirigen allá y este archivo se borra. Las firmas son las acordadas.
 */

/** Escala de espaciado de 4 px: SP[1]=4 … SP[8]=32. */
export const SP = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 } as const

/** Alturas de fila: tocable simple (44), con título y subtítulo (56), holgada (60). */
export const ROW = { compact: 44, regular: 56, loose: 60 } as const

/**
 * Color de un delta según el sistema: subida en verde, baja en `dim` (no es
 * un error), sin cambio en `mute`. `kind: 'record'` pinta en ámbar; `kind:
 * 'neutral'` deja todo en `dim` (el peso corporal: bajar no es ni bueno ni
 * malo).
 */
export function deltaColor(delta: number, kind?: 'record' | 'neutral'): string {
  if (kind === 'record') return colors.acc2
  if (kind === 'neutral') return colors.dim
  if (delta > 0) return colors.good
  if (delta < 0) return colors.dim
  return colors.mute
}

/** Número para leer en es-AR: 58,2 · 3.650. Con `decimales` fija esa cantidad (59,0). */
export function formatNum(n: number, decimales?: number): string {
  return n.toLocaleString('es-AR', decimales == null
    ? { maximumFractionDigits: 2 }
    : { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
}

/** Una medida corporal con un decimal fijo y su unidad: "58,2 kg", "67,5 cm". */
export function formatMedida(n: number, unidad: string): string {
  return `${formatNum(n, 1)} ${unidad}`
}
