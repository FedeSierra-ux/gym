import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import type { Workout } from '../types'

const S = {
  surf: '#161821', surf2: '#1C1F2A',
  ink: '#ECEEF4', dim: '#8A91A3', faint: '#3B3F4E',
  acc: '#E8634A',
  line2: 'rgba(236,238,244,0.12)',
}

const DAY = 86400000
/** Semana que arranca en lunes, como el calendario de acá. */
const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Clave YYYY-MM-DD en hora local (no UTC: si no, los entrenos de la noche caen al día siguiente). */
function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface DayCell {
  day: number
  key: string
  ts: number
  sets: number
  isFuture: boolean
  isToday: boolean
}

/** Series efectivas (sin calentamiento) por día. */
function setsByDay(workouts: Workout[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const w of workouts) {
    if (!w.finishedAt) continue
    const key = dayKey(w.startedAt)
    const sets = w.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter(s => !s.isWarmup).length,
      0
    )
    map.set(key, (map.get(key) ?? 0) + sets)
  }
  return map
}

function levelFor(sets: number): 0 | 1 | 2 | 3 | 4 {
  if (sets <= 0) return 0
  if (sets <= 8) return 1
  if (sets <= 15) return 2
  if (sets <= 24) return 3
  return 4
}

const LEVEL_BG = [
  S.surf2,
  'rgba(232,99,74,0.38)',
  'rgba(232,99,74,0.45)',
  'rgba(232,99,74,0.70)',
  '#E8634A',
]

/**
 * Constancia mes a mes, con forma de calendario: los días de la semana van
 * arriba en horizontal y cada fila es una semana, así se lee de un vistazo a
 * qué días se fue. Se puede navegar a los meses anteriores.
 */
export function TrainingHeatmap() {
  const workouts = useStore(s => s.workouts)
  // Una sola referencia de "ahora" para todo el cálculo: así el render es puro.
  const [nowTs] = useState(() => Date.now())
  const today = new Date(nowTs)
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const { weeks, trained, totalSets, streak, daysCounted } = useMemo(() => {
    const byDay = setsByDay(workouts)
    const todayKey = dayKey(nowTs)
    const now = new Date(nowTs)
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // 0 = lunes.
    const startDow = (new Date(year, month, 1).getDay() + 6) % 7

    const cells: (DayCell | null)[] = Array.from({ length: startDow }, () => null)
    let trained = 0
    let totalSets = 0
    let daysCounted = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const key = dayKey(date.getTime())
      const sets = byDay.get(key) ?? 0
      const isFuture = date.getTime() > endOfToday
      if (!isFuture) daysCounted++
      if (!isFuture && sets > 0) { trained++; totalSets += sets }
      cells.push({ day, key, ts: date.getTime(), sets, isFuture, isToday: key === todayKey })
    }
    while (cells.length % 7 !== 0) cells.push(null)

    const weeks: (DayCell | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

    // Racha: días consecutivos hacia atrás desde hoy (o desde ayer si hoy no entrenó).
    let streak = 0
    const start = byDay.has(todayKey) ? 0 : 1
    for (let i = start; i < 400; i++) {
      const key = dayKey(nowTs - i * DAY)
      if ((byDay.get(key) ?? 0) > 0) streak++
      else if (i > start) break
      else if (i === start && start === 1) break
    }

    return { weeks, trained, totalSets, streak, daysCounted }
  }, [workouts, nowTs, year, month])

  const attendance = daysCounted > 0 ? Math.round((trained / daysCounted) * 100) : 0

  return (
    <div style={{ background: S.surf, borderRadius: 18, padding: '16px 16px 14px', border: `1px solid ${S.line2}` }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <h3 style={{ fontWeight: 700, color: S.ink, fontSize: 13 }}>Constancia</h3>
        <div className="flex items-center" style={{ gap: 6 }}>
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            aria-label="Mes anterior"
            style={{
              width: 28, height: 28, borderRadius: 9, background: S.surf2, border: `1px solid ${S.line2}`,
              color: S.dim, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >‹</button>
          <span style={{ fontSize: 12, fontWeight: 700, color: S.ink, minWidth: 96, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => { if (!isCurrentMonth) setViewDate(new Date(year, month + 1, 1)) }}
            disabled={isCurrentMonth}
            aria-label="Mes siguiente"
            style={{
              width: 28, height: 28, borderRadius: 9, background: S.surf2, border: `1px solid ${S.line2}`,
              color: isCurrentMonth ? S.faint : S.dim, fontSize: 15, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: isCurrentMonth ? 'default' : 'pointer', fontFamily: 'inherit',
            }}
          >›</button>
        </div>
      </div>

      <p style={{ fontSize: 11, color: S.dim, marginBottom: 12 }}>
        {trained} día{trained === 1 ? '' : 's'} · {totalSets} series · {attendance}% de asistencia
        {streak > 1 && <span style={{ color: S.acc }}> · 🔥 {streak} seguidos</span>}
      </p>

      {/* Días de la semana, en horizontal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ fontSize: 9, color: S.faint, textAlign: 'center', fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      {/* Una fila por semana */}
      <div className="flex flex-col" style={{ gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {week.map((cell, ci) => {
              if (!cell) return <div key={`e-${ci}`} style={{ aspectRatio: '1' }} />
              const level = cell.isFuture ? 0 : levelFor(cell.sets)
              const date = new Date(cell.ts)
              return (
                <div
                  key={cell.key}
                  title={`${date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}: ${cell.sets} series`}
                  style={{
                    aspectRatio: '1', borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: LEVEL_BG[level],
                    border: cell.isToday
                      ? `1.5px solid ${S.acc}`
                      : level === 0 ? `1px solid ${S.line2}` : '1px solid transparent',
                    color: level >= 3 ? '#fff' : level > 0 ? S.ink : S.faint,
                    fontSize: 10, fontWeight: level > 0 ? 700 : 500,
                    opacity: cell.isFuture ? 0.35 : 1,
                  }}
                >
                  {cell.day}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-end gap-1.5" style={{ marginTop: 10 }}>
        <span style={{ fontSize: 9, color: S.faint }}>Menos</span>
        {LEVEL_BG.map((bg, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: i === 0 ? `1px solid ${S.line2}` : 'none' }} />
        ))}
        <span style={{ fontSize: 9, color: S.faint }}>Más</span>
      </div>
    </div>
  )
}
