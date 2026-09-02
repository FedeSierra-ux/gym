import { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { muscleGroupConfig } from '../data/muscleGroups'
import { CustomExercisesScreen } from './CustomExercisesScreen'
import { vibrate } from '../utils/haptics'
import type { MuscleGroup, Routine } from '../types'

/**
 * Detecta el "mantener apretado" sobre una tarjeta. Se usa pointer events para
 * que funcione igual con dedo y con mouse, y se cancela si el dedo se mueve
 * (si no, arrastrar para scrollear abriría el menú).
 */
function useLongPress(onLongPress: () => void, ms = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const disparado = useRef(false)
  const origen = useRef<{ x: number; y: number } | null>(null)

  const cancelar = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    origen.current = null
  }

  return {
    /** true si el último gesto fue un long-press: sirve para no abrir la rutina. */
    consumioElTap: () => {
      const valor = disparado.current
      disparado.current = false
      return valor
    },
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        disparado.current = false
        origen.current = { x: e.clientX, y: e.clientY }
        timer.current = setTimeout(() => {
          disparado.current = true
          vibrate(30)
          onLongPress()
        }, ms)
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (!origen.current) return
        const dx = Math.abs(e.clientX - origen.current.x)
        const dy = Math.abs(e.clientY - origen.current.y)
        if (dx > 10 || dy > 10) cancelar()
      },
      onPointerUp: cancelar,
      onPointerLeave: cancelar,
      onPointerCancel: cancelar,
      onContextMenu: (e: React.MouseEvent) => {
        // En el celular el menú nativo de "copiar/seleccionar" tapa el nuestro.
        e.preventDefault()
      },
    },
  }
}

