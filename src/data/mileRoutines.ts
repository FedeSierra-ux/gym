import type { Routine, RoutineExercise } from '../types'

/**
 * Plan de Milena Caro — septiembre, por Ayrton Pascuccelli (Team A.E),
 * cargado tal cual el PDF para que no haya que armarlo a mano.
 *
 * Criterios de la transcripción:
 * - Las series/reps de base son las de las semanas 1-2-3; las de las semanas
 *   4-5-6 van en `alt` y se eligen con el selector de la rutina.
 * - "10/10" del plan significa por lado: se carga 10 y se aclara en la nota.
 *   Las pirámides ("15/12/10") van como rango, con la pirámide en la nota.
 * - Los circuitos de entrada y los tabatas son bloques (`block`), y las dos
 *   estocadas del full body una superserie (`supersetGroup`).
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
const PRINCIPAL = 'Principal'
const TABATA = 'Tabata 20" / 10" · 4 rondas'
const CARDIO = 'Cardio final'

/** Series × reps fijas de las semanas 4-6. */
const x = (sets: number, reps: number) => ({ sets, repsMin: reps, repsMax: reps })
/** Pirámide de las semanas 4-6, cargada como rango (de la última a la primera). */
const piramide = (sets: number, min: number, max: number) => ({ sets, repsMin: min, repsMax: max })

export const MILE_ROUTINE_IDS = ['mile-piernas', 'mile-brazos', 'mile-fullbody'] as const

export function buildMileRoutines(createdAt = Date.now()): Routine[] {
  return [
    {
      id: 'mile-piernas',
      name: 'Rutina Mile piernas',
      emoji: '🦵',
      createdAt,
      exercises: order([
        { exerciseId: 'core-12', sets: 3, targetSeconds: 20, note: '20 s por lado', block: CIRCUITO },
        { exerciseId: 'core-13', sets: 3, repsMin: 10, repsMax: 10, note: 'Abdominales cortitos', block: CIRCUITO },
        { exerciseId: 'core-16', sets: 3, repsMin: 10, repsMax: 10, note: '10 por lado', block: CIRCUITO },

        { exerciseId: 'piernas-13', sets: 3, repsMin: 10, repsMax: 10, note: 'Descanso 2 min', block: PRINCIPAL, alt: x(3, 8) },
        { exerciseId: 'piernas-08', sets: 3, repsMin: 10, repsMax: 10, note: 'Estocadas búlgaras con una mancuerna · por pierna · descanso 2 min', block: PRINCIPAL, alt: x(3, 15) },
        { exerciseId: 'piernas-14', sets: 3, repsMin: 15, repsMax: 15, note: 'Descanso 1:30 · semanas 4-6 en pirámide: 20/15/12', block: PRINCIPAL, alt: piramide(3, 12, 20) },
        { exerciseId: 'gluteos-03', sets: 3, repsMin: 10, repsMax: 10, note: 'Patadas de glúteo en polea baja · por pierna · descanso 1:30', block: PRINCIPAL, alt: x(3, 12) },
        { exerciseId: 'piernas-05', sets: 3, repsMin: 12, repsMax: 12, note: 'Camilla de isquios · descanso 1:30 · semanas 4-6 en pirámide: 15/12/10', block: PRINCIPAL, alt: piramide(3, 10, 15) },

        { exerciseId: 'piernas-17', sets: 4, repsMin: 10, repsMax: 12, block: TABATA },
        { exerciseId: 'core-15', sets: 4, repsMin: 10, repsMax: 15, block: TABATA },
        { exerciseId: 'piernas-18', sets: 4, targetSeconds: 20, block: TABATA },
        { exerciseId: 'piernas-20', sets: 4, repsMin: 10, repsMax: 15, block: TABATA },
      ]),
    },
    {
      id: 'mile-brazos',
      name: 'Rutina Mile brazos',
      emoji: '💪',
      createdAt: createdAt + 1,
      exercises: order([
        { exerciseId: 'core-03', sets: 3, targetSeconds: 20, note: 'Plancha frontal', block: CIRCUITO },
        { exerciseId: 'core-05', sets: 3, repsMin: 10, repsMax: 10, note: 'Abdominales soviéticos con disco · 10 por lado', block: CIRCUITO },
        { exerciseId: 'core-16', sets: 3, repsMin: 10, repsMax: 10, note: '10 por lado', block: CIRCUITO },

        { exerciseId: 'hombros-07', sets: 3, repsMin: 8, repsMax: 8, note: 'Descanso 2 min', block: PRINCIPAL, alt: x(3, 6) },
        { exerciseId: 'espalda-11', sets: 3, repsMin: 12, repsMax: 12, note: 'Descanso 2 min', block: PRINCIPAL, alt: x(3, 8) },
        { exerciseId: 'pecho-05', sets: 3, repsMin: 10, repsMax: 10, note: 'Aperturas planas · descanso 2 min', block: PRINCIPAL, alt: x(3, 12) },
        { exerciseId: 'hombros-08', sets: 3, repsMin: 15, repsMax: 15, note: 'Descanso 1:30 · semanas 4-6 en pirámide: 15/12/10', block: PRINCIPAL, alt: piramide(3, 10, 15) },
        { exerciseId: 'triceps-05', sets: 3, repsMin: 10, repsMax: 10, note: 'Descanso 1:30', block: PRINCIPAL, alt: x(3, 12) },
        { exerciseId: 'biceps-07', sets: 3, repsMin: 8, repsMax: 8, note: 'Por brazo · descanso 1:30', block: PRINCIPAL, alt: x(3, 10) },

        { exerciseId: 'cardio-01', sets: 1, targetSeconds: 15 * 60, note: '15 minutos', block: CARDIO },
      ]),
    },
    {
      id: 'mile-fullbody',
      name: 'Rutina Mile full body',
      emoji: '🔥',
      createdAt: createdAt + 2,
      exercises: order([
        { exerciseId: 'piernas-03', sets: 4, repsMin: 10, repsMax: 10, note: 'Prensa 45° · descanso 2 min', block: PRINCIPAL, alt: x(4, 8) },
        { exerciseId: 'piernas-10', sets: 3, repsMin: 10, repsMax: 10, note: 'Hip thruster con barra · descanso 2 min', block: PRINCIPAL, alt: x(3, 8) },
        { exerciseId: 'piernas-04', sets: 3, repsMin: 12, repsMax: 12, note: 'Sillón de cuádriceps', block: PRINCIPAL, supersetGroup: 'mile-fb-ss1' },
        { exerciseId: 'piernas-16', sets: 3, repsMin: 8, repsMax: 8, note: 'Por pierna', block: PRINCIPAL, supersetGroup: 'mile-fb-ss1' },
        { exerciseId: 'espalda-12', sets: 3, repsMin: 15, repsMax: 15, note: 'Descanso 2 min · semanas 4-6 en pirámide: 15/12/10', block: PRINCIPAL, alt: piramide(3, 10, 15) },
        { exerciseId: 'hombros-02', sets: 3, repsMin: 12, repsMax: 12, note: 'Vuelos laterales · descanso 1 min', block: PRINCIPAL },
        { exerciseId: 'triceps-01', sets: 3, repsMin: 10, repsMax: 10, note: 'Tras nuca con soga · descanso 1:30', block: PRINCIPAL, alt: x(3, 12) },

        { exerciseId: 'piernas-20', sets: 4, repsMin: 10, repsMax: 15, block: TABATA },
        { exerciseId: 'core-17', sets: 4, targetSeconds: 20, block: TABATA },
        { exerciseId: 'piernas-19', sets: 4, repsMin: 15, repsMax: 20, block: TABATA },
      ]),
    },
  ]
}

