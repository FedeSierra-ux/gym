/**
 * Lee el descanso que pide la nota de un ejercicio: "descanso 2 min",
 * "descanso 1:30", "descanso 90 s", "descanso 1 min 30". Devuelve segundos, o
 * null si la nota no dice nada. Un número sin unidad se toma como minutos si es
 * chico (hasta 5) y como segundos si no.
 */
export function descansoDeNota(nota: string | undefined): number | null {
  if (!nota) return null
  const m = nota.toLowerCase().match(
    /descanso\s*(?:de\s*)?(\d+(?:[.,]\d+)?)(?::(\d{1,2}))?\s*(min(?:utos?)?|m\b|'|seg(?:undos?)?|s\b|")?(?:\s*(\d{1,2})\s*(?:s|seg)?\b)?/,
  )
  if (!m) return null
  const n = parseFloat(m[1].replace(',', '.'))
  if (!isFinite(n) || n <= 0) return null
  let seg: number
  if (m[2] != null) seg = Math.round(n) * 60 + parseInt(m[2], 10)
  else if (m[3] && /^(min|m|')/.test(m[3])) seg = Math.round(n * 60) + (m[4] ? parseInt(m[4], 10) : 0)
  else if (m[3]) seg = Math.round(n)
  else seg = n <= 5 ? Math.round(n * 60) : Math.round(n)
  return seg >= 10 && seg <= 600 ? seg : null
}