function RoutineCard({ routine, children, onOpen, onLongPress }: {
  routine: Routine
  children: React.ReactNode
  onOpen: () => void
  onLongPress: () => void
}) {
  const { consumioElTap, handlers } = useLongPress(onLongPress)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => { if (!consumioElTap()) onOpen() }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
      aria-label={`${routine.name}. Mantené apretado para más opciones`}
      {...handlers}
      style={{
        WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </div>
  )
}

function getRoutineMuscleGroups(exerciseIds: string[], exercises: { id: string; muscleGroup: MuscleGroup }[]) {
  const groups = new Set<MuscleGroup>()
  for (const id of exerciseIds) {
    const ex = exercises.find((e) => e.id === id)
    if (ex) groups.add(ex.muscleGroup)
  }
  return Array.from(groups).slice(0, 4)
}

function getApproxDuration(sets: number[]) {
  return Math.round(sets.reduce((a, s) => a + s * 2.5, 0))
}

export function RutinasScreen() {
  const { routines, exercises, workouts, customExercises, setActiveRoutineId, addRoutine, deleteRoutine, addToast } = useStore()
  const [showCustomExercises, setShowCustomExercises] = useState(false)
  const [menuRoutine, setMenuRoutine] = useState<Routine | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Routine | null>(null)

  const allExercises = [...exercises, ...customExercises]
  const sortedWorkouts = [...workouts]
    .filter((w) => w.finishedAt)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  const lastRoutineId = sortedWorkouts[0]?.routineId

  const handleCreateRoutine = () => {
    const id = `routine-${Date.now()}`
    addRoutine({
      id,
      name: 'Nueva Rutina',
      emoji: '💪',
      exercises: [],
      createdAt: Date.now(),
    })
    setActiveRoutineId(id)
  }

  if (showCustomExercises) {
    return <CustomExercisesScreen onClose={() => setShowCustomExercises(false)} />
  }

  return (
    <div className="flex-1 min-h-0 scroll-area" style={{ paddingBottom: 16 }}>

      {/* Header */}
      <div style={{ paddingTop: 'max(60px, calc(env(safe-area-inset-top, 0px) + 22px))', paddingLeft: 22, paddingRight: 22 }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: '#ECEEF4' }}>Mis Rutinas</div>
        <div style={{ fontSize: 13, color: '#8A91A3', marginTop: 4 }}>
          {routines.length} rutinas guardadas · mantené apretada una para más opciones
        </div>
      </div>

      {/* Routine cards */}
      <div style={{ padding: '20px 22px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {routines.map((routine) => {
          const muscleGroups = getRoutineMuscleGroups(
            routine.exercises.map((e) => e.exerciseId),
            allExercises
          )
          const totalSets = routine.exercises.map((e) => e.sets)
          const duration = getApproxDuration(totalSets)
          const isLast = routine.id === lastRoutineId
          const primaryColor = muscleGroups[0] ? muscleGroupConfig[muscleGroups[0]].color : '#E8634A'

          return (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onOpen={() => setActiveRoutineId(routine.id)}
              onLongPress={() => setMenuRoutine(routine)}
            >
              <div style={{
                background: '#161821', borderRadius: 18, padding: 16, textAlign: 'left', width: '100%',
                border: `1px solid ${isLast ? 'rgba(232,99,74,0.22)' : 'rgba(236,238,244,0.12)'}`,
                borderLeft: `3px solid ${primaryColor}`,
                transition: 'all 0.15s',
                fontFamily: 'DM Sans, system-ui, sans-serif',
              }}>
              <div className="flex items-start gap-3">
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  background: primaryColor + '20',
                  border: `1px solid ${primaryColor}40`,
                }}>
                  {routine.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#ECEEF4' }}>{routine.name}</span>
                    {isLast && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#E8634A',
                        background: 'rgba(232,99,74,0.15)', padding: '2px 7px', borderRadius: 6, flexShrink: 0,
                      }}>
                        ÚLTIMO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#8A91A3', marginTop: 3 }}>
                    {routine.exercises.length} ejercicios · ~{duration} min
                  </div>
                </div>
                <div style={{ color: '#3B3F4E', fontSize: 20, alignSelf: 'center', lineHeight: 1 }}>›</div>
              </div>

              {muscleGroups.length > 0 && (
                <div className="flex flex-wrap gap-[6px]" style={{ marginTop: 12 }}>
                  {muscleGroups.map(mg => {
                    const cfg = muscleGroupConfig[mg]
                    return (
                      <span key={mg} style={{
                        fontSize: 11, fontWeight: 600, color: cfg.color,
                        background: cfg.color + '22', padding: '4px 10px', borderRadius: 20,
                      }}>
                        {cfg.emoji} {cfg.label}
                      </span>
                    )
                  })}
                </div>
              )}
              </div>
            </RoutineCard>
          )
        })}
      </div>

      {/* Create button */}
      <div style={{ padding: '14px 22px 0' }}>
        <button
          onClick={handleCreateRoutine}
          style={{
            width: '100%', border: '1px solid rgba(232,99,74,0.25)', borderRadius: 18,
            background: 'rgba(232,99,74,0.07)', color: '#E8634A',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 14, fontWeight: 700, padding: '16px 0', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 700 }}>+</span> Crear nueva rutina
        </button>
      </div>

      {/* Custom exercises */}
      <div style={{ padding: '10px 22px 0' }}>
        <button
          onClick={() => setShowCustomExercises(true)}
          style={{
            width: '100%', borderRadius: 18, padding: '14px 0',
            border: '1px solid rgba(236,238,244,0.12)',
            background: '#161821',
            color: '#8A91A3',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>💪</span> Mis ejercicios
          {customExercises.length > 0 && (
            <span style={{
              fontSize: 10, padding: '2px 6px', borderRadius: 20, fontWeight: 700,
              background: 'rgba(236,238,244,0.08)', color: '#ECEEF4',
            }}>
              {customExercises.length}
            </span>
          )}
        </button>
      </div>

      {/* Menú de la rutina (mantener apretado) */}
      {menuRoutine && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setMenuRoutine(null)}>
          <div
            className="w-full rounded-t-3xl px-4 pt-4 pb-8 sheet-enter"
            style={{ background: '#161821', borderTop: '1px solid rgba(236,238,244,0.12)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: '#1C1F2A', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#ECEEF4', marginBottom: 2 }}>
              {menuRoutine.emoji} {menuRoutine.name}
            </p>
            <p style={{ fontSize: 12, color: '#8A91A3', marginBottom: 16 }}>
              {menuRoutine.exercises.length} ejercicios
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { const r = menuRoutine; setMenuRoutine(null); setActiveRoutineId(r.id) }}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 14,
                  background: '#1C1F2A', border: '1px solid rgba(236,238,244,0.12)',
                  color: '#ECEEF4', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                }}
              >
                ✏️  Editar rutina
              </button>
              <button
                onClick={() => { const r = menuRoutine; setMenuRoutine(null); setConfirmDelete(r) }}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 14,
                  background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.28)',
                  color: '#f87171', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                }}
              >
                🗑  Eliminar rutina
              </button>
              <button
                onClick={() => setMenuRoutine(null)}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 14, marginTop: 4,
                  background: 'none', border: '1px solid rgba(236,238,244,0.12)',
                  color: '#8A91A3', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de borrado */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ background: '#161821', border: '1px solid rgba(236,238,244,0.12)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
            <h3 style={{ color: '#ECEEF4', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>¿Eliminar la rutina?</h3>
            <p style={{ color: '#8A91A3', fontSize: 13, marginBottom: 20 }}>
              Se borra <strong style={{ color: '#ECEEF4' }}>{confirmDelete.name}</strong>. Los entrenos que ya hiciste
              con ella quedan en el historial.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: '1px solid rgba(236,238,244,0.12)', color: '#8A91A3', fontSize: 14, fontWeight: 600, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteRoutine(confirmDelete.id)
                  addToast(`Se eliminó ${confirmDelete.name}`, 'info')
                  setConfirmDelete(null)
                }}
                style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
