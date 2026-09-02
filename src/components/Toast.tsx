import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { S } from '../theme'
import type { AppToast } from '../types'

function ToastItem({ toast }: { toast: AppToast }) {
  const { removeToast } = useStore()

  useEffect(() => {
    // Los avisos con "Deshacer" duran más: hay que llegar a leerlos y decidir.
    const ms = toast.undo ? 6000 : toast.type === 'pr' ? 4000 : 3000
    const t = setTimeout(() => removeToast(toast.id), ms)
    return () => clearTimeout(t)
  }, [toast.id, toast.type, toast.undo, removeToast])

  const fondo = {
    success: S.acc,
    pr: S.acc2,
    info: S.surf2,
  }[toast.type]
  const texto = toast.type === 'info' ? S.ink : '#0C0E14'

  return (
    <div
      className="toast-in flex items-center gap-3 rounded-2xl shadow-lg"
      style={{
        background: fondo,
        border: toast.type === 'info' ? `1px solid ${S.line2}` : 'none',
        padding: toast.undo ? '8px 8px 8px 16px' : '12px 16px',
        minHeight: 48,
      }}
      onClick={() => { if (!toast.undo) removeToast(toast.id) }}
    >
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: texto, lineHeight: 1.35 }}>
        {toast.message}
      </span>
      {toast.undo && (
        <button
          onClick={(e) => { e.stopPropagation(); toast.undo?.(); removeToast(toast.id) }}
          style={{
            flexShrink: 0, minHeight: 40, padding: '0 16px', borderRadius: 12,
            background: 'rgba(232,99,74,0.14)', border: `1px solid ${S.acc}`,
            color: S.acc, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif',
          }}
        >
          Deshacer
        </button>
      )}
    </div>
  )
}

/**
 * Los avisos aparecen abajo, encima de la barra de navegación. Cuando hay una
 * pantalla con su propio botón principal abajo (el resumen del entreno, una
 * hoja modal), `arriba` los manda al tope: al terminar un entreno se disparaban
 * tres avisos justo encima de "Ver mi progreso", el único botón para salir, y
 * lo dejaban tapado varios segundos.
 */
export function ToastContainer({ arriba = false }: { arriba?: boolean } = {}) {
  const { toasts } = useStore()
  if (toasts.length === 0) return null

  return (
    <div
      className={`absolute left-0 right-0 flex flex-col items-center gap-2 px-4 z-[100] pointer-events-none ${arriba ? 'top-0 pt-[max(56px,calc(env(safe-area-inset-top,0px)+16px))]' : 'bottom-20'}`}
    >
      {toasts.slice(-3).map((t) => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
