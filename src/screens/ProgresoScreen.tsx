import { useState } from 'react'
import { useStore, useAllExercises } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { ExerciseHistorySheet } from '../components/ExerciseHistorySheet'
import type { MuscleGroup } from '../types'

type Period = '3m' | '6m' | '1a' | 'todo'
type Tab = 'fuerza' | 'volumen'

const MONTH_NAMES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const S = {
  bg: '#0C0E14', surf: '#161821', surf2: '#1C1F2A',
  ink: '#ECEEF4', dim: '#8A91A3', faint: '#3B3F4E',
  acc: '#E8634A', acc2: '#F2A93B', good: '#34D399',
  line: 'rgba(236,238,244,0.07)', line2: 'rgba(236,238,244,0.12)',
}

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

const MUSCLE_ORDER: MuscleGroup[] = ['pecho', 'espalda', 'hombros', 'biceps', 'triceps', 'piernas', 'gluteos', 'core']

function muscleVolumeBars(workouts: ReturnType<typeof useStore.getState>['workouts'], exercises: ReturnType<typeof useAllExercises>, start: number, end: number) {
  const volumeMap: Record<string, number> = {}
  for (const w of workouts) {
    if (!w.finishedAt || w.startedAt < start || w.startedAt >= end) continue
    for (const wex of w.exercises) {
      const ex = exercises.find(e => e.id === wex.exerciseId)
      if (!ex) continue
      volumeMap[ex.muscleGroup] = (volumeMap[ex.muscleGroup] ?? 0) + wex.sets.filter(s => !s.isWarmup).length
    }
  }
  return MUSCLE_ORDER
    .filter(mg => volumeMap[mg] > 0)
    .map(mg => ({ name: muscleGroupConfig[mg].label, sets: volumeMap[mg], color: muscleGroupConfig[mg].color, mg }))
    .sort((a, b) => b.sets - a.sets)
}

