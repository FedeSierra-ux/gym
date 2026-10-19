import { Suspense, lazy } from 'react'
import { useStore } from '../store/useStore'
import { Cargando } from './Cargando'

// Los informes se bajan recién al abrirlos: son pantallas largas que la
// mayoría de los días no se ven.
const InformeCicloSheet = lazy(() => import('../screens/InformeCicloSheet').then((m) => ({ default: m.InformeCicloSheet })))
const TuAnioScreen = lazy(() => import('../screens/TuAnioScreen').then((m) => ({ default: m.TuAnioScreen })))

/**
 * Los informes a pantalla completa, encima de las pestañas. Se abren desde
 * cualquier lado (Inicio, la tarjeta del plan, Progreso) con `abrirInforme`.
 */
export function InformeHost() {
  const informe = useStore((s) => s.informe)
  const cerrar = useStore((s) => s.cerrarInforme)
  if (!informe) return null
  return (
    <Suspense fallback={<Cargando />}>
      {informe.tipo === 'ciclo'
        ? <InformeCicloSheet key={informe.inicio} inicio={informe.inicio} fin={informe.fin} onClose={cerrar} />
        : <TuAnioScreen key={informe.year} year={informe.year} onClose={cerrar} />}
    </Suspense>
  )
}
