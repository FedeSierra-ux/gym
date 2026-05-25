import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { BottomNav } from './components/BottomNav'
import { HomeScreen } from './screens/HomeScreen'
import { RutinasScreen } from './screens/RutinasScreen'
import { RoutineDetailScreen } from './screens/RoutineDetailScreen'
import { CalendarioScreen } from './screens/CalendarioScreen'
import { ProgresoScreen } from './screens/ProgresoScreen'
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen'

function App() {
  const { activeTab, activeRoutineId, activeWorkout, seedData } = useStore()

  // Seed data on first load
  useEffect(() => {
    seedData()
  }, [seedData])

  // If active workout is running, show full screen workout
  if (activeWorkout) {
    return (
      <div className="flex flex-col h-full">
        <ActiveWorkoutScreen />
      </div>
    )
  }

  // If in rutinas and a routine is selected, show detail
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