/**
 * Las rutinas de Mile guardadas por versiones anteriores no tienen bloques,
 * superseries ni semanas 4-6: estaban escritos en las notas. Esto les completa
 * lo que falta, ejercicio por ejercicio, sin pisar lo que el usuario haya
 * cambiado (series, reps, orden o ejercicios agregados).
 */
export function completarPlanMile(routine: Routine): Routine {
  if (!(MILE_ROUTINE_IDS as readonly string[]).includes(routine.id)) return routine
  if (routine.exercises.some((re) => re.block || re.alt || re.supersetGroup)) return routine
  const plan = buildMileRoutines().find((r) => r.id === routine.id)
  if (!plan) return routine
  return {
    ...routine,
    exercises: routine.exercises.map((re) => {
      const delPlan = plan.exercises.find((p) => p.exerciseId === re.exerciseId)
      if (!delPlan) return re
      return {
        ...re,
        block: delPlan.block,
        supersetGroup: delPlan.supersetGroup,
        alt: delPlan.alt,
        // La nota vieja repetía el bloque y las semanas 4-6, que ahora se ven
        // solos; si el usuario la reescribió, queda la suya.
        note: re.note && !/semana 4-6|Circuito de entrada|Tabata|superserie/i.test(re.note) ? re.note : delPlan.note,
      }
    }),
  }
}

/**
 * Plan semanal sugerido: lunes piernas, miércoles brazos, viernes full body.
 * Las claves son 0 = lunes, como en el resto de la app (Agenda e Inicio).
 */
export const MILE_WEEK_PLAN: Record<number, string> = {
  0: 'mile-piernas',
  2: 'mile-brazos',
  4: 'mile-fullbody',
}
