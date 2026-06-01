import { useState } from 'react'
import { useStore } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { MuscleBodyMap } from '../components/MuscleBodyMap'
import type { MuscleGroup, Exercise } from '../types'

const muscleGroups: MuscleGroup[] = [
  'pecho', 'espalda', 'hombros', 'biceps',
  'triceps', 'piernas', 'gluteos', 'core', 'cardio',
]

interface Props {
  onClose: () => void
}

export function CustomExercisesScreen({ onClose }: Props) {
  const { customExercises, addCustomExercise, deleteCustomExercise } = useStore()

  const [showForm, setShowForm] = useState(false)
  const [nameEs, setNameEs] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('pecho')
  const [equipment, setEquipment] = useState('')

  const handleCreate = () => {
    const trimmed = nameEs.trim()
    if (!trimmed) return
    const ex: Exercise = {
      id: `custom-${Date.now()}`,
      nameEs: trimmed,
      muscleGroup,
      primaryMuscles: [muscleGroupConfig[muscleGroup].label],
      equipment: equipment.trim() || 'Libre',
      equipmentType: 'mancuernas',
    }
    addCustomExercise(ex)
    setNameEs('')
    setEquipment('')
    setMuscleGroup('pecho')
    setShowForm(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg)' }}>
      <div
        className="flex-shrink-0 px-4 pt-12 pb-4"
        style={{
          background: 'linear-gradient(180deg, #0d0d1c 0%, #06060f 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Volver"
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
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
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white">Mis ejercicios</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{customExercises.length} ejercicios personalizados</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-black btn-primary-glow"
          >
            + Nuevo
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {customExercises.length === 0 && !showForm && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ border: '1.5px dashed rgba(0,255,136,0.2)', background: 'rgba(0,255,136,0.03)' }}
          >
            <div className="text-3xl mb-2">🏋️</div>
            <p className="text-white font-semibold text-sm mb-1">Sin ejercicios personalizados</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Creá ejercicios propios y agregálos a tus rutinas</p>
          </div>
        )}

        {customExercises.map((ex) => {
          const config = muscleGroupConfig[ex.muscleGroup]
          return (
            <div
              key={ex.id}
              className="rounded-2xl p-3 flex items-center gap-3"
              style={{
                background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 4px 16px rgba(0,0,0,0.35)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: config.color + '15', border: `1px solid ${config.color}25` }}
              >
                <MuscleBodyMap muscleGroup={ex.muscleGroup} size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{ex.nameEs}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ color: config.color, backgroundColor: config.color + '18' }}
                  >
                    {config.label}
                  </span>
                  {ex.equipment && (
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{ex.equipment}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteCustomExercise(ex.id)}
                aria-label={`Eliminar ${ex.nameEs}`}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: 'rgba(239,68,68,0.7)',
                  fontSize: '16px',
                }}
              >
                ×
              </button>
            </div>
          )
        })}

        {showForm && (
          <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background: 'linear-gradient(160deg, #111124 0%, #0d0d1c 100%)',
              border: '1px solid rgba(0,255,136,0.2)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            <h3 className="text-white font-bold text-sm">Nuevo ejercicio</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Nombre</label>
              <input
                autoFocus
                type="text"
                placeholder="Ej: Press de suelo"
                value={nameEs}
                onChange={(e) => setNameEs(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Grupo muscular</label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                className="w-full rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {muscleGroups.map((mg) => (
                  <option key={mg} value={mg} style={{ background: '#0d0d1c' }}>
                    {muscleGroupConfig[mg].emoji} {muscleGroupConfig[mg].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Equipamiento (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Barra, Mancuernas, Polea..."
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => { setShowForm(false); setNameEs(''); setEquipment('') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!nameEs.trim()}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black btn-primary-glow disabled:opacity-40"
              >
                Crear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
