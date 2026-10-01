const DIA = 86400000

/**
 * "hoy", "ayer", "hace 3 días", "hace 2 semanas", "hace 3 meses". Cuenta días
 * de calendario, no horas: algo de anoche a las 23 es "ayer" aunque hayan
 * pasado dos horas.
 */
export function haceCuanto(ts: number, nowTs: number = Date.now()): string {
  const inicio = (t: number) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() }
  const dias = Math.round((inicio(nowTs) - inicio(ts)) / DIA)
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'ayer'
  if (dias < 7) return `hace ${dias} días`
  if (dias < 30) {
    const semanas = Math.floor(dias / 7)
    return semanas === 1 ? 'hace 1 semana' : `hace ${semanas} semanas`
  }
  const meses = Math.floor(dias / 30)
  return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`
}
