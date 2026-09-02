import { useState } from 'react'
import type { Workout } from '../types'
import { dayKey, setsByDay, levelFor, LEVEL_BG } from '../utils/trainingDays'

const S = {
  ink: '#ECEEF4', dim: '#8A91A3', faint: '#3B3F4E',
  acc: '#E8634A',
  line2: 'rgba(236,238,244,0.12)',
}

/** Semana que arranca en lunes, como el calendario de acá. */
const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface DayCell {
  day: number
  key: string
  ts: number
  sets: number
  isFuture: boolean
  isToday: boolean
}

/**
 * Calendario del mes con la intensidad de cada día pintada en la celda: los
 * días de la semana van arriba en horizontal y cada fila es una semana, así se
 * lee de un vistazo a qué días se fue. Reemplaza al heatmap de columnas
 * verticales, que obligaba a girar la cabeza para entenderlo.
 */
export function MonthCalendar({
  year, month, workouts, onSelectDay, plannedDows,
}: {
  year: number
  month: number
  workouts: Workout[]
  /** Si se pasa, cada día es clickeable y devuelve su timestamp al mediodía. */
  onSelectDay?: (ts: number) => void
  /** Días de la semana (0 = lunes) con rutina planificada: se marcan a futuro. */
  plannedDows?: Set<number>
}) {
  // Una sola lectura del reloj por montaje: el render tiene que ser puro.
  const [nowTs] = useState(() => Date.now())
  const byDay = setsByDay(workouts)
  const todayKey = dayKey(nowTs)
  const now = new Date(nowTs)
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // 0 = lunes.
  const startDow = (new Date(year, month, 1).getDay() + 6) % 7

  const cells: (DayCell | null)[] = Array.from({ length: startDow }, () => null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const key = dayKey(date.getTime())
    cells.push({
      day, key, ts: date.getTime(),
      sets: byDay.get(key) ?? 0,
      isFuture: date.getTime() > endOfToday,
      isToday: key === todayKey,
    })
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (DayCell | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div>
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
              const dow = (date.getDay() + 6) % 7
              const planned = cell.isFuture && plannedDows?.has(dow)
              const etiqueta = `${date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}: ${cell.sets} series`
              return (
                <div
                  key={cell.key}
                  role={onSelectDay ? 'button' : undefined}
                  tabIndex={onSelectDay ? 0 : undefined}
                  aria-label={onSelectDay ? etiqueta : undefined}
                  title={etiqueta}
                  onClick={onSelectDay ? () => onSelectDay(new Date(year, month, cell.day, 12).getTime()) : undefined}
                  onKeyDown={onSelectDay ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectDay(new Date(year, month, cell.day, 12).getTime())
                    }
                  } : undefined}
                  style={{
                    aspectRatio: '1', borderRadius: 8, position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: LEVEL_BG[level],
                    border: cell.isToday
                      ? `1.5px solid ${S.acc}`
                      : level === 0 ? `1px solid ${S.line2}` : '1px solid transparent',
                    color: level >= 3 ? '#fff' : level > 0 ? S.ink : S.faint,
                    fontSize: 10, fontWeight: level > 0 ? 700 : 500,
                    opacity: cell.isFuture ? 0.35 : 1,
                    cursor: onSelectDay ? 'pointer' : 'default',
                  }}
                >
                  {cell.day}
                  {planned && (
                    <span style={{
                      position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2,
                      background: 'rgba(56,189,248,0.9)',
                    }} />
                  )}
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
