import { useState } from 'react'
import type { Routine, Workout } from '../types'
import { dayKey, setsByDay, routineByDay, routineColor } from '../utils/trainingDays'
import { S } from '../theme'

/** Semana que arranca en lunes, como el calendario de acá. */
const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface DayCell {
  day: number
  key: string
  ts: number
  sets: number
  routineId?: string
  isFuture: boolean
  isToday: boolean
}

/**
 * Calendario del mes con cada día entrenado pintado del color de su rutina: los
 * días de la semana van arriba en horizontal y cada fila es una semana, así se
 * lee de un vistazo qué días se fue y si se están alternando bien las rutinas.
 */
export function MonthCalendar({
  year, month, workouts, routines, onSelectDay, plannedDows,
}: {
  year: number
  month: number
  workouts: Workout[]
  /** Para el color y la leyenda: el orden de la lista fija el color de cada rutina. */
  routines: Routine[]
  /** Si se pasa, cada día es clickeable y devuelve su timestamp al mediodía. */
  onSelectDay?: (ts: number) => void
  /** Días de la semana (0 = lunes) con rutina planificada: se marcan a futuro. */
  plannedDows?: Set<number>
}) {
  // Una sola lectura del reloj por montaje: el render tiene que ser puro.
  const [nowTs] = useState(() => Date.now())
  const byDay = setsByDay(workouts)
  const rutinaDelDia = routineByDay(workouts)
  const routineIds = routines.map((r) => r.id)
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
      routineId: rutinaDelDia.get(key),
      isFuture: date.getTime() > endOfToday,
      isToday: key === todayKey,
    })
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (DayCell | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  // Sólo las rutinas que aparecen este mes entran en la leyenda.
  const rutinasDelMes = routines.filter((r) =>
    cells.some((c) => c && !c.isFuture && c.routineId === r.id)
  )
  const hayBorradas = cells.some((c) => c?.routineId && !routineIds.includes(c.routineId))

  return (
    <div>
      {/* Días de la semana, en horizontal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ fontSize: 11, color: S.faint, textAlign: 'center', fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      {/* Una fila por semana */}
      <div className="flex flex-col" style={{ gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {week.map((cell, ci) => {
              if (!cell) return <div key={`e-${ci}`} style={{ aspectRatio: '1' }} />
              const entrenado = !cell.isFuture && cell.sets > 0
              const color = entrenado && cell.routineId ? routineColor(cell.routineId, routineIds) : null
              const date = new Date(cell.ts)
              const dow = (date.getDay() + 6) % 7
              const planned = cell.isFuture && plannedDows?.has(dow)
              const nombreRutina = cell.routineId
                ? routines.find((r) => r.id === cell.routineId)?.name ?? 'rutina eliminada'
                : null
              const etiqueta = `${date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}: ${
                entrenado ? `${nombreRutina}, ${cell.sets} series` : 'sin entrenar'
              }`
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
                    background: color ?? S.surf2,
                    border: cell.isToday
                      ? `1.5px solid ${S.acc}`
                      : entrenado ? '1px solid transparent' : `1px solid ${S.line2}`,
                    color: entrenado ? '#0C0E14' : S.faint,
                    fontSize: 11, fontWeight: entrenado ? 700 : 500,
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

      {/* Leyenda: qué rutina es cada color */}
      {(rutinasDelMes.length > 0 || hayBorradas) && (
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5" style={{ marginTop: 12 }}>
          {rutinasDelMes.map((r) => (
            <span key={r.id} className="flex items-center gap-1.5" style={{ fontSize: 11, color: S.dim }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: routineColor(r.id, routineIds), flexShrink: 0 }} />
              {r.name}
            </span>
          ))}
          {hayBorradas && (
            <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: S.dim }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: '#6B7280', flexShrink: 0 }} />
              Rutina eliminada
            </span>
          )}
        </div>
      )}
    </div>
  )
}
