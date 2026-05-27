import type { NavTab } from '../types'
import { useStore } from '../store/useStore'

const tabs: { id: NavTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Inicio', icon: '🏠' },
  { id: 'rutinas', label: 'Rutinas', icon: '📋' },
  { id: 'calendario', label: 'Registro', icon: '📅' },
  { id: 'progreso', label: 'Progreso', icon: '📈' },
]

export function BottomNav() {
  const { activeTab, setActiveTab, setActiveRoutineId } = useStore()

  return (
    <nav className="bottom-nav flex-shrink-0">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id !== 'rutinas') setActiveRoutineId(null)
              }}
              className="relative flex-1 flex flex-col items-center pt-2.5 pb-6 gap-0.5 transition-all"
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                  style={{ boxShadow: '0 0 10px rgba(0,255,136,0.9), 0 0 20px rgba(0,255,136,0.4)' }}
                />
              )}
              <span
                className={`text-xl leading-none transition-all ${isActive ? 'text-primary' : 'text-gray-600'}`}
                style={isActive ? { filter: 'drop-shadow(0 0 5px rgba(0,255,136,0.6))' } : undefined}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[9px] font-semibold tracking-wide ${isActive ? 'text-primary' : 'text-gray-600'}`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
