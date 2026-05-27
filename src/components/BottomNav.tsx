import type { NavTab } from '../types'
import { useStore } from '../store/useStore'

function HomeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function GridIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )
}

function CalIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <circle cx="8" cy="15" r="1" fill="currentColor"/>
      <circle cx="12" cy="15" r="1" fill="currentColor"/>
      <circle cx="16" cy="15" r="1" fill="currentColor"/>
    </svg>
  )
}

function ChartIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18"/>
      <path d="M5 20V12"/>
      <path d="M9 20V8"/>
      <path d="M13 20V14"/>
      <path d="M17 20V4"/>
    </svg>
  )
}

const tabs: { id: NavTab; label: string; Icon: (props: { size?: number }) => React.ReactElement }[] = [
  { id: 'home', label: 'Inicio', Icon: HomeIcon },
  { id: 'rutinas', label: 'Rutinas', Icon: GridIcon },
  { id: 'calendario', label: 'Registro', Icon: CalIcon },
  { id: 'progreso', label: 'Progreso', Icon: ChartIcon },
]

export function BottomNav() {
  const { activeTab, setActiveTab, setActiveRoutineId } = useStore()

  return (
    <nav className="bottom-nav flex-shrink-0">
      <div className="flex pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id !== 'rutinas') setActiveRoutineId(null)
              }}
              className="relative flex-1 flex flex-col items-center pt-3 pb-4 gap-1 transition-all"
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full"
                  style={{ background: 'var(--primary)', boxShadow: '0 0 12px rgba(0,255,136,1), 0 0 24px rgba(0,255,136,0.5)' }}
                />
              )}
              <span
                className="transition-all"
                style={{
                  color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.25)',
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(0,255,136,0.7))' : undefined,
                }}
              >
                <tab.Icon size={22} />
              </span>
              <span
                className="text-[9px] font-semibold tracking-wider uppercase transition-all"
                style={{ color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.2)' }}
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
