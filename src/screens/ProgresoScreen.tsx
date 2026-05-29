import { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
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

interface ChartDataPoint {
  label: string
  kg: number
}

interface TooltipPayloadEntry {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      style={{
        background: '#111124',
        border: '1px solid rgba(0,255,136,0.2)',
        borderRadius: 8,
        padding: '6px 10px',
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, margin: 0 }}>{label}</p>
      <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: 0 }}>
        {payload[0].value} kg
      </p>
    </div>
  )
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

  return (
    <div className="flex-1 min-h-0 flex flex-col">
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

      <div className="flex-1 min-h-0 scroll-area px-4 pb-4">
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

              // Only plot months that have data
              const chartData: ChartDataPoint[] = ep.months
                .filter((m) => m.maxKg > 0)
                .map((m) => ({ label: m.label, kg: m.maxKg }))

              const firstMonthLabel = MONTH_NAMES_SHORT[new Date(workouts.find(
                (w) => w.exercises.some((e) => e.exerciseId === ep.exerciseId)
              )?.startedAt ?? Date.now()).getMonth()]

              return (
                <div key={ep.exerciseId} className="bg-card rounded-2xl border border-border p-4">
                  {/* Top row: name + current max + change badge */}
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

                  {/* Area chart */}
                  <div style={{ height: 80 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 4, right: 0, left: -32, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id={`grad-${ep.exerciseId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(0,255,136,0.2)" />
                            <stop offset="100%" stopColor="rgba(0,255,136,0)" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="0"
                          stroke="rgba(255,255,255,0.05)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                          axisLine={false}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                          axisLine={false}
                          tickLine={false}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="kg"
                          stroke="#00ff88"
                          strokeWidth={2}
                          fill={`url(#grad-${ep.exerciseId})`}
                          dot={false}
                          activeDot={{ r: 4, fill: '#00ff88', stroke: 'none' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
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
