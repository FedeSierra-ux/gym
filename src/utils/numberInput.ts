/**
 * Los teclados del teléfono ofrecen coma o punto según el idioma del sistema,
 * y en un gimnasio nadie se pone a pensar cuál toca: los campos numéricos
 * aceptan los dos y guardan siempre con punto, que es lo que entiende
 * parseFloat.
 */
export function normalizeDecimalInput(value: string): string {
  const cleaned = value.replace(/,/g, '.').replace(/[^0-9.]/g, '')
  const [rawHead, ...rest] = cleaned.split('.')
  // "05" → "5", pero "0" y "0.5" quedan como están.
  const head = rawHead.replace(/^0+(?=\d)/, '')
  return rest.length ? `${head}.${rest.join('')}` : head
}

/** Sólo dígitos: para reps, que no admiten decimales. */
export function normalizeIntegerInput(value: string): string {
  const digits = value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '')
  return digits
}

/** parseFloat tolerando la coma como separador decimal. */
export function parseDecimal(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value
  if (value == null || value === '') return NaN
  return parseFloat(normalizeDecimalInput(value))
}

/**
 * Normaliza y acota un valor decimal conservando lo que se está tipeando: si
 * el texto termina en separador ("12,") se devuelve "12." para que el campo no
 * lo borre de abajo del dedo antes de escribir el decimal.
 */
export function clampDecimalInput(value: string, max: number): string {
  const normalized = normalizeDecimalInput(value)
  if (normalized === '' || normalized === '.') return ''
  const num = parseFloat(normalized)
  if (isNaN(num)) return ''
  const clamped = Math.min(max, Math.max(0, Math.round(num * 100) / 100))
  if (clamped !== num) return String(clamped)
  return normalized.endsWith('.') ? `${clamped}.` : normalized
}

/** Props comunes de un campo decimal: teclado numérico con coma y punto. */
export const decimalInputProps = {
  type: 'text' as const,
  inputMode: 'decimal' as const,
  autoComplete: 'off' as const,
}

export const integerInputProps = {
  type: 'text' as const,
  inputMode: 'numeric' as const,
  autoComplete: 'off' as const,
}
