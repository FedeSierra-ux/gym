/**
 * 1RM estimado con la fórmula de Epley: kg × (1 + reps / 30), redondeado.
 * Con una repetición (o menos) el 1RM es el peso mismo.
 */
export function estimate1RM(kg: number, reps: number): number {
  if (reps <= 1) return kg
  return Math.round(kg * (1 + reps / 30))
}
