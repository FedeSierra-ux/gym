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
  return Array.from(groups).slice(0, 4)
}

function getApproxDuration(sets: number[]) {
  return Math.round(sets.reduce((a, s) => a + s * 2.5, 0))
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
    <div className="flex-1 min-h-0 scroll-area" style={{ paddingBottom: 16 }}>

      {/* Header */}
      <div style={{ padding: '60px 22px 0' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: '#ECEEF4' }}>Mis Rutinas</div>
        <div style={{ fontSize: 13, color: '#737A8C', marginTop: 4 }}>
          {routines.length} rutinas guardadas
        </div>
      </div>

      {/* Routine cards */}
      <div style={{ padding: '20px 22px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {routines.map((routine) => {
          const muscleGroups = getRoutineMuscleGroups(
            routine.exercises.map((e) => e.exerciseId),
            allExercises
          )
          const totalSets = routine.exercises.map((e) => e.sets)
          const duration = getApproxDuration(totalSets)
          const isLast = routine.id === lastRoutineId
          const primaryColor = muscleGroups[0] ? muscleGroupConfig[muscleGroups[0]].color : '#E8634A'

          return (
            <button
              key={routine.id}
              onClick={() => setActiveRoutineId(routine.id)}
              style={{
                background: '#161821', borderRadius: 18, padding: 16, textAlign: 'left', width: '100%',
                border: `1px solid ${isLast ? 'rgba(232,99,74,0.22)' : 'rgba(236,238,244,0.12)'}`,
                borderLeft: `3px solid ${primaryColor}`,
                transition: 'all 0.15s',
                cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif',
              }}
            >
              <div className="flex items-start gap-3">
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  background: primaryColor + '20',
                  border: `1px solid ${primaryColor}40`,
                }}>
                  {routine.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#ECEEF4' }}>{routine.name}</span>
                    {isLast && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#E8634A',
                        background: 'rgba(232,99,74,0.15)', padding: '2px 7px', borderRadius: 6, flexShrink: 0,
                      }}>
                        ÚLTIMO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#737A8C', marginTop: 3 }}>
                    {routine.exercises.length} ejercicios · ~{duration} min
                  </div>
                </div>
                <div style={{ color: '#3B3F4E', fontSize: 20, alignSelf: 'center', lineHeight: 1 }}>›</div>
              </div>

              {muscleGroups.length > 0 && (
                <div className="flex flex-wrap gap-[6px]" style={{ marginTop: 12 }}>
                  {muscleGroups.map(mg => {
                    const cfg = muscleGroupConfig[mg]
                    return (
                      <span key={mg} style={{
                        fontSize: 11, fontWeight: 600, color: cfg.color,
                        background: cfg.color + '22', padding: '4px 10px', borderRadius: 20,
                      }}>
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
      <div style={{ padding: '14px 22px 0' }}>
        <button
          onClick={handleCreateRoutine}
          style={{
            width: '100%', border: '1px solid rgba(232,99,74,0.25)', borderRadius: 18,
            background: 'rgba(232,99,74,0.07)', color: '#E8634A',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 14, fontWeight: 700, padding: '16px 0', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 700 }}>+</span> Crear nueva rutina
        </button>
      </div>

      {/* Custom exercises */}
      <div style={{ padding: '10px 22px 0' }}>
        <button
          onClick={() => setShowCustomExercises(true)}
          style={{
            width: '100%', borderRadius: 18, padding: '14px 0',
            border: '1px solid rgba(236,238,244,0.12)',
            background: '#161821',
            color: '#737A8C',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>💪</span> Mis ejercicios
          {customExercises.length > 0 && (
            <span style={{
              fontSize: 10, padding: '2px 6px', borderRadius: 20, fontWeight: 700,
              background: 'rgba(236,238,244,0.08)', color: '#ECEEF4',
            }}>
              {customExercises.length}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
