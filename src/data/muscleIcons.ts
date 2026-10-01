import type { MuscleGroup } from '../types'

/** Cabeza y torso (de frente o de espaldas), con el arranque de los brazos. */
const HEAD = 'M12 0.7A2.5 2.5 0 1 1 12 5.7A2.5 2.5 0 1 1 12 0.7Z'
const TORSO = 'M10.2 6.4H13.8L19 8.2Q20.6 8.9 20.8 10.6L21.2 15L18.7 15.3L17.6 11.6L16.7 16.8L16.3 22.6H7.7L7.3 16.8L6.4 11.6L5.3 15.3L2.8 15L3.2 10.6Q3.4 8.9 5 8.2Z'
/** Brazo flexionado de costado: el mismo para bíceps y tríceps, cambia la zona pintada. */
const ARM = 'M2 10.6Q7.5 9.4 11.8 10.4L13 6.2Q12.6 3.4 14.6 2.7L17.3 2.4Q19.2 2.6 18.7 4.5L17.4 6.4L17.9 13.4Q17.6 17.6 12.8 17.7H2Z'

/**
 * Dibujos de cada grupo muscular, en una grilla de 24×24.
 *
 * No hay emojis de músculos (por eso antes pecho era 🫁 y espalda 🦅), así que
 * cada grupo es una silueta del cuerpo con el músculo que trabaja pintado:
 * `outline` es el contorno (se dibuja tenue) y `muscle` las zonas resaltadas.
 */
export const muscleIconPaths: Record<MuscleGroup, { outline: string[]; muscle: string[] }> = {
  // Torso de frente con los dos pectorales.
  pecho: {
    outline: [HEAD, TORSO],
    muscle: [
      'M7.1 9.8Q9.4 9 11.5 9.6V13.2Q9.3 14.4 7.5 13.3Z',
      'M16.9 9.8Q14.6 9 12.5 9.6V13.2Q14.7 14.4 16.5 13.3Z',
    ],
  },
  // Torso de espaldas: trapecio y dorsales en V.
  espalda: {
    outline: [HEAD, TORSO, 'M12 11V21'],
    muscle: [
      'M10.2 6.7H13.8L16.2 8.5L12 11L7.8 8.5Z',
      'M7 10.2Q9.6 11.1 11.4 12.3V18.6Q9.3 17.2 7.8 17.6L6.9 12.4Z',
      'M17 10.2Q14.4 11.1 12.6 12.3V18.6Q14.7 17.2 16.2 17.6L17.1 12.4Z',
    ],
  },
  // Torso de frente con los deltoides en la punta de cada hombro.
  hombros: {
    outline: [HEAD, TORSO],
    muscle: [
      'M16.5 7.9Q20.8 7.9 21.1 12.6L18.5 12.9Q18.2 10.2 16.2 9.2Z',
      'M7.5 7.9Q3.2 7.9 2.9 12.6L5.5 12.9Q5.8 10.2 7.8 9.2Z',
    ],
  },
  // Brazo flexionado de costado, con la panza del bíceps arriba.
  biceps: {
    outline: [ARM],
    muscle: ['M3.6 11Q8.6 6.6 12.7 10.4Q13 12.8 11 13.8Q7.4 14.5 3.6 13.6Z'],
  },
  // El mismo brazo, con el tríceps pintado en la cara de abajo, hasta el codo.
  triceps: {
    outline: [ARM],
    muscle: ['M3 14.3Q9 13.2 14.4 14.5Q16.7 14.2 17.6 12.4Q18.1 16.4 14.8 17.3Q13.2 17.7 11.4 17.7H3Z'],
  },
  // Las dos piernas de frente, con los cuádriceps.
  piernas: {
    outline: ['M5 2H19L18.4 11.5Q17.6 13.5 17.4 15L16.8 21L17.8 22.3H13.6L13.7 15L13 12L12 7L11 12L10.3 15L10.4 22.3H6.2L7.2 21L6.6 15Q6.4 13.5 5.6 11.5Z'],
    muscle: [
      'M5.7 3.6Q8.6 4.6 11 7.2L10.6 11.6Q8.7 13.1 6.5 12.1Q5.4 8 5.7 3.6Z',
      'M18.3 3.6Q15.4 4.6 13 7.2L13.4 11.6Q15.3 13.1 17.5 12.1Q18.6 8 18.3 3.6Z',
    ],
  },
  // Cadera de espaldas, con los dos glúteos.
  gluteos: {
    outline: ['M4 3H20L20.6 10Q21 14 19 17L18 22H13.4L12.6 16.5H11.4L10.6 22H6L5 17Q3 14 3.4 10Z'],
    muscle: [
      'M4.5 8Q4.7 5.1 8 5Q11.5 5.1 11.6 8.6V13.8Q11 16.3 8 16.2Q4.7 16 4.3 12.6Z',
      'M19.5 8Q19.3 5.1 16 5Q12.5 5.1 12.4 8.6V13.8Q13 16.3 16 16.2Q19.3 16 19.7 12.6Z',
    ],
  },
  // Torso de frente con los seis cuadritos del abdomen.
  core: {
    outline: [HEAD, TORSO],
    muscle: [
      'M9.3 12.4H11.5V14.3H9.3Z', 'M12.5 12.4H14.7V14.3H12.5Z',
      'M9.4 15H11.5V16.9H9.4Z', 'M12.5 15H14.6V16.9H12.5Z',
      'M9.5 17.6H11.5V19.9H9.5Z', 'M12.5 17.6H14.5V19.9H12.5Z',
    ],
  },
  // Corazón con la línea del pulso.
  cardio: {
    outline: ['M12 20.6L4.3 13Q1.4 10 3.1 6.4Q5.5 2.4 9.6 4.1Q11.2 4.8 12 6.3Q12.8 4.8 14.4 4.1Q18.5 2.4 20.9 6.4Q22.6 10 19.7 13Z'],
    muscle: [],
  },
}

/** Línea del pulso del ícono de cardio: va como trazo, no como relleno. */
export const CARDIO_PULSE = 'M2.5 12H7.6L9.4 8.6L11.6 15.6L13.6 9.4L15 12H21.5'

