import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import type { Workout } from '../types'

const S = {
  surf: '#161821', surf2: '#1C1F2A',
  ink: '#ECEEF4', dim: '#8A91A3', faint: '#3B3F4E',
  acc: '#E8634A',
  line2: 'rgba(236,238,244,0.12)',
}

const DAY = 86400000
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

type Range = 'semanal' | 'mensual'

/** Clave YYYY-MM-DD en hora local (no UTC: si no, los entrenos de la noche caen al día siguiente). */
function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Lunes de la semana de esa fecha, a las 00:00. */
function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dow = (d.getDay() + 6) % 7 // 0 = lunes
  d.setDate(d.getDate() - dow)
  return d
}

interface DayCell {
  ts: number
  key: string
  sets: number
  inRange: boolean
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
 * Mapa de calor de entrenos. Dos zooms: "semanal" muestra las últimas 12
 * semanas con celdas grandes (se lee día a día) y "mensual" los últimos 12
 * meses de un vistazo. En los dos casos la columna es una semana y la fila un
 * día, que es lo que hace legible el patrón semanal de entrenamiento.
 */
export function TrainingHeatmap() {
  const workouts = useStore(s => s.workouts)
  const [range, setRange] = useState<Range>('semanal')
  // Una sola referencia de "ahora" para todo el cálculo: así el render es puro
  // y no cambia la grilla a mitad de una re-renderización.
  const [nowTs] = useState(() => Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)

  // El año entero no entra en pantalla: arrancamos mostrando lo más reciente.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [range])

  const weeksToShow = range === 'semanal' ? 12 : 53
  const cellSize = range === 'semanal' ? 20 : 8
  const gap = range === 'semanal' ? 4 : 2

  const { columns, trained, totalSets, streak } = useMemo(() => {
    const byDay = setsByDay(workouts)
    const today = new Date(nowTs)
    const todayKey = dayKey(nowTs)
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime()
    const firstMonday = startOfWeek(today)
    firstMonday.setDate(firstMonday.getDate() - (weeksToShow - 1) * 7)

    const cols: DayCell[][] = []
    let trained = 0
    let totalSets = 0

    for (let w = 0; w < weeksToShow; w++) {
      const col: DayCell[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate() + w * 7 + d)
        const key = dayKey(date.getTime())
        const sets = byDay.get(key) ?? 0
        // Los días futuros de la semana en curso se dibujan vacíos.
        const inRange = date.getTime() <= endOfToday
        if (inRange && sets > 0) { trained++; totalSets += sets }
        col.push({ ts: date.getTime(), key, sets, inRange })
      }
      cols.push(col)
    }

    // Racha: días consecutivos hacia atrás desde hoy (o desde ayer si hoy no entrenó).
    let streak = 0
    const start = byDay.has(todayKey) ? 0 : 1
    for (let i = start; i < 400; i++) {
      const key = dayKey(nowTs - i * DAY)
      if ((byDay.get(key) ?? 0) > 0) streak++
      else if (i > start) break
      else if (i === start && start === 1) break
    }

    return { columns: cols, trained, totalSets, streak }
  }, [workouts, weeksToShow, nowTs])

  // Etiqueta de mes sobre la primera columna de cada mes.
  const monthLabels = columns.map((col, i) => {
    const first = new Date(col[0].ts)
    const prev = i > 0 ? new Date(columns[i - 1][0].ts) : null
    return !prev || prev.getMonth() !== first.getMonth() ? MONTHS[first.getMonth()] : ''
  })

  return (
    <div style={{ background: S.surf, borderRadius: 18, padding: '16px 16px 14px', border: `1px solid ${S.line2}` }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <h3 style={{ fontWeight: 700, color: S.ink, fontSize: 13 }}>Constancia</h3>
        <div style={{ display: 'flex', background: S.surf2, borderRadius: 10, padding: 2, border: `1px solid ${S.line2}` }}>
          {(['semanal', 'mensual'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 11, fontWeight: 600,
                background: range === r ? 'rgba(232,99,74,0.16)' : 'transparent',
                color: range === r ? S.acc : S.dim, textTransform: 'capitalize',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 11, color: S.dim, marginBottom: 12 }}>
        {trained} día{trained === 1 ? '' : 's'} · {totalSets} series en {range === 'semanal' ? 'las últimas 12 semanas' : 'el último año'}
        {streak > 1 && <span style={{ color: S.acc }}> · 🔥 {streak} seguidos</span>}
      </p>

      <div ref={scrollRef} style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, minWidth: '100%' }}>
          {/* Meses */}
          <div style={{ display: 'flex', gap, paddingLeft: cellSize + gap }}>
            {monthLabels.map((label, i) => (
              <div key={i} style={{ width: cellSize, fontSize: 9, color: S.faint, whiteSpace: 'nowrap' }}>
                {label}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap }}>
            {/* Días de la semana */}
            <div style={{ display: 'flex', flexDirection: 'column', gap, marginRight: 0 }}>
              {DAY_LABELS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: cellSize, height: cellSize, fontSize: 9, color: S.faint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    // En la vista chica sólo dejamos L/M/V para que no se amontone.
                    opacity: range === 'mensual' && i % 2 === 1 ? 0 : 1,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {columns.map((col, ci) => (
              <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap }}>
                {col.map(cell => {
                  const level = cell.inRange ? levelFor(cell.sets) : 0
                  const date = new Date(cell.ts)
                  return (
                    <div
                      key={cell.key}
                      title={`${date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}: ${cell.sets} series`}
                      style={{
                        width: cellSize, height: cellSize, borderRadius: range === 'semanal' ? 6 : 2,
                        background: LEVEL_BG[level],
                        border: level === 0 ? `1px solid ${S.line2}` : 'none',
                        opacity: cell.inRange ? 1 : 0.25,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
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
