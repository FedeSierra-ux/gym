import { useEffect } from 'react'

/**
 * Mantiene la pantalla encendida mientras dura el entreno (Screen Wake Lock:
 * Chrome/Android desde hace rato y Safari iOS desde 16.4). Sin esto el celular
 * se bloquea entre series y hay que desbloquearlo para cargar cada peso.
 * Si la API no existe, no pasa nada: la función se vuelve un no-op.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let released = false

    const request = async () => {
      if (released || document.visibilityState !== 'visible') return
      try {
        sentinel = await navigator.wakeLock.request('screen')
      } catch {
        // El navegador puede negarlo (batería baja, pestaña en segundo plano).
      }
    }

    // El lock se pierde al minimizar la app: hay que volver a pedirlo al volver.
    const onVisibilityChange = () => { void request() }

    void request()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void sentinel?.release().catch(() => {})
    }
  }, [active])
}
