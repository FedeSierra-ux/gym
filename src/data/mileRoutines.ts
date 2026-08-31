import type { Routine, RoutineExercise } from '../types'

/**
 * Plan de Milena Caro — septiembre, por Ayrton Pascuccelli (Team A.E),
 * cargado tal cual el PDF para que no haya que armarlo a mano.
 *
 * Criterios de la transcripción:
 * - Las series/reps son las de las semanas 1-2-3; la variante de las semanas
 *   4-5-6 queda en la nota de cada ejercicio.
 * - "10/10" del plan significa por lado: se carga 10 y se aclara en la nota.
 * - Los circuitos de entrada y los tabatas entran como ejercicios normales, en
 *   orden, con la nota que dice de qué bloque son (todavía no hay superseries).
 * - Los isométricos y la cinta usan el registro por tiempo.
 */

const DEFAULT_RANGE = { repsMin: 8, repsMax: 12 }

type Item = Omit<RoutineExercise, 'order' | 'repsMin' | 'repsMax'> & {
  repsMin?: number
  repsMax?: number
}

function order(items: Item[]): RoutineExercise[] {
  return items.map((item, i) => ({
    repsMin: item.repsMin ?? DEFAULT_RANGE.repsMin,
    repsMax: item.repsMax ?? DEFAULT_RANGE.repsMax,
    ...item,
    order: i,
  }))
}

const CIRCUITO = 'Circuito de entrada · 3 rondas'
const TABATA = 'Tabata 20" trabajo / 10" pausa · 4 rondas'

export const MILE_ROUTINE_IDS = ['mile-piernas', 'mile-brazos', 'mile-fullbody'] as const

export function buildMileRoutines(createdAt = Date.now()): Routine[] {
  return [
    {
      id: 'mile-piernas',
      name: 'Rutina Mile piernas',
      emoji: '🦵',
      createdAt,
      exercises: order([
        { exerciseId: 'core-12', sets: 3, targetSeconds: 20, note: `${CIRCUITO} · 20 s por lado` },
        { exerciseId: 'core-13', sets: 3, repsMin: 10, repsMax: 10, note: `Abdominales cortitos · ${CIRCUITO}` },
        { exerciseId: 'core-16', sets: 3, repsMin: 10, repsMax: 10, note: `${CIRCUITO} · 10 por lado` },

        { exerciseId: 'piernas-13', sets: 3, repsMin: 10, repsMax: 10, note: 'Descanso 2 min · semana 4-6: 3 × 8' },
        { exerciseId: 'piernas-08', sets: 3, repsMin: 10, repsMax: 10, note: 'Estocadas búlgaras con una mancuerna · 10 por pierna · descanso 2 min · semana 4-6: 15/15' },
        { exerciseId: 'piernas-14', sets: 3, repsMin: 15, repsMax: 15, note: 'Descanso 1:30 · semana 4-6: 20/15/12' },
        { exerciseId: 'gluteos-03', sets: 3, repsMin: 10, repsMax: 10, note: 'Patadas de glúteo en polea baja · 10 por pierna · descanso 1:30 · semana 4-6: 12/12' },
        { exerciseId: 'piernas-05', sets: 3, repsMin: 12, repsMax: 12, note: 'Camilla de isquios · descanso 1:30 · semana 4-6: 15/12/10' },

        { exerciseId: 'piernas-17', sets: 4, repsMin: 10, repsMax: 12, note: TABATA },
        { exerciseId: 'core-15', sets: 4, repsMin: 10, repsMax: 15, note: TABATA },
        { exerciseId: 'piernas-18', sets: 4, targetSeconds: 20, note: TABATA },
        { exerciseId: 'piernas-20', sets: 4, repsMin: 10, repsMax: 15, note: TABATA },
      ]),
    },
    {
      id: 'mile-brazos',
      name: 'Rutina Mile brazos',
      emoji: '💪',
      createdAt: createdAt + 1,
      exercises: order([
        { exerciseId: 'core-03', sets: 3, targetSeconds: 20, note: `Plancha frontal · ${CIRCUITO}` },
        { exerciseId: 'core-05', sets: 3, repsMin: 10, repsMax: 10, note: `Abdominales soviéticos con disco · ${CIRCUITO} · 10 por lado` },
        { exerciseId: 'core-16', sets: 3, repsMin: 10, repsMax: 10, note: `${CIRCUITO} · 10 por lado` },

        { exerciseId: 'hombros-07', sets: 3, repsMin: 8, repsMax: 8, note: 'Descanso 2 min · semana 4-6: 3 × 6' },
        { exerciseId: 'espalda-11', sets: 3, repsMin: 12, repsMax: 12, note: 'Descanso 2 min · semana 4-6: 3 × 8' },
        { exerciseId: 'pecho-05', sets: 3, repsMin: 10, repsMax: 10, note: 'Aperturas planas · descanso 2 min · semana 4-6: 3 × 12' },
        { exerciseId: 'hombros-08', sets: 3, repsMin: 15, repsMax: 15, note: 'Descanso 1:30 · semana 4-6: 15/12/10' },
        { exerciseId: 'triceps-05', sets: 3, repsMin: 10, repsMax: 10, note: 'Descanso 1:30 · semana 4-6: 3 × 12' },
        { exerciseId: 'biceps-07', sets: 3, repsMin: 8, repsMax: 8, note: '8 por brazo · descanso 1:30 · semana 4-6: 10/10' },

        { exerciseId: 'cardio-01', sets: 1, targetSeconds: 15 * 60, note: 'Cardio final · 15 minutos' },
      ]),
    },
    {
      id: 'mile-fullbody',
      name: 'Rutina Mile full body',
      emoji: '🔥',
      createdAt: createdAt + 2,
      exercises: order([
        { exerciseId: 'piernas-03', sets: 4, repsMin: 10, repsMax: 10, note: 'Prensa 45° · descanso 2 min · semana 4-6: 4 × 8' },
        { exerciseId: 'piernas-10', sets: 3, repsMin: 10, repsMax: 10, note: 'Hip thruster con barra · descanso 2 min · semana 4-6: 3 × 8' },
        { exerciseId: 'piernas-04', sets: 3, repsMin: 12, repsMax: 12, note: 'Sillón de cuádriceps · superserie con las estocadas de abajo' },
        { exerciseId: 'piernas-16', sets: 3, repsMin: 8, repsMax: 8, note: '8 por pierna · superserie con el sillón de cuádriceps' },
        { exerciseId: 'espalda-12', sets: 3, repsMin: 15, repsMax: 15, note: 'Descanso 2 min · semana 4-6: 15/12/10' },
        { exerciseId: 'hombros-02', sets: 3, repsMin: 12, repsMax: 12, note: 'Vuelos laterales · descanso 1 min' },
        { exerciseId: 'triceps-01', sets: 3, repsMin: 10, repsMax: 10, note: 'Tras nuca con soga · descanso 1:30 · semana 4-6: 3 × 12' },

        { exerciseId: 'piernas-20', sets: 4, repsMin: 10, repsMax: 15, note: TABATA },
        { exerciseId: 'core-17', sets: 4, targetSeconds: 20, note: TABATA },
        { exerciseId: 'piernas-19', sets: 4, repsMin: 15, repsMax: 20, note: TABATA },
      ]),
    },
  ]
}

/** Plan semanal sugerido: lunes piernas, miércoles brazos, viernes full body. */
export const MILE_WEEK_PLAN: Record<number, string> = {
  1: 'mile-piernas',
  3: 'mile-brazos',
  5: 'mile-fullbody',
}
