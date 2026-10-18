/**
 * Un solo formato numérico para todo lo que se muestra: es-AR, coma decimal y
 * punto de miles, sin ceros de más (58,2 · 67,5 · 3.650). Los campos que se
 * editan siguen con punto (el teclado numérico acepta los dos), pero todo lo
 * que sólo se lee —récords, medidas, avisos, gráficos, la columna Anterior—
 * sale de acá, así no conviven "58,2" y "58.2" en la misma pantalla.
 *
 * `fmt` es el formateador de un decimal; `formatNum` permite otro tope de
 * decimales (los formateadores se guardan: crearlos es caro).
 */
export const fmt = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })

const formateadores = new Map<number, Intl.NumberFormat>([[1, fmt]])

/** "58,2", "3.650", "0". Redondea a `decimales` como máximo y no muestra ceros de más. */
export function formatNum(n: number, decimales = 1): string {
  let f = formateadores.get(decimales)
  if (!f) {
    f = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: decimales })
    formateadores.set(decimales, f)
  }
  return f.format(n)
}

/** "58,2 kg", "67,5 cm": un decimal y la unidad con espacio. */
export function formatMedida(n: number, unidad: string): string {
  return `${formatNum(n)} ${unidad}`
}

/**
 * Kilos para leer: 82,5. Hasta dos decimales porque los discos chicos dan
 * 61,25.
 */
export function formatKg(kg: number): string {
  return formatNum(kg, 2)
}

/**
 * Carga de una serie. Sin peso (abdominales, dominadas, todo lo que va a peso
 * corporal) se muestran sólo las repeticiones en vez de un "0kg" que no dice
 * nada.
 */
export function formatLoad(kg: number, reps: number, opts?: { conReps?: boolean }): string {
  const sufijo = opts?.conReps === false ? '' : ' reps'
  if (!kg || kg <= 0) return `${reps}${sufijo}`
  return `${formatKg(kg)}kg × ${reps}${sufijo}`
}
