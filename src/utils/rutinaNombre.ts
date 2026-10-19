/**
 * Nombre corto de una rutina para la leyenda del calendario: "Rutina Mile
 * piernas" → "Piernas", "Rutina Mile full body" → "Full". Se saca el prefijo
 * "Rutina Mile " / "Rutina ", se pone mayúscula inicial y, si lo que queda es
 * largo y tiene más de una palabra, se deja la primera: al lado de "6 de 7
 * planificados" entran tres nombres, no tres frases.
 */
export function nombreCortoRutina(name: string): string {
  const sinPrefijo = name.trim().replace(/^rutina\s+(mile\s+)?/i, '').trim() || name.trim()
  const capitalizado = sinPrefijo.charAt(0).toUpperCase() + sinPrefijo.slice(1)
  const [primera] = capitalizado.split(/\s+/)
  return capitalizado.length > 8 && primera.length >= 3 ? primera : capitalizado
}

/**
 * El nombre que queda al confirmar la edición (blur o Enter): lo escrito sin
 * espacios de más, o el nombre anterior si se borró todo. Antes cada tecla
 * persistía y borrar el campo dejaba una rutina sin nombre en toda la app.
 */
export function confirmarNombreRutina(borrador: string, anterior: string): string {
  return borrador.trim() || anterior
}
