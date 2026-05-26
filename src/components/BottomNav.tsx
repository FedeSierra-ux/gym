import type { NavTab } from '../types'
import { useStore } from '../store/useStore'

const tabs: { id: NavTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Inicio', icon: '🏠' },
  { id: 'rutinas', label: 'Rutinas', icon: '📋' },
  { id: 'calendario', label: 'Registro', icon: '📅' },
  { id: 'progreso', label: 'Progreso', icon: '📈' },
  { id: 'perfil', label: 'Perfil', icon: '👤' },
]

export function BottomNav() {
  const { activeTab, setActiveTab, setActiveRoutineId } = useStore()

  return (
    <nav className="flex-shrink-0 bg-surface border-t border-border">
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
              className={`flex-1 flex flex-col items-center py-2.5 pb-5 gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-600'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className={`text-[9px] font-medium ${isActive ? 'text-primary' : 'text-gray-600'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
