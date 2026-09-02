import type { NavTab } from '../types'
import { useStore } from '../store/useStore'
import { NavIcon, type NavIconName } from './NavIcons'
import { S } from '../theme'

const TABS: { id: NavTab; label: string; icon: NavIconName }[] = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'rutinas', label: 'Rutinas', icon: 'rutinas' },
  { id: 'calendario', label: 'Agenda', icon: 'agenda' },
  { id: 'progreso', label: 'Progreso', icon: 'progreso' },
  { id: 'perfil', label: 'Perfil', icon: 'perfil' },
]

export function BottomNav() {
  const { activeTab, setActiveTab, setActiveRoutineId } = useStore()

  return (
    <nav className="bottom-nav flex-shrink-0">
      <div className="flex" style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom, 28px))' }}>
        {TABS.map(({ id, label, icon }) => {
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
              style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif' }}
            >
              {/* Active indicator bar */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: isActive ? 24 : 0, height: 2, borderRadius: 1,
                background: S.acc, transition: 'width 0.2s ease',
              }} />
              <span style={{ color: isActive ? S.acc : S.dim, transition: 'color 0.15s' }}>
                <NavIcon name={icon} active={isActive} />
              </span>
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
