/**
 * Kilos para leer, con coma decimal como se escribe acá: 82,5. Los campos que
 * se editan siguen con punto (el teclado numérico acepta los dos), pero todo lo
 * que sólo se muestra —récords, avisos, gráficos, la columna Anterior— va con
 * coma, así no conviven "32,5" y "32.5" en la misma pantalla.
 */
export function formatKg(kg: number): string {
  const redondeado = Math.round(kg * 100) / 100
  return String(redondeado).replace('.', ',')
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
