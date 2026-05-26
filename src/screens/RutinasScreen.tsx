import { useStore } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
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

export function RutinasScreen() {
  const { routines, exercises, workouts, setActiveRoutineId, addRoutine } = useStore()

  // Find which routine was used last
  const sortedWorkouts = [...workouts]
    .filter((w) => w.finishedAt)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  const lastRoutineId = sortedWorkouts[0]?.routineId

  const handleCreateRoutine = () => {
    const id = `routine-${Date.now()}`
    addRoutine({
      id,
      name: 'Nueva Rutina',
      emoji: '🏗️',
      exercises: [],
      createdAt: Date.now(),
    })
    setActiveRoutineId(id)
  }

  return (
    <div className="flex-1 scroll-area pb-4">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">Mis Rutinas</h1>
        <p className="text-gray-500 text-sm mt-1">{routines.length} rutinas guardadas</p>
      </div>

      <div className="px-4 flex flex-col gap-3">
        {routines.map((routine) => {
          const muscleGroups = getRoutineMuscleGroups(
            routine.exercises.map((e) => e.exerciseId),
            exercises
          )
          const totalSets = routine.exercises.map((e) => e.sets)
          const duration = getApproxDuration(totalSets)
          const isLast = routine.id === lastRoutineId

          // Primary muscle group
          const primaryGroup = muscleGroups[0]
          const primaryConfig = primaryGroup ? muscleGroupConfig[primaryGroup] : null

          return (
            <button
              key={routine.id}
              onClick={() => setActiveRoutineId(routine.id)}
              className="bg-card rounded-2xl border border-border p-4 text-left w-full hover:border-primary/40 active:scale-[0.98] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      backgroundColor: primaryConfig ? primaryConfig.color + '20' : '#1e1e2a',
                      border: `1px solid ${primaryConfig ? primaryConfig.color + '40' : '#1e1e2a'}`,
                    }}
                  >
                    {routine.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{routine.name}</h3>
                      {isLast && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">
                          ÚLTIMO
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {routine.exercises.length} ejercicios · ~{duration} min
                    </p>
                  </div>
                </div>
                <span className="text-gray-600 text-lg">›</span>
              </div>

              {/* Muscle group tags */}
              <div className="flex flex-wrap gap-1.5">
                {muscleGroups.map((mg) => {
                  const cfg = muscleGroupConfig[mg]
                  return (
                    <span
                      key={mg}
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ color: cfg.color, backgroundColor: cfg.color + '20' }}
                    >
                      {cfg.emoji} {cfg.label}
                    </span>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>

      {/* Create button */}
      <div className="px-4 mt-4">
        <button
          onClick={handleCreateRoutine}
          className="w-full border-2 border-dashed border-border rounded-2xl py-4 text-gray-500 flex items-center justify-center gap-2 hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span className="text-xl">+</span>
          <span className="font-medium">Crear nueva rutina</span>
        </button>
      </div>
    </div>
  )
}