function MuscleVolumeBarChart({ chartData }: { chartData: ReturnType<typeof muscleVolumeBars> }) {
  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-20"><p style={{ color: S.faint, fontSize: 12 }}>Sin series registradas</p></div>
  }
  const maxSets = Math.max(...chartData.map(d => d.sets))
  return (
    <div className="flex flex-col gap-3">
      {chartData.map(item => (
        <div key={item.mg} className="flex items-center gap-3">
          <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: item.color }}>{muscleGroupConfig[item.mg].emoji} {item.name}</span>
          </div>
          <div className="flex-1 h-5 rounded-full overflow-hidden relative" style={{ background: S.surf2 }}>
            <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${(item.sets / maxSets) * 100}%`, background: item.color + 'cc', minWidth: 4, transition: 'width 0.4s ease' }}>
              {(item.sets / maxSets) > 0.35 && <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', opacity: 0.85 }}>{Math.round((item.sets / maxSets) * 100)}%</span>}
            </div>
          </div>
          <div style={{ width: 32, flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: S.ink }}>{item.sets}</span>
            <span style={{ fontSize: 9, color: S.faint }}> s</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function getWeeksInMonth(year: number, month: number): { label: string; start: number; end: number }[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const weeks: { label: string; start: number; end: number }[] = []
  let weekStart = new Date(firstDay)
  let weekNum = 1
  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + (7 - 1))
    const rangeEnd = weekEnd < lastDay ? weekEnd : lastDay
    weeks.push({
      label: `Semana ${weekNum} · ${weekStart.getDate()}-${rangeEnd.getDate()}`,
      start: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()).getTime(),
      end: new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate() + 1).getTime(),
    })
    weekStart = new Date(weekStart)
    weekStart.setDate(weekStart.getDate() + 7)
    weekNum++
  }
  return weeks
}

function MonthlyMuscleVolume() {
  const { workouts } = useStore()
  const exercises = useAllExercises()
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const today = new Date()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const monthLabel = `${MONTH_NAMES_SHORT[month]} ${year}`
  const monthStart = new Date(year, month, 1).getTime()
  const monthEnd = new Date(year, month + 1, 1).getTime()
  const weeks = getWeeksInMonth(year, month)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Mes anterior"
          style={{ width: 32, height: 32, borderRadius: 10, background: S.surf2, border: `1px solid ${S.line2}`, color: S.dim, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>‹</button>
        <span style={{ fontSize: 14, fontWeight: 700, color: S.ink, textTransform: 'capitalize' }}>{monthLabel}</span>
        <button onClick={() => { if (!isCurrentMonth) setViewDate(new Date(year, month + 1, 1)) }} disabled={isCurrentMonth} aria-label="Mes siguiente"
          style={{ width: 32, height: 32, borderRadius: 10, background: S.surf2, border: `1px solid ${S.line2}`, color: isCurrentMonth ? S.faint : S.dim, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isCurrentMonth ? 'default' : 'pointer', fontFamily: 'inherit' }}>›</button>
      </div>

      <div style={{ background: S.surf, borderRadius: 18, padding: '18px 16px', border: `1px solid ${S.line2}` }}>
        <h3 style={{ fontWeight: 700, color: S.ink, fontSize: 13 }}>Series por grupo muscular</h3>
        <p style={{ fontSize: 11, color: S.dim, marginTop: 2, marginBottom: 16 }}>Total del mes</p>
        <MuscleVolumeBarChart chartData={muscleVolumeBars(workouts, exercises, monthStart, monthEnd)} />
      </div>

      {weeks.map((w) => (
        <div key={w.label} style={{ background: S.surf, borderRadius: 18, padding: '16px 16px', border: `1px solid ${S.line2}` }}>
          <h3 style={{ fontWeight: 700, color: S.ink, fontSize: 12 }}>{w.label}</h3>
          <div style={{ marginTop: 12 }}>
            <MuscleVolumeBarChart chartData={muscleVolumeBars(workouts, exercises, w.start, w.end)} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProgresoScreen() {
  const { workouts } = useStore()
  const exercises = useAllExercises()
  const [period, setPeriod] = useState<Period>('6m')
  const [tab, setTab] = useState<Tab>('fuerza')
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const [historyExerciseId, setHistoryExerciseId] = useState<string | null>(null)

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
    const monthIdx = months.findIndex(m => m.year === wDate.getFullYear() && m.month === wDate.getMonth())
    if (monthIdx < 0) continue
    for (const wex of workout.exercises) {
      if (!exerciseProgressMap.has(wex.exerciseId)) {
        exerciseProgressMap.set(wex.exerciseId, {
          exerciseId: wex.exerciseId,
          months: months.map(m => ({ label: m.label, maxKg: 0 })),
          currentMax: 0, firstMax: 0, change: 0, changePct: 0,
        })
      }
      const ep = exerciseProgressMap.get(wex.exerciseId)!
      for (const s of wex.sets) {
        if (s.isWarmup) continue
        if (s.kg > ep.months[monthIdx].maxKg) ep.months[monthIdx].maxKg = s.kg
      }
    }
  }

  const progressList: ExerciseProgress[] = []
  for (const [, ep] of exerciseProgressMap) {
    const nonZero = ep.months.filter(m => m.maxKg > 0)
    if (nonZero.length === 0) continue
    ep.currentMax = ep.months[ep.months.length - 1].maxKg || Math.max(...ep.months.map(m => m.maxKg))
    ep.firstMax = nonZero[0].maxKg
    ep.change = ep.currentMax - ep.firstMax
    ep.changePct = ep.firstMax > 0 ? Math.round((ep.change / ep.firstMax) * 100) : 0
    progressList.push(ep)
  }
  progressList.sort((a, b) => b.changePct - a.changePct || b.change - a.change)

  const muscleGroupsWithData = [...new Set(
    progressList.map(ep => exercises.find(e => e.id === ep.exerciseId)?.muscleGroup).filter(Boolean)
  )] as string[]

  const filteredList = selectedMuscle
    ? progressList.filter(ep => exercises.find(e => e.id === ep.exerciseId)?.muscleGroup === selectedMuscle)
    : progressList

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Fixed header */}
      <div style={{ flexShrink: 0, padding: '60px 22px 0' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: S.ink }}>Progreso</div>

        {/* Tab switcher: fuerza / volumen */}
        <div style={{ display: 'flex', background: S.surf, borderRadius: 14, padding: 3, border: `1px solid ${S.line2}`, marginTop: 16 }}>
          {([['fuerza', '💪 Fuerza'], ['volumen', '📊 Volumen']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '9px 0', borderRadius: 11, border: 'none', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t ? S.surf2 : 'transparent', color: tab === t ? S.ink : S.dim, transition: 'all 0.15s ease-out' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Period filter (fuerza only) */}
        {tab === 'fuerza' && (
          <div style={{ display: 'flex', background: S.surf, borderRadius: 14, padding: 3, border: `1px solid ${S.line2}`, marginTop: 8 }}>
            {(['3m', '6m', '1a', 'todo'] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ flex: 1, padding: '9px 0', borderRadius: 11, border: 'none', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: period === p ? S.surf2 : 'transparent', color: period === p ? S.ink : S.dim, transition: 'all 0.15s ease-out' }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 scroll-area" style={{ padding: '16px 22px 24px' }}>
        {tab === 'volumen' ? (
          <MonthlyMuscleVolume />
        ) : (
          <>
            {tab === 'fuerza' && muscleGroupsWithData.length > 1 && (
              <div style={{ marginBottom: 14, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 4, msOverflowStyle: 'none', scrollbarWidth: 'none' }} className="flex gap-2">
                <button
                  onClick={() => setSelectedMuscle(null)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, flexShrink: 0,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    background: selectedMuscle === null ? S.acc : S.surf2,
                    border: `1px solid ${selectedMuscle === null ? S.acc : S.line2}`,
                    color: selectedMuscle === null ? '#fff' : S.dim,
                  }}
                >Todos</button>
                {muscleGroupsWithData.map(mg => {
                  const cfg = muscleGroupConfig[mg as keyof typeof muscleGroupConfig]
                  if (!cfg) return null
                  const isSelected = selectedMuscle === mg
                  return (
                    <button
                      key={mg}
                      onClick={() => setSelectedMuscle(isSelected ? null : mg)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, flexShrink: 0,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'DM Sans, system-ui, sans-serif',
                        background: isSelected ? cfg.color + '33' : S.surf2,
                        border: `1px solid ${isSelected ? cfg.color : S.line2}`,
                        color: isSelected ? cfg.color : S.dim,
                        display: 'inline-block',
                      }}
                    >{cfg.emoji} {cfg.label}</button>
                  )
                })}
              </div>
            )}
            {filteredList.length === 0 && progressList.length > 0 ? (
              <div className="flex items-center justify-center h-32">
                <p style={{ color: S.faint, fontSize: 13 }}>Sin datos para este grupo muscular</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <p style={{ color: S.dim, fontSize: 13 }}>No hay datos de progreso aún</p>
                  <p style={{ color: S.faint, fontSize: 11, marginTop: 4 }}>Completá algunos entrenamientos para ver tu progreso</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredList.map((ep) => {
                  const ex = exercises.find(e => e.id === ep.exerciseId)
                  if (!ex) return null
                  const bars = ep.months
                  const maxBar = Math.max(...bars.map(m => m.maxKg), 1)
                  const firstMonthLabel = bars.find(m => m.maxKg > 0)?.label ?? ''
                  const exConfig = muscleGroupConfig[ex.muscleGroup]
                  return (
                    <button key={ep.exerciseId} onClick={() => setHistoryExerciseId(ep.exerciseId)}
                      aria-label={`Ver historial de ${ex.nameEs}`}
                      style={{ background: S.surf, borderRadius: 18, padding: '18px 16px', border: `1px solid ${S.line2}`, borderLeft: `3px solid ${exConfig.color}`, textAlign: 'left', width: '100%', cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {/* Top row */}
                      <div className="flex items-start justify-between" style={{ marginBottom: 18 }}>
                        <div>
                          <div className="flex items-center gap-1.5" style={{ fontSize: 15, color: S.ink, fontWeight: 700 }}>
                            {ex.nameEs}
                            <span style={{ fontSize: 13, color: S.faint }} aria-hidden="true">›</span>
                          </div>
                          <div style={{ fontSize: 11, color: exConfig.color, fontWeight: 600, marginTop: 3 }}>{exConfig.emoji} {exConfig.label}</div>
                          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, marginTop: 8, lineHeight: 1, color: S.ink }}>
                            {ep.currentMax}
                            <span style={{ fontSize: 15, color: S.dim, fontWeight: 500, letterSpacing: 0 }}> kg</span>
                          </div>
                        </div>
                        {ep.change > 0 && (
                          <div style={{ background: 'rgba(52,211,153,0.10)', border: `1px solid rgba(52,211,153,0.22)`, borderRadius: 12, padding: '8px 12px', textAlign: 'right' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: S.good }}>↑ +{ep.change}kg</div>
                            <div style={{ fontSize: 10, color: S.good, opacity: 0.75, marginTop: 2 }}>+{ep.changePct}% desde {firstMonthLabel}</div>
                          </div>
                        )}
                        {ep.change < 0 && (
                          <div style={{ background: 'rgba(239,68,68,0.10)', border: `1px solid rgba(239,68,68,0.22)`, borderRadius: 12, padding: '8px 12px' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171' }}>↓ {ep.change}kg</div>
                          </div>
                        )}
                      </div>

                      {/* Bar chart */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
                        {bars.map((m, i) => {
                          const isLast = i === bars.length - 1
                          const h = m.maxKg > 0 ? Math.max(Math.round((m.maxKg / maxBar) * 100), 7) : 0
                          return (
                            <div key={i} style={{
                              flex: 1, height: h > 0 ? `${h}%` : 0, minHeight: h > 0 ? 4 : 0,
                              borderRadius: '4px 4px 0 0',
                              background: isLast ? S.acc : 'rgba(232,99,74,0.25)',
                              alignSelf: 'flex-end',
                              transition: 'height 0.4s ease',
                            }} />
                          )
                        })}
                      </div>
                      {/* Month labels */}
                      <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                        {bars.map((m, i) => (
                          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: S.faint }}>{m.label}</div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {historyExerciseId && (
        <ExerciseHistorySheet exerciseId={historyExerciseId} onClose={() => setHistoryExerciseId(null)} />
      )}
    </div>
  )
}
