/**
 * Carga de una serie. Sin peso (abdominales, dominadas, todo lo que va a peso
 * corporal) se muestran sólo las repeticiones en vez de un "0kg" que no dice
 * nada.
 */
export function formatLoad(kg: number, reps: number, opts?: { conReps?: boolean }): string {
  const sufijo = opts?.conReps === false ? '' : ' reps'
  if (!kg || kg <= 0) return `${reps}${sufijo}`
  return `${kg}kg × ${reps}${sufijo}`
}
