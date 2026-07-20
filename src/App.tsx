import { useStore } from './store/useStore'
import { useWorkoutStore } from './stores/workoutStore'
import { BottomNav } from './components/BottomNav'
import { ToastContainer } from './components/Toast'
import { UpdatePrompt } from './components/UpdatePrompt'
import { HomeScreen } from './screens/HomeScreen'
import { RutinasScreen } from './screens/RutinasScreen'
import { RoutineDetailScreen } from './screens/RoutineDetailScreen'
import { CalendarioScreen } from './screens/CalendarioScreen'
import { ProgresoScreen } from './screens/ProgresoScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal'

function App() {
  const { activeTab, activeRoutineId, onboarded } = useStore()
  const { activeWorkout, summaryWorkout, summaryPrCount, dismissSummary } = useWorkoutStore()

  if (!onboarded) {
    return (
      <>
        <OnboardingScreen />
        <UpdatePrompt />
      </>
    )
  }

  if (activeWorkout) {
    return (
      <div className="flex flex-col h-full relative">
        <ActiveWorkoutScreen />
        <ToastContainer />
        <UpdatePrompt />
      </div>
    )
  }

  if (summaryWorkout) {
    return (
      <div className="flex flex-col h-full relative">
        <WorkoutSummaryModal
          workout={summaryWorkout}
          prCount={summaryPrCount}
          onDismiss={dismissSummary}
        />
        <ToastContainer />
        <UpdatePrompt />
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
        {activeTab === 'perfil' && <ProfileScreen />}
      </div>
      <BottomNav />
      <ToastContainer />
      <UpdatePrompt />
    </div>
  )
}

export default App
