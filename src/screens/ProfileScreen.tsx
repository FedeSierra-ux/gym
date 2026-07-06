import { useState } from 'react'
import { useStore } from '../store/useStore'

export function ProfileScreen() {
  const {
    userName, updateUserName,
    workouts, prs,
  } = useStore()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(userName)

  const totalWorkouts = workouts.filter((w) => w.finishedAt).length
  const totalMinutes = workouts.filter((w) => w.finishedAt).reduce((a, w) => a + (w.durationMin ?? 0), 0)

  const initials = userName.slice(0, 2).toUpperCase()

  const handleSaveName = () => {
    if (nameDraft.trim()) updateUserName(nameDraft.trim())
    setEditingName(false)
  }

  return (
    <div className="flex-1 min-h-0 scroll-area pb-4">
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">Perfil</h1>
      </div>

      {/* Avatar + Name */}
      <div className="px-4 mb-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-2xl font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  maxLength={24}
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSaveName}
                  className="text-primary text-sm font-bold px-2"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-bold text-white text-lg">{userName}</p>
                <button
                  onClick={() => { setNameDraft(userName); setEditingName(true) }}
                  className="text-gray-600 hover:text-gray-400 transition-colors text-sm"
                >
                  ✏️
                </button>
              </div>
            )}
            <p className="text-gray-500 text-xs mt-0.5">Atleta GymPro</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalWorkouts}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Entrenos</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-info">{Math.round(totalMinutes / 60)}h</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Horas totales</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gold">{prs.length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Récords</p>
          </div>
        </div>
      </div>

      {/* App info */}
      <div className="px-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="font-bold text-white text-base mb-3">Información</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Versión</span>
              <span className="text-gray-300">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ejercicios disponibles</span>
              <span className="text-gray-300">96</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
