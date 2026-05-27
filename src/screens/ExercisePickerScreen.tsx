import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { ExerciseDetailSheet } from '../components/ExerciseDetailSheet'
import type { MuscleGroup, Exercise } from '../types'

interface Props {
  routineName: string
}

const muscleGroupOrder: MuscleGroup[] = [
  'pecho', 'espalda', 'hombros',
  'biceps', 'triceps', 'piernas',
  'gluteos', 'core', 'cardio',
]

export function ExercisePickerScreen({ routineName }: Props) {
  const { exercises, activeRoutineId, routines, addExerciseToRoutine, setShowExercisePicker } = useStore()
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)
  const [mode, setMode] = useState<'browse' | 'search'>('browse')

  const routine = routines.find((r) => r.id === activeRoutineId)
  const addedIds = new Set(routine?.exercises.map((e) => e.exerciseId) ?? [])

  const handleAdd = useCallback((exerciseId: string) => {
    if (activeRoutineId && !addedIds.has(exerciseId)) {
      addExerciseToRoutine(activeRoutineId, exerciseId)
    }
  }, [activeRoutineId, addedIds, addExerciseToRoutine])

  // Search mode: filter by query (and optionally group)
  const searchFiltered = mode === 'search' ? exercises.filter((ex) => {
    const matchGroup = !selectedGroup || ex.muscleGroup === selectedGroup
    const matchSearch = !search || ex.nameEs.toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  }) : []

  // Browse mode: group by muscle
  const groupedExercises = mode === 'browse'
    ? muscleGroupOrder
        .filter(mg => !selectedGroup || mg === selectedGroup)
        .map(mg => ({
          group: mg,
          config: muscleGroupConfig[mg],
          exercises: exercises.filter(ex => ex.muscleGroup === mg),
        }))
    : []

  return (
    <div className="flex-1 flex flex-col screen-enter" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-12 pb-3 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setShowExercisePicker(false)}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none font-light"
          >
            ‹
          </button>
          <div>
            <h1 className="text-base font-bold text-white">Elegir ejercicio</h1>
            <p className="text-xs text-gray-500">{routineName}</p>
          </div>
          <div className="ml-auto flex bg-surface rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setMode('browse')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'browse' ? 'bg-primary/20 text-primary' : 'text-gray-500'}`}
            >
              Grupos
            </button>
            <button
              onClick={() => { setMode('search') }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'search' ? 'bg-primary/20 text-primary' : 'text-gray-500'}`}
            >
              Buscar
            </button>
          </div>
        </div>

        {mode === 'search' && (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-surface border border-border rounded-xl py-2.5 pl-9 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary text-sm"
            />
          </div>
        )}
      </div>

      {/* Group filter pills — show in both modes */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedGroup(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !selectedGroup ? 'bg-primary/20 text-primary border-primary/40' : 'bg-surface text-gray-500 border-border'
            }`}
          >
            Todos
          </button>
          {muscleGroupOrder.map((mg) => {
            const cfg = muscleGroupConfig[mg]
            const isSelected = selectedGroup === mg
            return (
              <button
                key={mg}
                onClick={() => setSelectedGroup(isSelected ? null : mg)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={{
                  backgroundColor: isSelected ? cfg.color + '25' : '#13131c',
                  borderColor: isSelected ? cfg.color + '60' : '#1e1e2a',
                  color: isSelected ? cfg.color : '#6b7280',
                }}
              >
                {cfg.emoji} {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 scroll-area px-4 py-3">
        {mode === 'search' ? (
          <div className="flex flex-col gap-2">
            {searchFiltered.map(ex => (
              <ExerciseRow
                key={ex.id}
                exercise={ex}
                isAdded={addedIds.has(ex.id)}
                onAdd={() => handleAdd(ex.id)}
                onDetail={() => setDetailExercise(ex)}
              />
            ))}
            {searchFiltered.length === 0 && search && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Sin resultados para "{search}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedExercises.map(({ group, config, exercises: exs }) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{config.emoji}</span>
                  <h3 className="font-bold text-sm text-white">{config.label}</h3>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ color: config.color, backgroundColor: config.color + '15' }}
                  >
                    {exs.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {exs.map(ex => (
                    <ExerciseRow
                      key={ex.id}
                      exercise={ex}
                      isAdded={addedIds.has(ex.id)}
                      onAdd={() => handleAdd(ex.id)}
                      onDetail={() => setDetailExercise(ex)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail sheet */}
      {detailExercise && (
        <ExerciseDetailSheet
          exercise={detailExercise}
          onClose={() => setDetailExercise(null)}
          actionLabel="Agregar a rutina"
          onAction={() => {
            handleAdd(detailExercise.id)
            setDetailExercise(null)
          }}
          actionDisabled={addedIds.has(detailExercise.id)}
        />
      )}
    </div>
  )
}

function ExerciseRow({
  exercise,
  isAdded,
  onAdd,
  onDetail,
}: {
  exercise: Exercise
  isAdded: boolean
  onAdd: () => void
  onDetail: () => void
}) {
  const cfg = muscleGroupConfig[exercise.muscleGroup]
  return (
    <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
      {/* Tapping icon/name → detail */}
      <button
        onClick={onDetail}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: cfg.color + '18' }}
          dangerouslySetInnerHTML={{ __html: exercise.icon.replace('viewBox', 'width="44" height="44" viewBox') }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{exercise.nameEs}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{exercise.primaryMuscles.join(', ')}</p>
        </div>
      </button>

      {/* Add button */}
      <button
        onClick={onAdd}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all font-bold text-lg ${
          isAdded
            ? 'bg-primary/20 text-primary'
            : 'bg-surface text-gray-400 hover:bg-primary hover:text-black border border-border'
        }`}
      >
        {isAdded ? '✓' : '+'}
      </button>
    </div>
  )
}
