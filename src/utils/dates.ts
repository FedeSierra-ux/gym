/** Timestamp → "YYYY-MM-DD" en hora local, que es lo que espera <input type="date">. */
export function toDateInputValue(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "YYYY-MM-DD" → timestamp local al mediodía (evita corrimientos de zona horaria). */
export function fromDateInputValue(value: string): number | null {
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, 12, 0, 0, 0).getTime()
}
