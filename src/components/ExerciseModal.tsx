import type { Exercise } from '../types'
import { muscleGroupConfig } from '../data/muscleGroups'
import { MuscleBodyMap } from './MuscleBodyMap'

interface ExerciseModalProps {
  exercise: Exercise
  onClose: () => void
}

export function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const config = muscleGroupConfig[exercise.muscleGroup]

  return (
    <div
      className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-surface border-t border-border rounded-t-3xl p-6 w-full max-h-[85vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Exercise name */}
        <h2 className="text-2xl font-bold text-white mb-3">{exercise.nameEs}</h2>

        {/* Badges */}
        <div className="flex gap-2 mb-5">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ color: config.color, backgroundColor: config.color + '20' }}
          >
            {config.label}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/10 text-gray-300">
            {exercise.equipment}
          </span>
        </div>

        {/* Muscle map */}
        <div className="flex justify-center mb-5">
          <MuscleBodyMap muscleGroup={exercise.muscleGroup} size={120} />
        </div>

        {/* Primary muscles */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Músculos trabajados
          </h3>
          <div className="flex flex-wrap gap-2">
            {exercise.primaryMuscles.map((m) => (
              <span
                key={m}
                className="text-xs px-2.5 py-1 rounded-lg"
                style={{ color: config.color, backgroundColor: config.color + '15', border: `1px solid ${config.color}30` }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            Instrucciones
          </h3>
          <ol className="flex flex-col gap-3">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: config.color + '25', color: config.color }}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-gray-300 leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-sm border border-border text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
