import { S } from '../theme'

/**
 * Línea de progreso de un ejercicio: un punto por sesión, con el último
 * marcado. Reemplaza a las barras mensuales, que dejaban cuatro columnas vacías
 * de seis y ocupaban 600 px por ejercicio.
 */
export function Sparkline({
  values, color = S.acc, width = 240, height = 40,
}: {
  values: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (values.length === 0) return null

  const pad = 3
  const max = Math.max(...values)
  const min = Math.min(...values)
  // Con una sola marca (o todas iguales) la línea va al medio en vez de al piso.
  const rango = max - min || Math.max(1, max * 0.2)
  const base = max === min ? min - rango / 2 : min

  const x = (i: number) => values.length === 1
    ? width / 2
    : pad + (i / (values.length - 1)) * (width - pad * 2)
  const y = (v: number) => height - pad - ((v - base) / rango) * (height - pad * 2)

  const linea = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${linea} L${x(values.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`
  const ultimoX = x(values.length - 1)
  const ultimoY = y(values[values.length - 1])

  return (
    <svg
      width="100%" height={height} viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none" aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path d={area} fill={color} fillOpacity={0.12} stroke="none" />
      <path d={linea} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {values.length > 1 && values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={1.8} fill={color} fillOpacity={0.45} />
      ))}
      <circle cx={ultimoX} cy={ultimoY} r={3.6} fill={color} />
      <circle cx={ultimoX} cy={ultimoY} r={6} fill={color} fillOpacity={0.2} />
    </svg>
  )
}
