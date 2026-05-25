import type { NavTab } from '../types'
import { useStore } from '../store/useStore'

const tabs: { id: NavTab; label: string; emoji: string }[] = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'rutinas', label: 'Rutinas', emoji: '📋' },
  { id: 'calendario', label: 'Calendario', emoji: '📅' },
  { id: 'progreso', label: 'Progreso', emoji: '📈' },
]

export function BottomNav() {
  const { activeTab, setActiveTab, setActiveRoutineId } = useStore()

  return (
    <nav className="bottom-nav flex-shrink-0 bg-surface border-t border-border">
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
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <span className="text-xl leading-none">{tab.emoji}</span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-10 h-0.5 bg-primary rounded-t-full" style={{ position: 'relative' }} />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
