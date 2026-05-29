import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { ExerciseDetailSheet } from '../components/ExerciseDetailSheet'
import { ExerciseThumbnail } from '../components/ExerciseThumbnail'
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
    const q = search.toLowerCase()
    const matchSearch = !search
      || ex.nameEs.toLowerCase().includes(q)
      || (ex.nameArg ?? '').toLowerCase().includes(q)
      || (ex.nameEn ?? '').toLowerCase().includes(q)
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
    <div className="flex-1 min-h-0 flex flex-col screen-enter" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 pt-12 pb-3 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0d0d1c 0%, #06060f 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setShowExercisePicker(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-white">Elegir ejercicio</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{routineName}</p>
          </div>
          <div
            className="ml-auto flex rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
          >
            <button
              onClick={() => setMode('browse')}
              className="px-3 py-1.5 text-xs font-semibold transition-colors"
              style={mode === 'browse' ? {
                background: 'rgba(0,255,136,0.15)',
                color: 'var(--primary)',
              } : { color: 'rgba(255,255,255,0.3)' }}
            >
              Grupos
            </button>
            <button
              onClick={() => { setMode('search') }}
              className="px-3 py-1.5 text-xs font-semibold transition-colors"
              style={mode === 'search' ? {
                background: 'rgba(0,255,136,0.15)',
                color: 'var(--primary)',
              } : { color: 'rgba(255,255,255,0.3)' }}
            >
              Buscar
            </button>
          </div>
        </div>

        {mode === 'search' && (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>
        )}
      </div>

      {/* Group filter pills — show in both modes */}
      <div className="flex-shrink-0 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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

      <div className="flex-1 min-h-0 scroll-area px-4 py-3 pb-6">
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
  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition-all"
      style={{
        background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Tapping icon/name → detail */}
      <button
        onClick={onDetail}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <ExerciseThumbnail exercise={exercise} size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{exercise.nameEs}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{exercise.primaryMuscles.join(', ')}</p>
        </div>
      </button>

      {/* Add button */}
      <button
        onClick={onAdd}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all font-bold text-lg"
        style={isAdded ? {
          background: 'rgba(0,255,136,0.15)',
          color: 'var(--primary)',
          border: '1px solid rgba(0,255,136,0.3)',
        } : {
          background: 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {isAdded ? '✓' : '+'}
      </button>
    </div>
  )
}
