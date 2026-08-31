import { useMemo, useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { SettingsScreen } from './SettingsScreen'

function getWeekStreak(workouts: Array<{ startedAt: number; finishedAt?: number }>) {
  const now = new Date()
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
    const end = start + 86400000
    if (workouts.some((w) => w.finishedAt && w.startedAt >= start && w.startedAt < end)) {
      streak++
    } else if (i !== 0) {
      break
    }
  }
  return streak
}

export function ProfileScreen() {
  const { userName, updateUserName, workouts, prs } = useStore()
  const allExercises = useAllExercises()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(userName)
  const [showSettings, setShowSettings] = useState(false)

  const finished = useMemo(() => workouts.filter((w) => w.finishedAt), [workouts])
  const totalWorkouts = finished.length
  const totalMinutes = finished.reduce((a, w) => a + (w.durationMin ?? 0), 0)
  const streak = useMemo(() => getWeekStreak(finished), [finished])

  const initials = userName.slice(0, 2).toUpperCase()

  const handleSaveName = () => {
    if (nameDraft.trim()) updateUserName(nameDraft.trim())
    setEditingName(false)
  }

  return (
    <div className="flex-1 min-h-0 scroll-area pb-4">
      <div className="px-4 safe-top pb-6">
        <h1 className="text-2xl font-bold text-ink">Perfil</h1>
      </div>

      {/* Avatar + Name */}
      <div className="px-4 mb-4">
        <div className="bg-card border border-border-hi rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-muted border border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-2xl font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  aria-label="Editar nombre"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  maxLength={24}
                  className="flex-1 bg-surface border border-border-hi rounded-lg px-3 py-1.5 text-ink text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSaveName}
                  aria-label="Guardar nombre"
                  className="text-primary text-sm font-bold px-2"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-bold text-ink text-lg">{userName}</p>
                <button
                  onClick={() => { setNameDraft(userName); setEditingName(true) }}
                  aria-label="Editar nombre"
                  className="text-dim hover:text-ink transition-colors text-sm"
                >
                  ✏️
                </button>
              </div>
            )}
            <p className="text-dim text-xs mt-0.5">Atleta GymPro</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border-hi rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalWorkouts}</p>
            <p className="text-[10px] text-dim mt-0.5">Entrenos</p>
          </div>
          <div className="bg-card border border-border-hi rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-info">{Math.round(totalMinutes / 60)}h</p>
            <p className="text-[10px] text-dim mt-0.5">Horas totales</p>
          </div>
          <div className="bg-card border border-border-hi rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gold">{prs.length}</p>
            <p className="text-[10px] text-dim mt-0.5">Récords</p>
          </div>
        </div>
        <div className="mt-2">
          <div className="bg-card border border-border-hi rounded-xl p-3 flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🔥</span>
            <span className="text-lg font-bold text-gold">{streak}</span>
            <span className="text-xs text-dim">días de racha</span>
          </div>
        </div>
      </div>

      {/* Ajustes */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowSettings(true)}
          className="w-full bg-card border border-border-hi rounded-2xl p-4 flex items-center gap-3"
        >
          <span className="text-xl" aria-hidden="true">⚙️</span>
          <span className="flex-1 text-left font-semibold text-ink text-sm">Ajustes</span>
          <span className="text-dim text-lg" aria-hidden="true">›</span>
        </button>
      </div>

      {/* App info */}
      <div className="px-4">
        <div className="bg-card border border-border-hi rounded-2xl p-4">
          <h2 className="font-bold text-ink text-base mb-3">Información</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dim">Versión</span>
              <span className="text-ink/80">{__APP_VERSION__}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dim">Actualizada</span>
              <span className="text-ink/80">{__BUILD_DATE__}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dim">Ejercicios disponibles</span>
              <span className="text-ink/80">{allExercises.length}</span>
            </div>
          </div>
        </div>
      </div>

      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
    </div>
  )
}
