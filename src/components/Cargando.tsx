import { S } from '../theme'

/**
 * Lo que se ve mientras baja un chunk de una pantalla cargada con React.lazy:
 * el fondo de siempre y nada más, para que no parpadee un spinner en el medio
 * de los 100 ms que tarda.
 */
export function Cargando() {
  return <div className="flex-1 min-h-0" style={{ background: S.bg }} aria-busy="true" />
}
