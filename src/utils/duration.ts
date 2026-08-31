import type { Exercise } from '../types'

/** Ejercicios que se registran por tiempo en vez de kg × reps (cinta, planchas). */
export function isDurationExercise(exercise?: Exercise | null): boolean {
  return exercise?.trackingType === 'duration'
}

export function durationUnit(exercise?: Exercise | null): 'min' | 'seg' {
  return exercise?.durationUnit ?? 'min'
}

/** Lo que se escribe en el campo (minutos o segundos) → segundos. */
export function toSeconds(value: string | number, unit: 'min' | 'seg'): number {
  const num = typeof value === 'number' ? value : parseFloat(value.replace(',', '.'))
  if (!isFinite(num) || num <= 0) return 0
  return Math.round(unit === 'min' ? num * 60 : num)
}

/** Segundos → el número que se muestra en el campo, en la unidad del ejercicio. */
export function fromSeconds(seconds: number, unit: 'min' | 'seg'): string {
  if (!seconds) return ''
  if (unit === 'seg') return String(Math.round(seconds))
  const minutes = seconds / 60
  // Evita "12.999999" y deja los medios minutos legibles.
  return String(Math.round(minutes * 10) / 10)
}

/** Texto corto para listas y resúmenes: "15 min", "20 s", "1:30 min". */
export function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  if (seconds < 60) return `${Math.round(seconds)} s`
  const min = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return rest === 0 ? `${min} min` : `${min}:${String(rest).padStart(2, '0')} min`
}

/** Suma del tiempo registrado en un ejercicio de duración. */
export function totalSeconds(sets: Array<{ durationSec?: number }>): number {
  return sets.reduce((acc, s) => acc + (s.durationSec ?? 0), 0)
}
