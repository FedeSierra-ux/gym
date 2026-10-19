import { S } from '../theme'

/**
 * PROVISORIO. Otro frente de la 1.5.0 exporta estas mismas funciones desde
 * `src/theme.ts` (`deltaColor`, `SP`, `ROW`) y `src/utils/format.ts`
 * (`formatNum`, `formatMedida`). Este archivo existe sólo para que las pantallas
 * de este frente puedan importarlas con la misma firma antes de la fusión; al
 * fusionar, los imports se redirigen y este archivo se borra.
 */

/**
 * Color de una diferencia según la semántica de deltas de la app: subir es
 * verde, bajar o quedar igual va en `dim` (no es un error) y un récord, ámbar.
 * `kind: 'record'` fuerza el ámbar; `'neutral'` apaga el color.
 */
export function deltaColor(delta: number, kind?: 'record' | 'neutral'): string {
  if (kind === 'record') return S.acc2
  if (kind === 'neutral') return S.dim
  return delta > 0 ? S.good : S.dim
}

/** Escala de espaciado de 4 px. */
export const SP = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 } as const

/** Alturas de fila estándar: compacta (44) y cómoda (56). */
export const ROW = { sm: 44, lg: 56 } as const

/** Número en formato es-AR: coma decimal y punto de miles ("3.650", "58,2"). */
export function formatNum(n: number, decimales?: number): string {
  const opts = decimales === undefined
    ? { maximumFractionDigits: 2 }
    : { minimumFractionDigits: decimales, maximumFractionDigits: decimales }
  return n.toLocaleString('es-AR', opts)
}

/** Medida con su unidad: "58,2 kg", "67,5 cm". */
export function formatMedida(n: number, unidad: string): string {
  return `${formatNum(n)} ${unidad}`
}
