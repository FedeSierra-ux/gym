import { useState } from 'react'
import { useStore } from '../store/useStore'

type Period = '3m' | '6m' | '1a' | 'todo'

const MONTH_NAMES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function getMonthsBack(period: Period): number {
  switch (period) {
    case '3m': return 3
    case '6m': return 6
    case '1a': return 12
    case 'todo': return 24
  }
}

interface ExerciseProgress {
  exerciseId: string
  months: { label: string; maxKg: number }[]
  currentMax: number
  firstMax: number
  change: number
  changePct: number
}

export function ProgresoScreen() {
  const { workouts, exercises } = useStore()
  const [period, setPeriod] = useState<Period>('6m')

  const monthsBack = getMonthsBack(period)
  const now = new Date()

  const months = Array.from({ length: monthsBack }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1)
    return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES_SHORT[d.getMonth()] }
  })

  const exerciseProgressMap = new Map<string, ExerciseProgress>()

  for (const workout of workouts) {
    if (!workout.finishedAt) continue
    const wDate = new Date(workout.startedAt)
    const monthIdx = months.findIndex(
      (m) => m.year === wDate.getFullYear() && m.month === wDate.getMonth()
    )
    if (monthIdx < 0) continue

    for (const wex of workout.exercises) {
      if (!exerciseProgressMap.has(wex.exerciseId)) {
        exerciseProgressMap.set(wex.exerciseId, {
          exerciseId: wex.exerciseId,
          months: months.map((m) => ({ label: m.label, maxKg: 0 })),
          currentMax: 0,
          firstMax: 0,
          change: 0,
          changePct: 0,
        })
      }
      const ep = exerciseProgressMap.get(wex.exerciseId)!
      for (const s of wex.sets) {
        if (s.kg > ep.months[monthIdx].maxKg) {
          ep.months[monthIdx].maxKg = s.kg
        }
      }
    }
  }

  const progressList: ExerciseProgress[] = []
  for (const [, ep] of exerciseProgressMap) {
    const nonZero = ep.months.filter((m) => m.maxKg > 0)
    if (nonZero.length === 0) continue
    ep.currentMax = ep.months[ep.months.length - 1].maxKg || Math.max(...ep.months.map((m) => m.maxKg))
    ep.firstMax = nonZero[0].maxKg
    ep.change = ep.currentMax - ep.firstMax
    ep.changePct = ep.firstMax > 0 ? Math.round((ep.change / ep.firstMax) * 100) : 0
    progressList.push(ep)
  }

  progressList.sort((a, b) => b.change - a.change)

  const barCount = Math.min(monthsBack, 6)
  const barsToShow = months.slice(-barCount)

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-shrink-0 px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">Progreso</h1>

        <div className="flex bg-surface rounded-xl p-1 border border-border mt-4">
          {(['3m', '6m', '1a', 'todo'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p ? 'bg-card text-white shadow' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 scroll-area px-4 pb-4">
        {progressList.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-gray-400 text-sm">No hay datos de progreso aún</p>
              <p className="text-gray-600 text-xs mt-1">Completa algunos entrenamientos para ver tu progreso</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {progressList.map((ep) => {
              const ex = exercises.find((e) => e.id === ep.exerciseId)
              if (!ex) return null

              const maxKg = Math.max(...ep.months.map((m) => m.maxKg), 1)
              const barsData = ep.months.slice(-barCount).map((m, i) => ({
                ...m,
                isLast: i === barCount - 1,
                label: barsToShow[i]?.label ?? m.label,
              }))

              const firstMonthLabel = MONTH_NAMES_SHORT[new Date(
                [...workouts]
                  .filter((w) => w.exercises.some((e) => e.exerciseId === ep.exerciseId))
                  .sort((a, b) => a.startedAt - b.startedAt)[0]?.startedAt ?? Date.now()
              ).getMonth()]

              return (
                <div key={ep.exerciseId} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white text-sm">{ex.nameEs}</h3>
                      <p className="text-2xl font-bold text-white mt-1">{ep.currentMax}kg</p>
                    </div>
                    {ep.change > 0 && (
                      <div className="bg-primary/15 border border-primary/20 rounded-lg px-2 py-1 text-right">
                        <p className="text-primary text-xs font-bold">
                          ↑ +{ep.change}kg (+{ep.changePct}%)
                        </p>
                        <p className="text-primary/60 text-[10px]">desde {firstMonthLabel}</p>
                      </div>
                    )}
                    {ep.change < 0 && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">
                        <p className="text-red-400 text-xs font-bold">
                          ↓ {ep.change}kg ({ep.changePct}%)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end gap-2 h-20">
                    {barsData.map((bar, i) => {
                      const heightPct = bar.maxKg > 0 ? (bar.maxKg / maxKg) * 100 : 3
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end" style={{ height: '64px' }}>
                            <div
                              className="w-full rounded-t-lg transition-all"
                              style={{
                                height: `${heightPct}%`,
                                backgroundColor: bar.isLast
                                  ? '#00ff88'
                                  : bar.maxKg > 0
                                  ? '#00ff8840'
                                  : '#1e1e2a',
                                minHeight: '4px',
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-gray-600">{bar.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
