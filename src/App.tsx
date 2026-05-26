import { useStore } from './store/useStore'
import { BottomNav } from './components/BottomNav'
import { HomeScreen } from './screens/HomeScreen'
import { RutinasScreen } from './screens/RutinasScreen'
import { RoutineDetailScreen } from './screens/RoutineDetailScreen'
import { CalendarioScreen } from './screens/CalendarioScreen'
import { ProgresoScreen } from './screens/ProgresoScreen'
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen'

function App() {
  const { activeTab, activeRoutineId, activeWorkout } = useStore()

  if (activeWorkout) {
    return (
      <div className="flex flex-col h-full">
        <ActiveWorkoutScreen />
      </div>
    )
  }

  const showRoutineDetail = activeTab === 'rutinas' && activeRoutineId !== null

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'rutinas' && (
          showRoutineDetail ? <RoutineDetailScreen /> : <RutinasScreen />
        )}
        {activeTab === 'calendario' && <CalendarioScreen />}
        {activeTab === 'progreso' && <ProgresoScreen />}
      </div>
      <BottomNav />
    </div>
  )
}

export default App
