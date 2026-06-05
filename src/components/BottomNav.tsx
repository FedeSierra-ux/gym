import type { NavTab } from '../types'
import { useStore } from '../store/useStore'

const TABS: { id: NavTab; label: string; emoji: string }[] = [
  { id: 'home', label: 'Inicio', emoji: '🏠' },
  { id: 'rutinas', label: 'Rutinas', emoji: '📋' },
  { id: 'calendario', label: 'Agenda', emoji: '📅' },
  { id: 'progreso', label: 'Progreso', emoji: '📈' },
]

export function BottomNav() {
  const { activeTab, setActiveTab, setActiveRoutineId } = useStore()

  return (
    <nav className="bottom-nav flex-shrink-0">
      <div className="flex" style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom, 28px))' }}>
        {TABS.map(({ id, label, emoji }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              aria-label={label}
              onClick={() => {
                setActiveTab(id)
                if (id !== 'rutinas') setActiveRoutineId(null)
              }}
              className="flex-1 flex flex-col items-center gap-1 py-[11px]"
            >
              <span style={{ fontSize: 18, opacity: isActive ? 1 : 0.35 }}>{emoji}</span>
              <span
                className="text-[10px]"
                style={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#E8634A' : '#737A8C',
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
