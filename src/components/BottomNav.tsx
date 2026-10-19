import type { NavTab } from '../types'
import { useStore } from '../store/useStore'
import { S } from '../theme'

const TABS: { id: NavTab; label: string; emoji: string }[] = [
  { id: 'home', label: 'Inicio', emoji: '🏠' },
  { id: 'rutinas', label: 'Rutinas', emoji: '📋' },
  { id: 'calendario', label: 'Agenda', emoji: '📅' },
  { id: 'progreso', label: 'Progreso', emoji: '📈' },
  { id: 'perfil', label: 'Perfil', emoji: '👤' },
]

export function BottomNav() {
  // Siempre montada: con selectores no se vuelve a pintar por cada aviso o
  // cada serie que se guarda.
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const setActiveRoutineId = useStore((s) => s.setActiveRoutineId)

  return (
    <nav className="bottom-nav flex-shrink-0" aria-label="Secciones">
      <div className="flex" style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom, 28px))' }}>
        {TABS.map(({ id, label, emoji }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                setActiveTab(id)
                if (id !== 'rutinas') setActiveRoutineId(null)
              }}
              className="flex-1 flex flex-col items-center gap-1 py-[11px]"
              style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {/* Active indicator bar */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: isActive ? 24 : 0, height: 2, borderRadius: 1,
                background: S.acc, transition: 'width 0.2s ease',
              }} />
              <span aria-hidden="true" style={{ fontSize: 17, opacity: isActive ? 1 : 0.35, transition: 'opacity 0.15s' }}>{emoji}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? S.acc : S.dim,
                  transition: 'color 0.15s',
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
