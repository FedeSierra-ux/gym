import { useState } from 'react'
import { useStore } from '../store/useStore'

export function OnboardingScreen() {
  const { updateUserName, setOnboarded, installMileRoutines } = useStore()
  const [name, setName] = useState('')
  const [step, setStep] = useState<'welcome' | 'name'>('welcome')

  const handleStart = () => {
    const trimmed = name.trim()
    if (trimmed) updateUserName(trimmed)
    // La app arranca con el plan de los 3 días ya cargado y repartido en la
    // semana; se puede editar o borrar como cualquier otra rutina.
    installMileRoutines()
    setOnboarded()
  }

  return (
    <div className="flex flex-col h-full bg-background items-center justify-center px-6 text-center">
      {step === 'welcome' ? (
        <div className="onboarding-in flex flex-col items-center gap-8 w-full max-w-sm">
          <div className="w-24 h-24 rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
              <rect x="13" y="21" width="22" height="6" rx="3" fill="#E8634A"/>
              <rect x="9" y="19" width="5" height="10" rx="2" fill="#d4553e"/>
              <rect x="34" y="19" width="5" height="10" rx="2" fill="#d4553e"/>
              <rect x="3" y="16" width="7" height="16" rx="2.5" fill="#E8634A"/>
              <rect x="38" y="16" width="7" height="16" rx="2.5" fill="#E8634A"/>
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">GymPro</h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Tu compañero de entrenamiento.<br />Registrá tus rutinas, seguí tu progreso y rompé récords.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-2 text-left">
              {[
                ['📋', 'Rutinas personalizadas'],
                ['⏱', 'Timer de descanso automático'],
                ['📈', 'Seguimiento de progreso'],
                ['🏆', 'Récords personales'],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-white text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('name')}
              className="w-full bg-primary text-black font-bold py-4 rounded-2xl text-base mt-2 hover:bg-primary/90 active:scale-95 transition-transform"
            >
              Comenzar →
            </button>
          </div>
        </div>
      ) : (
        <div className="onboarding-in flex flex-col items-center gap-8 w-full max-w-sm">
          <div>
            <p className="text-4xl mb-4">💪</p>
            <h2 className="text-2xl font-bold text-white mb-2">¿Cómo te llamás?</h2>
            <p className="text-gray-400 text-sm">Así te vamos a saludar en la app</p>
          </div>

          <div className="w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleStart()}
              placeholder="Tu nombre..."
              autoFocus
              maxLength={24}
              className="w-full bg-surface border-2 border-border rounded-2xl px-4 py-4 text-white text-lg text-center placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleStart}
              className="w-full bg-primary text-black font-bold py-4 rounded-2xl text-base hover:bg-primary/90 active:scale-95 transition-transform"
            >
              {name.trim() ? `Listo, ${name.trim()}!` : 'Continuar sin nombre'}
            </button>
            <button
              onClick={() => setStep('welcome')}
              className="text-gray-500 text-sm"
            >
              ‹ Volver
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
