import { useState } from 'react'
import { useStore } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { CustomExercisesScreen } from './CustomExercisesScreen'
import type { MuscleGroup } from '../types'

function getRoutineMuscleGroups(exerciseIds: string[], exercises: { id: string; muscleGroup: MuscleGroup }[]) {
  const groups = new Set<MuscleGroup>()
  for (const id of exerciseIds) {
    const ex = exercises.find((e) => e.id === id)
    if (ex) groups.add(ex.muscleGroup)
  }
  return Array.from(groups).slice(0, 3)
}

function getApproxDuration(sets: number[]) {
  return Math.round(sets.reduce((a, s) => a + s * 2.5, 0))
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}

export function RutinasScreen() {
  const { routines, exercises, workouts, customExercises, setActiveRoutineId, addRoutine } = useStore()
  const [showCustomExercises, setShowCustomExercises] = useState(false)

  const allExercises = [...exercises, ...customExercises]
  const sortedWorkouts = [...workouts]
    .filter((w) => w.finishedAt)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  const lastRoutineId = sortedWorkouts[0]?.routineId

  const handleCreateRoutine = () => {
    const id = `routine-${Date.now()}`
    addRoutine({
      id,
      name: 'Nueva Rutina',
      emoji: '💪',
      exercises: [],
      createdAt: Date.now(),
    })
    setActiveRoutineId(id)
  }

  if (showCustomExercises) {
    return <CustomExercisesScreen onClose={() => setShowCustomExercises(false)} />
  }

  return (
    <div className="flex-1 min-h-0 scroll-area pb-4">
      {/* Header */}
      <div className="px-5 pt-14 pb-5 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0,212,255,0.05) 0%, transparent 70%)' }}
        />
        <h1 className="text-2xl font-bold text-white relative">Mis Rutinas</h1>
        <p className="text-sm mt-1 relative" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {routines.length} rutinas guardadas
        </p>
      </div>

      <div className="px-4 flex flex-col gap-3">
        {routines.map((routine) => {
          const muscleGroups = getRoutineMuscleGroups(
            routine.exercises.map((e) => e.exerciseId),
            allExercises
          )
          const totalSets = routine.exercises.map((e) => e.sets)
          const duration = getApproxDuration(totalSets)
          const isLast = routine.id === lastRoutineId
          const primaryGroup = muscleGroups[0]
          const primaryConfig = primaryGroup ? muscleGroupConfig[primaryGroup] : null

          return (
            <button
              key={routine.id}
              onClick={() => setActiveRoutineId(routine.id)}
              className="rounded-2xl p-4 text-left w-full active:scale-[0.98] transition-all"
              style={{
                background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
                border: `1px solid ${isLast ? 'rgba(0,255,136,0.18)' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.45)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      backgroundColor: primaryConfig ? primaryConfig.color + '15' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${primaryConfig ? primaryConfig.color + '25' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {routine.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base">{routine.name}</h3>
                      {isLast && (
                        <span
                          className="text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase"
                          style={{ background: 'rgba(0,255,136,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,255,136,0.2)' }}
                        >
                          Último
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {routine.exercises.length} ejercicios · ~{duration} min
                    </p>
                  </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)' }} className="text-xl mt-1">›</span>
              </div>

              {muscleGroups.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {muscleGroups.map((mg) => {
                    const cfg = muscleGroupConfig[mg]
                    return (
                      <span
                        key={mg}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ color: cfg.color, backgroundColor: cfg.color + '15', border: `1px solid ${cfg.color}20` }}
                      >
                        {cfg.emoji} {cfg.label}
                      </span>
                    )
                  })}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Create button */}
      <div className="px-4 mt-4">
        <button
          onClick={handleCreateRoutine}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 transition-colors"
          style={{
            border: '1.5px dashed rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          <PlusIcon />
          <span className="font-semibold text-sm">Crear nueva rutina</span>
        </button>
      </div>

      {/* Custom exercises button */}
      <div className="px-4 mt-2 mb-2">
        <button
          onClick={() => setShowCustomExercises(true)}
          className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-colors"
          style={{
            border: '1px solid rgba(0,212,255,0.15)',
            background: 'rgba(0,212,255,0.04)',
            color: 'rgba(0,212,255,0.6)',
          }}
        >
          <span className="text-base leading-none">💪</span>
          <span className="font-semibold text-sm">Mis ejercicios</span>
          {customExercises.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.8)' }}
            >
              {customExercises.length}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
