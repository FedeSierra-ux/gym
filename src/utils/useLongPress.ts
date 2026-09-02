import { useRef } from 'react'
import { vibrate } from './haptics'

/**
 * Pulsación larga, con el gesto cancelado si el dedo se mueve (para no romper
 * el scroll de las listas). Lo usan la tarjeta de rutina, para abrir su menú, y
 * el tilde de cada serie, donde mantener apretado arranca el cronómetro de
 * descanso en vez de confirmar sin más.
 */
export function useLongPress(onLongPress: () => void, ms = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const disparado = useRef(false)
  const origen = useRef<{ x: number; y: number } | null>(null)

  const cancelar = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    origen.current = null
  }

  return {
    /** true si el último gesto fue una pulsación larga: sirve para no hacer también el tap. */
    consumioElTap: () => {
      const valor = disparado.current
      disparado.current = false
      return valor
    },
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        disparado.current = false
        origen.current = { x: e.clientX, y: e.clientY }
        timer.current = setTimeout(() => {
          disparado.current = true
          vibrate(30)
          onLongPress()
        }, ms)
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (!origen.current) return
        const dx = Math.abs(e.clientX - origen.current.x)
        const dy = Math.abs(e.clientY - origen.current.y)
        if (dx > 10 || dy > 10) cancelar()
      },
      onPointerUp: cancelar,
      onPointerLeave: cancelar,
      onPointerCancel: cancelar,
      onContextMenu: (e: React.MouseEvent) => {
        // En el celular el menú nativo de "copiar/seleccionar" tapa el nuestro.
        e.preventDefault()
      },
    },
  }
}
