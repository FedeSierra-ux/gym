import { useState } from 'react'
import { useStore } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { ExercisePickerScreen } from './ExercisePickerScreen'

export function RoutineDetailScreen() {
  const {
    activeRoutineId,
    routines,
    exercises,
    workouts,
    setActiveRoutineId,
    startWorkout,
    removeExerciseFromRoutine,
    updateRoutine,
    showExercisePicker,
    setShowExercisePicker,
  } = useStore()

  const [editMode, setEditMode] = useState(false)

  const routine = routines.find((r) => r.id === activeRoutineId)
  if (!routine) return null

  const lastWorkout = [...workouts]
    .filter((w) => w.routineId === routine.id && w.finishedAt)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0]

  const lastUsedDate = lastWorkout
    ? new Date(lastWorkout.startedAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Nunca usado'

  const totalDuration = routine.exercises.reduce((acc, re) => acc + re.sets * 2.5, 0)

  if (showExercisePicker) {
    return <ExercisePickerScreen routineName={routine.name} />
  }

  return (
    <div className="flex-1 flex flex-col screen-enter">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-12 pb-4 bg-background border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setActiveRoutineId(null)}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
          >
            ‹
          </button>
          <div className="flex-1">
            {editMode ? (
              <input
                className="bg-surface border border-border rounded-lg px-3 py-1.5 text-white font-bold text-lg w-full focus:outline-none focus:border-primary"
                value={routine.name}
                onChange={(e) => updateRoutine({ ...routine, name: e.target.value })}
              />
            ) : (
              <h1 className="text-xl font-bold text-white">
                {routine.emoji} {routine.name}
              </h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{routine.exercises.length} ejercicios</span>
          <span>·</span>
          <span>~{Math.round(totalDuration)} min</span>
          <span>·</span>
          <span>Último: {lastUsedDate}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 px-4 py-3 flex gap-3 border-b border-border">
        <button
          onClick={() => startWorkout(routine.id)}
          className="flex-1 bg-primary text-black font-bold py-3 rounded-xl text-sm hover:bg-primary/90 active:scale-95 transition-transform"
        >
          ▶ Iniciar
        </button>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-colors ${
            editMode
              ? 'bg-primary/20 text-primary border-primary/40'
              : 'bg-surface text-gray-300 border-border'
          }`}
        >
          {editMode ? '✓ Listo' : '✏️ Editar'}
        </button>
      </div>

      {/* Exercise list */}
      <div className="flex-1 scroll-area px-4 py-3">
        <div className="flex flex-col gap-2">
          {routine.exercises
            .sort((a, b) => a.order - b.order)
            .map((re, idx) => {
              const ex = exercises.find((e) => e.id === re.exerciseId)
              if (!ex) return null
              const config = muscleGroupConfig[ex.muscleGroup]

              return (
                <div
                  key={re.exerciseId}
                  className="bg-card rounded-xl border border-border p-3 flex items-center gap-3"
                >
                  {editMode && (
                    <span className="text-gray-600 text-lg cursor-grab select-none">⠿</span>
                  )}

                  {/* SVG Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: config.color + '15' }}
                    dangerouslySetInnerHTML={{ __html: ex.icon.replace('viewBox', 'width="48" height="48" viewBox') }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-white text-sm truncate">{ex.nameEs}</p>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ color: config.color, backgroundColor: config.color + '20' }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {re.sets} series · {re.repsMin}–{re.repsMax} reps
                    </p>
                  </div>

                  {editMode && (
                    <button
                      onClick={() => removeExerciseFromRoutine(routine.id, re.exerciseId)}
                      className="text-red-500 hover:text-red-400 transition-colors ml-auto flex-shrink-0"
                    >
                      <span className="text-lg">×</span>
                    </button>
                  )}

                  {!editMode && (
                    <span className="text-gray-700 text-sm">{idx + 1}</span>
                  )}
                </div>
              )
            })}
        </div>

        {/* Add exercise button */}
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full mt-3 border border-dashed border-border rounded-xl py-3 text-gray-500 flex items-center justify-center gap-2 hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span>+</span>
          <span className="text-sm">Agregar ejercicio</span>
        </button>
      </div>
    </div>
  )
}
