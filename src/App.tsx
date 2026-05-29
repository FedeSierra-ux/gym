import { useState } from 'react'
import { useStore } from './store/useStore'
import { useWorkoutStore } from './stores/workoutStore'
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
  const { activeTab, activeRoutineId, onboarded, routines } = useStore()
  const { activeWorkout, cancelWorkout } = useWorkoutStore()
  const [resumeAnswered, setResumeAnswered] = useState(false)

  if (!onboarded) {
    return <OnboardingScreen />
  }

  if (activeWorkout && !resumeAnswered) {
    const routine = routines.find(r => r.id === activeWorkout.routineId)
    return (
      <div className="flex flex-col h-full relative items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <div
          className="w-full max-w-sm rounded-2xl p-6"
          style={{
            background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          }}
        >
          <div className="text-3xl mb-3 text-center">{routine?.emoji ?? '🏋️'}</div>
          <h2 className="text-white font-bold text-lg text-center mb-1">Entreno en progreso</h2>
          <p className="text-center text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {routine?.name ?? 'Rutina'} — ¿Querés continuar?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setResumeAnswered(true)}
              className="w-full py-3 rounded-xl btn-primary-glow font-bold text-sm text-black"
            >
              Continuar entreno
            </button>
            <button
              onClick={() => { cancelWorkout(); setResumeAnswered(true) }}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: 'rgb(248,113,113)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              Descartar y empezar de nuevo
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    )
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
