/**
 * Regresiones de la auditoría de la 1.5.0 (stores, utilidades y backup): cada
 * test reproduce un hallazgo y pasa sólo con el arreglo.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildProgressSeries } from '../progressSeries'
import { suggestNextWeight } from '../progression'
import { ciclosParaListar, planificadasPorSemana } from '../informes'
import { finDeCiclo, inicioParaSemana, lunesDe, lunesSiguiente, referenciaDeSemana, semanaActual, semanaDeEntreno } from '../program'
import { esMejor } from '../records'
import { reanudarEscrituras } from '../safeStorage'
import { resumenAnual } from '../yearReview'
import { formatKg, formatMedida, formatNum } from '../format'
import { deltaColor, ROW, S, SP } from '../../theme'
import { DIA, ejercicio, entreno, serie } from './helpers'

const memoria = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memoria.get(k) ?? null,
  setItem: (k: string, v: string) => { memoria.set(k, v) },
  removeItem: (k: string) => { memoria.delete(k) },
})

type StoreModule = typeof import('../../store/useStore')
type WorkoutModule = typeof import('../../stores/workoutStore')
type BackupModule = typeof import('../backup')
let store: StoreModule
let workout: WorkoutModule
let backup: BackupModule

beforeAll(async () => {
  store = await import('../../store/useStore')
  workout = await import('../../stores/workoutStore')
  backup = await import('../backup')
})

const f = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m, d, h, min).getTime()
const MARTES = f(2026, 9, 13, 10)
const DOMINGO = f(2026, 9, 18, 18)

const rutina = {
  id: 'r', name: 'R', emoji: '', createdAt: 0,
  exercises: [{ exerciseId: 'pecho-07', sets: 3, repsMin: 8, repsMax: 12, order: 0 }],
}
const ws = () => workout.useWorkoutStore.getState()

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(MARTES)
  workout.useWorkoutStore.setState({ activeWorkout: null })
  store.useStore.setState({ routines: [rutina], workouts: [], prs: [], programa: null, ciclosPrograma: [], inicioUso: null, toasts: [] })
})

afterEach(() => {
  vi.useRealTimers()
  // applyBackup corta las escrituras hasta la recarga; acá no hay recarga.
  reanudarEscrituras()
})

// ---------------------------------------------------------------- Backup

describe('backup (H01, H02, H03)', () => {
  const archivo = (state: unknown) => JSON.stringify({ app: 'gympro', exportedAt: 5, data: JSON.stringify({ state, version: 2 }) })
  const entrenoCon = (sets: unknown[]) => ({ id: 'w', routineId: 'r', startedAt: 1, exercises: [{ exerciseId: 'a', sets }] })

  it('un segundo toque en "Reemplazar datos" no pisa la copia de antes del import', () => {
    memoria.set(store.STORAGE_KEY, JSON.stringify({ state: { workouts: [], userName: 'antes' }, version: 2 }))
    const b = backup.parseBackup(archivo({ workouts: [], userName: 'después' }))
    backup.applyBackup(b)
    backup.applyBackup(b)
    expect(JSON.parse(memoria.get(backup.PREVIOUS_KEY)!).state.userName).toBe('antes')
    expect(JSON.parse(memoria.get(store.STORAGE_KEY)!).state.userName).toBe('después')
  })

  it('rechaza series, rutinas, ejercicios propios y medidas rotos', () => {
    const rotos: unknown[] = [
      { workouts: [entrenoCon([null])] },
      { workouts: [entrenoCon([{ kg: 'abc', reps: 8 }])] },
      { workouts: [entrenoCon([{ kg: 10, reps: 8, completedAt: 'hoy' }])] },
      { workouts: [{ ...entrenoCon([]), startedAt: 0 }] },
      { routines: [{ id: 'r', name: 'R', emoji: '', exercises: [null] }] },
      { routines: [{ id: 'r', name: { x: 1 }, emoji: '', exercises: [] }] },
      { routines: [{ id: 'r', name: 'R', emoji: '', exercises: [{ exerciseId: 'a', sets: '3', repsMin: 8, repsMax: 10 }] }] },
      { workouts: [], customExercises: [{}] },
      { workouts: [], customExercises: [{ id: 'c', nameEs: 'Raro', muscleGroup: 'cuello' }] },
      { workouts: [], measures: [{ date: 'ayer' }] },
    ]
    for (const state of rotos) expect(() => backup.parseBackup(archivo(state)), JSON.stringify(state)).toThrow()
    expect(() => backup.parseBackup(archivo({ workouts: [entrenoCon([null])] }))).toThrow(/entrenos o rutinas dañados/)
  })

  it('acepta lo válido y descarta lo accesorio que viene mal', () => {
    const b = backup.parseBackup(archivo({
      workouts: [entrenoCon([{ kg: 0, reps: 12, completedAt: 1 }, { kg: 0, reps: 0, durationSec: 30 }])],
      routines: [{ id: 'r', name: 'R', emoji: '🏋️', exercises: [{ exerciseId: 'a', sets: 3, repsMin: 8, repsMax: 10, order: 0 }] }],
      customExercises: [{ id: 'c', nameEs: 'Raro', muscleGroup: 'espalda', primaryMuscles: [], equipment: 'Libre' }],
      measures: [{ id: 'm', date: 1, weightKg: 60 }],
      prs: [null, 'x', { exerciseId: 'a', kg: 10, reps: 8, date: 1 }],
      exerciseTips: { a: 'codos adentro', b: 7, c: null },
      archivedRoutineNames: { x: { name: 'Vieja', emoji: '💪' }, y: 'nombre', z: { name: 3 } },
      programa: { inicio: 'lunes', fase: 'alt' },
    }))
    const { state } = JSON.parse(b.data)
    expect(state.prs).toHaveLength(1)
    expect(state.exerciseTips).toEqual({ a: 'codos adentro' })
    expect(state.archivedRoutineNames).toEqual({ x: { name: 'Vieja', emoji: '💪' } })
    expect(state.programa).toBeUndefined()
    expect(state.customExercises).toHaveLength(1)
  })

  it('el volcado de emergencia sale sin la API key (y sin parsear, tal cual)', () => {
    const raw = JSON.stringify({ state: { workouts: [], anthropicApiKey: 'sk-ant-secreta', userName: 'yo' }, version: 2 })
    const limpio = backup.sinApiKey(raw)
    expect(limpio).not.toContain('sk-ant-secreta')
    expect(JSON.parse(limpio)).toEqual({ state: { workouts: [], userName: 'yo' }, version: 2 })
    expect(backup.sinApiKey('{esto no es json')).toBe('{esto no es json')
  })

  it('un estado guardado raro no deja la app sin arrancar', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    memoria.set(store.STORAGE_KEY, JSON.stringify({
      state: { workouts: [{ id: 'x', routineId: 'r', startedAt: 1, finishedAt: 2, exercises: [{ exerciseId: 'a', sets: [null] }] }], routines: [] },
      version: 2,
    }))
    await store.useStore.persist.rehydrate()
    await Promise.resolve()
    expect(error).toHaveBeenCalled()
    error.mockRestore()
    store.useStore.setState({ workouts: [], prs: [] })
  })
})

// ---------------------------------------------------------------- Plan

describe('semana actual (H05)', () => {
  it('un domingo la referencia es mañana; los otros días, hoy', () => {
    expect(new Date(referenciaDeSemana(DOMINGO)).getDay()).toBe(1)
    expect(referenciaDeSemana(MARTES)).toBe(MARTES)
  })

  it('fijar la semana 4 un domingo deja la semana 4 para todos', () => {
    const programa = { inicio: inicioParaSemana(4, DOMINGO), fase: 'alt' as const }
    expect(semanaActual(programa, DOMINGO)).toBe(4)
    expect(semanaDeEntreno(programa, DOMINGO)).toBe(4)
    expect(ciclosParaListar(programa, [], DOMINGO)[0].semana).toBe(4)
    // El lunes sigue siendo la semana 4.
    expect(semanaActual(programa, f(2026, 9, 19, 9))).toBe(4)
  })

  it('un entreno pasado se estampa por su fecha, con la misma regla del domingo', () => {
    const programa = { inicio: lunesDe(f(2026, 9, 5)), fase: 'base' as const }
    expect(semanaDeEntreno(programa, f(2026, 9, 7, 19))).toBe(1) // miércoles
    expect(semanaDeEntreno(programa, f(2026, 9, 11, 10))).toBe(2) // domingo: ya es la semana que arranca mañana
    expect(semanaDeEntreno(programa, f(2026, 8, 30))).toBeNull()
  })
})

describe('corregir la semana re-estampa los entrenos (H12)', () => {
  const entrenoEn = (ts: number, semanaPrograma?: number) => ({ id: `w${ts}`, routineId: 'r', startedAt: ts, finishedAt: ts + 3600000, exercises: [], semanaPrograma })

  it('el entreno del martes pasa de S1 a S3 al corregir el jueves; los de antes del ciclo no se tocan', () => {
    const martes = f(2026, 9, 13, 19)
    const jueves = f(2026, 9, 15, 12)
    vi.setSystemTime(martes)
    store.useStore.getState().fijarSemanaPrograma(1)
    store.useStore.setState({ workouts: [entrenoEn(f(2026, 8, 20), 6), entrenoEn(martes, 1)] })
    vi.setSystemTime(jueves)
    store.useStore.getState().fijarSemanaPrograma(3)
    const [viejo, reciente] = store.useStore.getState().workouts
    expect(reciente.semanaPrograma).toBe(3)
    expect(viejo.semanaPrograma).toBe(6)
  })

  it('un entreno que cae fuera del ciclo nuevo pierde la estampa', () => {
    const martes = f(2026, 9, 13, 19)
    vi.setSystemTime(martes)
    store.useStore.getState().fijarSemanaPrograma(6)
    store.useStore.setState({ workouts: [entrenoEn(martes, 6)] })
    // Reiniciar en semana 1 con un entreno de hace siete semanas estampado: ahora queda antes del inicio, se respeta.
    vi.setSystemTime(f(2026, 11, 1, 12))
    store.useStore.getState().fijarSemanaPrograma(1)
    expect(store.useStore.getState().workouts[0].semanaPrograma).toBe(6)
    // Y uno posterior al inicio pero más allá de la semana 6 (fechado mal) se queda sin semana.
    store.useStore.setState({ workouts: [entrenoEn(f(2027, 1, 20), 2)] })
    vi.setSystemTime(f(2026, 11, 2, 12))
    store.useStore.getState().fijarSemanaPrograma(2)
    expect(store.useStore.getState().workouts[0].semanaPrograma).toBeUndefined()
  })
})

describe('fin de ciclo con fechas (H23)', () => {
  it('el lunes siguiente es un lunes a las 00:00, siete días después', () => {
    for (const ts of [MARTES, DOMINGO, f(2026, 9, 25, 23, 30), f(2026, 2, 29, 1)]) {
      const d = new Date(lunesSiguiente(ts))
      expect([d.getDay(), d.getHours(), d.getMinutes()]).toEqual([1, 0, 0])
      expect(Math.round((lunesSiguiente(ts) - lunesDe(ts)) / DIA)).toBe(7)
    }
  })

  it('terminar el plan a mitad de semana archiva el ciclo hasta el lunes que viene (a las 00:00)', () => {
    const inicio = lunesDe(MARTES - 21 * DIA)
    store.useStore.setState({ programa: { inicio, fase: 'base' }, workouts: [{ id: 'w', routineId: 'r', startedAt: inicio + DIA, finishedAt: inicio + DIA + 1, exercises: [] }] })
    store.useStore.getState().terminarPrograma()
    expect(store.useStore.getState().ciclosPrograma[0].fin).toBe(f(2026, 9, 19))
  })
})

describe('ciclos completos (H24)', () => {
  it('un ciclo cortado en la semana 4 no cuenta como completo', () => {
    const inicio = lunesDe(f(2025, 2, 3))
    const workouts = [entreno(f(2025, 2, 5), [{ exerciseId: 'b', sets: [serie(40, 8)] }])]
    const base = { workouts, exercises: [ejercicio('b')], prs: [], measures: [], inicioUso: f(2025, 0, 1), year: 2025, nowTs: f(2025, 11, 20) }
    expect(resumenAnual({ ...base, ciclos: [{ inicio, fin: lunesDe(f(2025, 2, 27)) }] }).ciclosCompletados).toBe(0)
    expect(resumenAnual({ ...base, ciclos: [{ inicio, fin: finDeCiclo(inicio) }] }).ciclosCompletados).toBe(1)
  })
})

// ---------------------------------------------------------------- Entreno en curso

describe('entreno en curso en dos instancias (H08)', () => {
  it('si otra pestaña ya tiene un entreno en curso, Iniciar sigue con ese en vez de pisarlo', () => {
    const ajeno = {
      routineId: 'otra', startedAt: MARTES - 600000, realStartedAt: MARTES - 600000, origen: 'en-vivo',
      exercises: [{ exerciseId: 'pecho-01', sets: [{ kg: '40', reps: '8', completed: true }] }],
      restTimerVisible: false, restSecondsLeft: 0, restTotalSeconds: 75,
    }
    memoria.set('gympro-active-workout', JSON.stringify({ state: { activeWorkout: ajeno }, version: 0 }))
    ws().startWorkout('r')
    expect(ws().activeWorkout?.routineId).toBe('otra')
    expect(ws().activeWorkout?.exercises[0].sets[0].completed).toBe(true)
    expect(store.useStore.getState().toasts.map((t) => t.message)).toEqual([expect.stringMatching(/otra pestaña/)])
  })
})

describe('descanso vencido con la app cerrada (H09)', () => {
  it('al volver el panel no queda clavado en 0:00', () => {
    const aw = {
      routineId: 'r', startedAt: MARTES, realStartedAt: MARTES, exercises: [],
      restTimerVisible: true, restSecondsLeft: 0, restTotalSeconds: 75, restEndsAt: MARTES - 1000,
    }
    memoria.set('gympro-active-workout', JSON.stringify({ state: { activeWorkout: aw }, version: 0 }))
    void workout.useWorkoutStore.persist.rehydrate()
    expect(ws().activeWorkout?.restTimerVisible).toBe(false)
    expect(ws().activeWorkout?.restEndsAt).toBeUndefined()
    // Uno que todavía corre sigue visible.
    memoria.set('gympro-active-workout', JSON.stringify({ state: { activeWorkout: { ...aw, restEndsAt: MARTES + 30000 } }, version: 0 }))
    void workout.useWorkoutStore.persist.rehydrate()
    expect(ws().activeWorkout?.restTimerVisible).toBe(true)
    expect(ws().activeWorkout?.restSecondsLeft).toBe(30)
  })
})

describe('récord en vivo (H13)', () => {
  const flexiones = (reps: number) => entreno(MARTES - 10 * DIA, [{ exerciseId: 'pecho-07', sets: [serie(0, reps), serie(0, reps), serie(0, reps)] }])
  const tildar = (setIdx: number, kg: string, reps: string) => {
    ws().updateSetValue(0, setIdx, 'kg', kg)
    ws().updateSetValue(0, setIdx, 'reps', reps)
    ws().completeSet(0, setIdx)
    return ws().activeWorkout?.livePr
  }

  it('usa el mismo criterio que los récords: a peso corporal manda la cantidad de reps', () => {
    const historial = [flexiones(12)]
    store.useStore.setState({ workouts: historial })
    store.useStore.getState().recomputeRecords()
    ws().startWorkout('r')
    // Con lastre y menos reps no es récord (el resumen tampoco lo contaría).
    expect(tildar(0, '5', '6')).toBeNull()
    // Más reps a peso corporal sí.
    expect(tildar(1, '', '15')).toEqual({ exerciseId: 'pecho-07', kg: 0, reps: 15 })
    // Una serie peor apaga el cartel.
    expect(tildar(2, '', '10')).toBeNull()
  })

  it('compara también contra las series ya hechas en la sesión', () => {
    store.useStore.setState({ workouts: [flexiones(8)] })
    store.useStore.getState().recomputeRecords()
    ws().startWorkout('r')
    expect(tildar(0, '', '12')?.reps).toBe(12)
    expect(tildar(1, '', '12')).toBeNull()
    expect(tildar(2, '', '13')?.reps).toBe(13)
  })

  it('esMejor es el criterio compartido', () => {
    expect(esMejor('reps', { kg: 5, reps: 6 }, { kg: 0, reps: 12 })).toBe(false)
    expect(esMejor('kg', { kg: 5, reps: 6 }, { kg: 0, reps: 12 })).toBe(true)
    expect(esMejor('tiempo', { kg: 0, reps: 0, durationSec: 40 }, { kg: 0, reps: 0, durationSec: 30 })).toBe(true)
  })
})

describe('el descanso no serializa el entreno cada segundo (H28)', () => {
  it('cambiar sólo el segundero no vuelve a serializar', () => {
    ws().startWorkout('r')
    ws().updateSetValue(0, 0, 'reps', '8')
    ws().completeSet(0, 0, { startRest: true })
    const stringify = vi.spyOn(JSON, 'stringify')
    for (let i = 1; i <= 3; i++) {
      workout.useWorkoutStore.setState((s) => ({ activeWorkout: { ...s.activeWorkout!, restSecondsLeft: s.activeWorkout!.restSecondsLeft - i } }))
    }
    expect(stringify).not.toHaveBeenCalled()
    stringify.mockRestore()
  })
})

// ---------------------------------------------------------------- Informes y progreso

describe('meta semanal y primer uso (H14)', () => {
  it('la semana en que se instaló la app no pide más entrenos que días le quedaban', () => {
    const plan = planificadasPorSemana({ weekPlan: {}, weekOverrides: {}, weeklyGoal: 3, routines: [], inicioUso: f(2026, 9, 17, 11), workouts: [] })
    expect(plan(lunesDe(f(2026, 9, 12)))).toBe(2) // sábado y domingo
    expect(plan(lunesDe(f(2026, 9, 19)))).toBe(3)
    expect(plan(lunesDe(f(2026, 9, 5)))).toBe(0)
  })
})

describe('bajar tras inactividad (H25)', () => {
  it('en máquina, con 20 kg hace 28 días, mantiene en vez de bajar un 25 %', () => {
    const maquina = ejercicio('m', { equipmentType: 'maquina' })
    const s = suggestNextWeight(maquina, { sets: 3, repsMin: 10, repsMax: 12 }, [entreno(MARTES - 28 * DIA, [{ exerciseId: 'm', sets: [serie(20, 12)] }])], 'm')
    expect(s?.reason).toBe('mantener')
    expect(s?.kg).toBe(20)
    // Con 40 kg bajar a 35 es menos del 20 %: sí baja.
    const s40 = suggestNextWeight(maquina, { sets: 3, repsMin: 10, repsMax: 12 }, [entreno(MARTES - 28 * DIA, [{ exerciseId: 'm', sets: [serie(40, 12)] }])], 'm')
    expect(s40?.reason).toBe('bajar')
    expect(s40?.kg).toBe(35)
  })
})

describe('Progreso y Récords miden con la misma unidad (H26)', () => {
  it('unas dominadas con lastre reciente siguen en reps si el historial es a peso corporal', () => {
    const dominadas = ejercicio('dom', { equipmentType: 'peso_corporal' })
    const viejos = Array.from({ length: 10 }, (_, i) =>
      entreno(MARTES - (200 - i * 5) * DIA, [{ exerciseId: 'dom', sets: [serie(0, 8), serie(0, 8), serie(0, 7)] }]))
    const recientes = Array.from({ length: 4 }, (_, i) =>
      entreno(MARTES - (30 - i * 7) * DIA, [{ exerciseId: 'dom', sets: [serie(5, 6), serie(5, 5)] }]))
    const [s] = buildProgressSeries([...viejos, ...recientes], [dominadas], MARTES - 92 * DIA, MARTES)
    expect(s.kind).toBe('reps')
    expect(s.current).toBe(6)
  })
})

// ---------------------------------------------------------------- Sistema de diseño

describe('formato numérico único', () => {
  it('coma decimal, punto de miles y sin ceros de más', () => {
    expect(formatNum(58.2)).toBe('58,2')
    expect(formatNum(67.5)).toBe('67,5')
    expect(formatNum(3650)).toBe('3.650')
    expect(formatNum(10)).toBe('10')
    expect(formatNum(67.45)).toBe('67,5')
    expect(formatNum(67.45, 2)).toBe('67,45')
    expect(formatMedida(58.2, 'kg')).toBe('58,2 kg')
    expect(formatKg(61.25)).toBe('61,25')
    expect(formatKg(82.5)).toBe('82,5')
    expect(formatKg(0)).toBe('0')
  })
})

describe('tokens de deltas, espaciado y filas', () => {
  it('deltaColor: verde sube, dim baja, ámbar récord', () => {
    expect(deltaColor(2)).toBe(S.good)
    expect(deltaColor(-2)).toBe(S.dim)
    expect(deltaColor(0)).toBe(S.dim)
    expect(deltaColor(2, 'record')).toBe(S.acc2)
  })

  it('escala de 4 px y alturas de fila', () => {
    expect(Object.values(SP)).toEqual([4, 8, 12, 16, 20, 24, 32])
    expect(ROW).toEqual({ compact: 44, regular: 56, loose: 60 })
  })
})
