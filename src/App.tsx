import { Suspense, lazy, useEffect } from 'react'
import { useStore } from './store/useStore'
import { useWorkoutStore } from './stores/workoutStore'
import { BottomNav } from './components/BottomNav'
import { ToastContainer } from './components/Toast'
import { UpdatePrompt } from './components/UpdatePrompt'
import { HomeScreen } from './screens/HomeScreen'
import { RutinasScreen } from './screens/RutinasScreen'
import { RoutineDetailScreen } from './screens/RoutineDetailScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal'
import { InformeHost } from './components/InformeHost'
import { Cargando } from './components/Cargando'

// Las pantallas pesadas se bajan recién cuando se entra en ellas: el entreno
// (con el tabata), la Agenda, Progreso y Perfil sumaban más de 200 kB al
// chunk inicial aunque la app arranque siempre en Inicio.
const CalendarioScreen = lazy(() => import('./screens/CalendarioScreen').then((m) => ({ default: m.CalendarioScreen })))
const ProgresoScreen = lazy(() => import('./screens/ProgresoScreen').then((m) => ({ default: m.ProgresoScreen })))
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen })))
const ActiveWorkoutScreen = lazy(() => import('./screens/ActiveWorkoutScreen').then((m) => ({ default: m.ActiveWorkoutScreen })))

function App() {
  // Un entreno que quedó abierto más de 4 horas se cierra solo: al abrir la
  // app, al volver del segundo plano y una vez por minuto mientras está en uso.
  useEffect(() => {
    const check = () => {
      useWorkoutStore.getState().autoCloseStaleWorkout()
      // Si la app quedó abierta de un día para el otro, el cambio a Semanas
      // 4-6 no esperaba a que se volviera a abrir Inicio.
      if (document.visibilityState === 'visible') useStore.getState().sincronizarPrograma()
    }
    check()
    const id = setInterval(check, 60000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])

  // El aviso de actualización va una sola vez, afuera de las ramas: montado en
  // cada una se volvía a registrar el service worker al entrar y salir del
  // entreno, y el "Después" se olvidaba.
  return (
    <>
      <Pantalla />
      <UpdatePrompt />
    </>
  )
}

function Pantalla() {
  // Selectores, no el store entero: el tick del descanso escribe activeWorkout
  // cada segundo y con `useWorkoutStore()` volvía a renderizar toda la rama.
  const activeTab = useStore((s) => s.activeTab)
  const activeRoutineId = useStore((s) => s.activeRoutineId)
  const onboarded = useStore((s) => s.onboarded)
  const hayEntreno = useWorkoutStore((s) => s.activeWorkout !== null)
  const summaryWorkout = useWorkoutStore((s) => s.summaryWorkout)
  const summaryPrCount = useWorkoutStore((s) => s.summaryPrCount)
  const dismissSummary = useWorkoutStore((s) => s.dismissSummary)

  if (!onboarded) return <OnboardingScreen />

  if (hayEntreno) {
    return (
      <div className="flex flex-col h-full relative">
        <Suspense fallback={<Cargando />}>
          <ActiveWorkoutScreen />
        </Suspense>
        <ToastContainer />
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
        {/* El resumen tiene su botón abajo: los avisos van arriba para no taparlo. */}
        <ToastContainer arriba />
      </div>
    )
  }

  const showRoutineDetail = activeTab === 'rutinas' && activeRoutineId !== null

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense fallback={<Cargando />}>
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'rutinas' && (
            showRoutineDetail ? <RoutineDetailScreen /> : <RutinasScreen />
          )}
          {activeTab === 'calendario' && <CalendarioScreen />}
          {activeTab === 'progreso' && <ProgresoScreen />}
          {activeTab === 'perfil' && <ProfileScreen />}
        </Suspense>
      </div>
      <BottomNav />
      {/* Informes a pantalla completa (ciclo, tu año): tapan las pestañas. */}
      <InformeHost />
      <ToastContainer />
    </div>
  )
}

export default App
