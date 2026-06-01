import { useState } from 'react'
import { useStore } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import type { MuscleGroup, Exercise } from '../types'
import { MuscleBodyMap } from '../components/MuscleBodyMap'
import { ExerciseModal } from '../components/ExerciseModal'

interface ExercisePickerScreenProps {
  routineName: string
}

const muscleGroupOrder: MuscleGroup[] = [
  'pecho', 'espalda', 'hombros',
  'biceps', 'triceps', 'piernas',
  'gluteos', 'core', 'cardio',
]

export function ExercisePickerScreen({ routineName }: ExercisePickerScreenProps) {
  const { exercises, activeRoutineId, routines, addExerciseToRoutine, setShowExercisePicker } = useStore()
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null)
  const [modalExercise, setModalExercise] = useState<Exercise | null>(null)

  const routine = routines.find((r) => r.id === activeRoutineId)
  const addedIds = new Set(routine?.exercises.map((e) => e.exerciseId) ?? [])

  const filtered = exercises.filter((ex) => {
    const matchGroup = !selectedGroup || ex.muscleGroup === selectedGroup
    const matchSearch = !search || ex.nameEs.toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  })

  return (
    <div className="flex-1 flex flex-col screen-enter bg-background">
      <div className="flex-shrink-0 px-4 pt-12 pb-3 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setShowExercisePicker(false)}
            className="text-gray-400 hover:text-white transition-colors text-base font-medium"
          >
            ‹ Agregar a {routineName}
          </button>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-2.5 pl-9 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        <div className="grid grid-cols-3 gap-2">
          {muscleGroupOrder.map((mg) => {
            const cfg = muscleGroupConfig[mg]
            const isSelected = selectedGroup === mg
            return (
              <button
                key={mg}
                onClick={() => setSelectedGroup(isSelected ? null : mg)}
                className="rounded-xl py-2.5 px-2 flex flex-col items-center gap-1 transition-all border"
                style={{
                  backgroundColor: isSelected ? cfg.color + '25' : '#13131c',
                  borderColor: isSelected ? cfg.color + '60' : '#1e1e2a',
                }}
              >
                <span className="text-lg leading-none">{cfg.emoji}</span>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isSelected ? cfg.color : '#6b7280' }}
                >
                  {cfg.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 scroll-area px-4 py-2">
        <div className="flex flex-col gap-2">
          {filtered.map((ex) => {
            const cfg = muscleGroupConfig[ex.muscleGroup]
            const isAdded = addedIds.has(ex.id)

            return (
              <div
                key={ex.id}
                className="bg-card rounded-xl border border-border p-3 flex items-center gap-3"
              >
                <button
                  onClick={() => setModalExercise(ex)}
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cfg.color + '15' }}
                >
                  <MuscleBodyMap muscleGroup={ex.muscleGroup} size={36} />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{ex.nameEs}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{ex.primaryMuscles.join(', ')}</span>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block"
                    style={{ color: cfg.color, backgroundColor: cfg.color + '20' }}
                  >
                    {ex.equipment}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (!isAdded && activeRoutineId) {
                      addExerciseToRoutine(activeRoutineId, ex.id)
                    }
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all font-bold text-lg ${
                    isAdded
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface text-gray-400 hover:bg-primary hover:text-black'
                  }`}
                >
                  {isAdded ? '✓' : '+'}
                </button>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No se encontraron ejercicios</p>
            </div>
          )}
        </div>
      </div>
      {modalExercise && (
        <ExerciseModal exercise={modalExercise} onClose={() => setModalExercise(null)} />
      )}
    </div>
  )
}
