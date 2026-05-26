import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import type { AppToast } from '../types'

function ToastItem({ toast }: { toast: AppToast }) {
  const { removeToast } = useStore()

  useEffect(() => {
    const t = setTimeout(() => removeToast(toast.id), toast.type === 'pr' ? 4000 : 3000)
    return () => clearTimeout(t)
  }, [toast.id, toast.type, removeToast])

  const colors = {
    success: 'bg-primary/95 text-black',
    pr: 'bg-gold/95 text-black',
    info: 'bg-info/95 text-black',
  }

  return (
    <div
      className={`toast-in flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg font-semibold text-sm ${colors[toast.type]}`}
      onClick={() => removeToast(toast.id)}
    >
      <span>{toast.message}</span>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useStore()
  if (toasts.length === 0) return null

  return (
    <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-2 px-4 z-[100] pointer-events-none">
      {toasts.slice(-3).map((t) => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
