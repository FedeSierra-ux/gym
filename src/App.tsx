import { useStore } from './store/useStore'
import { BottomNav } from './components/BottomNav'
import { ToastContainer } from './components/Toast'
import { HomeScreen } from './screens/HomeScreen'
import { RutinasScreen } from './screens/RutinasScreen'
import { RoutineDetailScreen } from './screens/RoutineDetailScreen'
import { CalendarioScreen } from './screens/CalendarioScreen'
import { ProgresoScreen } from './screens/ProgresoScreen'
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'

function App() {
  const { activeTab, activeRoutineId, activeWorkout, onboarded } = useStore()

  if (!onboarded) {
    return <OnboardingScreen />
  }

  if (activeWorkout) {
    return (
      <div className="flex flex-col h-full relative">
        <ActiveWorkoutScreen />
        <ToastContainer />
      </div>
    )
  }

  const showRoutineDetail = activeTab === 'rutinas' && activeRoutineId !== null

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'rutinas' && (
          showRoutineDetail ? <RoutineDetailScreen /> : <RutinasScreen />
        )}
        {activeTab === 'calendario' && <CalendarioScreen />}
        {activeTab === 'progreso' && <ProgresoScreen />}
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}

export default App
