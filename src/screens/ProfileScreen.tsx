import { useState } from 'react'
import { useStore } from '../store/useStore'

interface BodyWeightEntry {
  date: number
  kg: number
}

function WeightChart({ entries }: { entries: BodyWeightEntry[] }) {
  if (entries.length < 2) return null
  const w = 300
  const h = 80
  const pad = 16
  const maxKg = Math.max(...entries.map((e) => e.kg))
  const minKg = Math.min(...entries.map((e) => e.kg))
  const range = maxKg - minKg || 1

  const pts = entries.slice(-30).map((e, i, arr) => ({
    x: pad + (i / (arr.length - 1)) * (w - pad * 2),
    y: h - pad - ((e.kg - minKg) / range) * (h - pad * 2),
  }))

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${h} L ${pts[0].x.toFixed(1)} ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="overflow-visible">
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#wgrad)" />
      <path d={pathD} fill="none" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.length <= 10 && pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00ff88" />
      ))}
    </svg>
  )
}

export function ProfileScreen() {
  const {
    userName, updateUserName,
    workouts, prs,
  } = useStore()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(userName)
  const [weightInput, setWeightInput] = useState('')
  const [bodyWeights] = useState<BodyWeightEntry[]>([])
  const [showAllWeights, setShowAllWeights] = useState(false)

  const totalWorkouts = workouts.filter((w) => w.finishedAt).length
  const totalMinutes = workouts.filter((w) => w.finishedAt).reduce((a, w) => a + (w.durationMin ?? 0), 0)
  const latestWeight = bodyWeights.length > 0 ? bodyWeights[bodyWeights.length - 1] : null
  const prevWeight = bodyWeights.length > 1 ? bodyWeights[bodyWeights.length - 2] : null
  const weightDiff = latestWeight && prevWeight ? latestWeight.kg - prevWeight.kg : null

  const initials = userName.slice(0, 2).toUpperCase()

  const handleSaveName = () => {
    if (nameDraft.trim()) updateUserName(nameDraft.trim())
    setEditingName(false)
  }

  const handleAddWeight = () => {
    const kg = parseFloat(weightInput)
    if (!isNaN(kg) && kg > 0 && kg < 500) {
      setWeightInput('')
    }
  }

  const displayWeights = showAllWeights ? [...bodyWeights].reverse() : [...bodyWeights].reverse().slice(0, 5)

  return (
    <div className="flex-1 scroll-area pb-4">
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

      {/* Body weight */}
      <div className="px-4 mb-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white text-base">Peso corporal</h2>
            {latestWeight && (
              <div className="text-right">
                <span className="text-primary font-bold text-lg">{latestWeight.kg} kg</span>
                {weightDiff !== null && (
                  <span className={`text-xs ml-2 font-medium ${weightDiff > 0 ? 'text-red-400' : weightDiff < 0 ? 'text-primary' : 'text-gray-500'}`}>
                    {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>

          {bodyWeights.length >= 2 && (
            <div className="mb-4 bg-surface rounded-xl p-2">
              <WeightChart entries={bodyWeights} />
            </div>
          )}

          {/* Add new measurement */}
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWeight()}
              placeholder="kg de hoy..."
              step="0.1"
              className="flex-1 bg-surface border border-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleAddWeight}
              className="bg-primary text-black font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90 active:scale-95 transition-transform"
            >
              + Log
            </button>
          </div>

          {/* Weight history */}
          {bodyWeights.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-2">Sin registros aún. ¡Ingresá tu peso!</p>
          ) : (
            <div className="flex flex-col gap-1">
              {displayWeights.map((bw) => (
                <div key={bw.date} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-gray-400 text-xs">
                    {new Date(bw.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-semibold">{bw.kg} kg</span>
                  </div>
                </div>
              ))}
              {bodyWeights.length > 5 && (
                <button
                  onClick={() => setShowAllWeights(!showAllWeights)}
                  className="text-xs text-gray-500 hover:text-primary transition-colors text-center pt-1"
                >
                  {showAllWeights ? 'Ver menos' : `Ver ${bodyWeights.length - 5} más...`}
                </button>
              )}
            </div>
          )}
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
