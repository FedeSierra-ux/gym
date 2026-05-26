import type { Exercise } from '../types'

// Exercise icons per muscle group
const svgs: Record<string, string> = {
  // PECHO — bench press front view (barbell + chest + bench)
  pecho: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="40" height="3.5" rx="1.75" fill="#00ff88" opacity="0.9"/>
    <rect x="2" y="5" width="4.5" height="10" rx="2" fill="#00ff88"/>
    <rect x="41.5" y="5" width="4.5" height="10" rx="2" fill="#00ff88"/>
    <line x1="15" y1="11.5" x2="15" y2="20" stroke="#00ff88" stroke-width="3" stroke-linecap="round" opacity="0.75"/>
    <line x1="33" y1="11.5" x2="33" y2="20" stroke="#00ff88" stroke-width="3" stroke-linecap="round" opacity="0.75"/>
    <path d="M10 20 Q24 17 38 20 L38 31 Q24 34 10 31 Z" fill="#00ff88" opacity="0.35"/>
    <path d="M10 20 Q24 17 38 20" stroke="#00ff88" stroke-width="2" fill="none" opacity="0.8"/>
    <rect x="8" y="31" width="32" height="3.5" rx="1.75" fill="#00ff88" opacity="0.28"/>
    <line x1="13" y1="34.5" x2="11" y2="43" stroke="#00ff88" stroke-width="2" stroke-linecap="round" opacity="0.18"/>
    <line x1="35" y1="34.5" x2="37" y2="43" stroke="#00ff88" stroke-width="2" stroke-linecap="round" opacity="0.18"/>
  </svg>`,
  // ESPALDA — deadlift (bent-over figure lifting barbell)
  espalda: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="38" cy="9" r="4.5" fill="#00d4ff" opacity="0.85"/>
    <line x1="35" y1="13" x2="14" y2="22" stroke="#00d4ff" stroke-width="6" stroke-linecap="round" opacity="0.45"/>
    <line x1="35" y1="11" x2="14" y2="20" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
    <line x1="14" y1="22" x2="18" y2="42" stroke="#00d4ff" stroke-width="4.5" stroke-linecap="round" opacity="0.65"/>
    <line x1="14" y1="22" x2="10" y2="40" stroke="#00d4ff" stroke-width="3.5" stroke-linecap="round" opacity="0.5"/>
    <line x1="29" y1="15" x2="20" y2="30" stroke="#00d4ff" stroke-width="3" stroke-linecap="round" opacity="0.75"/>
    <rect x="6" y="30" width="22" height="3.5" rx="1.75" fill="#00d4ff" opacity="0.9"/>
    <rect x="4" y="27" width="4.5" height="9" rx="2" fill="#00d4ff"/>
    <rect x="24" y="27" width="4.5" height="9" rx="2" fill="#00d4ff"/>
  </svg>`,
  // HOMBROS — overhead press (barbell above head)
  hombros: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="5" width="40" height="3.5" rx="1.75" fill="#ff9500" opacity="0.9"/>
    <rect x="2" y="3" width="4.5" height="8" rx="2" fill="#ff9500"/>
    <rect x="41.5" y="3" width="4.5" height="8" rx="2" fill="#ff9500"/>
    <circle cx="24" cy="16" r="4" fill="#ff9500" opacity="0.85"/>
    <line x1="13" y1="8.5" x2="18" y2="20" stroke="#ff9500" stroke-width="3" stroke-linecap="round"/>
    <line x1="35" y1="8.5" x2="30" y2="20" stroke="#ff9500" stroke-width="3" stroke-linecap="round"/>
    <line x1="18" y1="20" x2="30" y2="20" stroke="#ff9500" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
    <line x1="24" y1="20" x2="24" y2="35" stroke="#ff9500" stroke-width="4.5" stroke-linecap="round" opacity="0.5"/>
    <line x1="24" y1="35" x2="17" y2="46" stroke="#ff9500" stroke-width="3.5" stroke-linecap="round" opacity="0.6"/>
    <line x1="24" y1="35" x2="31" y2="46" stroke="#ff9500" stroke-width="3.5" stroke-linecap="round" opacity="0.6"/>
  </svg>`,
  // BÍCEPS — dumbbell curl (arm curled with dumbbell)
  biceps: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" fill="#ff4488" opacity="0.85"/>
    <line x1="24" y1="11" x2="24" y2="28" stroke="#ff4488" stroke-width="4.5" stroke-linecap="round" opacity="0.45"/>
    <line x1="20" y1="13" x2="12" y2="26" stroke="#ff4488" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
    <line x1="28" y1="13" x2="32" y2="24" stroke="#ff4488" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M32 24 Q40 20 40 13" stroke="#ff4488" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M31 20 Q38 16 39 13" stroke="#ff4488" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
    <rect x="35" y="10" width="9" height="3" rx="1.5" fill="#ff4488" opacity="0.9"/>
    <rect x="34.5" y="8" width="3" height="7" rx="1" fill="#ff4488"/>
    <rect x="41" y="8" width="3" height="7" rx="1" fill="#ff4488"/>
    <line x1="24" y1="28" x2="18" y2="43" stroke="#ff4488" stroke-width="3.5" stroke-linecap="round" opacity="0.4"/>
    <line x1="24" y1="28" x2="30" y2="43" stroke="#ff4488" stroke-width="3.5" stroke-linecap="round" opacity="0.4"/>
  </svg>`,
  // TRÍCEPS — cable rope pushdown
  triceps: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="2" width="20" height="5" rx="2.5" fill="#aa44ff" opacity="0.45"/>
    <rect x="20" y="7" width="3" height="10" rx="1.5" fill="#aa44ff" opacity="0.55"/>
    <rect x="25" y="7" width="3" height="10" rx="1.5" fill="#aa44ff" opacity="0.55"/>
    <circle cx="24" cy="6" r="3.5" fill="#aa44ff" opacity="0.85"/>
    <line x1="20" y1="10" x2="17" y2="21" stroke="#aa44ff" stroke-width="3" stroke-linecap="round"/>
    <line x1="28" y1="10" x2="31" y2="21" stroke="#aa44ff" stroke-width="3" stroke-linecap="round"/>
    <line x1="17" y1="21" x2="17" y2="34" stroke="#aa44ff" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
    <line x1="31" y1="21" x2="31" y2="34" stroke="#aa44ff" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
    <path d="M17 34 L13 40 M31 34 L35 40" stroke="#aa44ff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="24" y1="10" x2="24" y2="28" stroke="#aa44ff" stroke-width="4" stroke-linecap="round" opacity="0.38"/>
    <line x1="24" y1="28" x2="17" y2="44" stroke="#aa44ff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    <line x1="24" y1="28" x2="31" y2="44" stroke="#aa44ff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  </svg>`,
  // PIERNAS — barbell squat (figure in squat position)
  piernas: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="13" width="40" height="3.5" rx="1.75" fill="#ffdd00" opacity="0.9"/>
    <rect x="2" y="10" width="4.5" height="9" rx="2" fill="#ffdd00"/>
    <rect x="41.5" y="10" width="4.5" height="9" rx="2" fill="#ffdd00"/>
    <circle cx="24" cy="7" r="4" fill="#ffdd00" opacity="0.85"/>
    <line x1="24" y1="11" x2="22" y2="21" stroke="#ffdd00" stroke-width="4.5" stroke-linecap="round" opacity="0.6"/>
    <line x1="22" y1="21" x2="13" y2="35" stroke="#ffdd00" stroke-width="4.5" stroke-linecap="round" opacity="0.75"/>
    <line x1="22" y1="21" x2="31" y2="35" stroke="#ffdd00" stroke-width="4.5" stroke-linecap="round" opacity="0.75"/>
    <line x1="13" y1="35" x2="14" y2="46" stroke="#ffdd00" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
    <line x1="31" y1="35" x2="30" y2="46" stroke="#ffdd00" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
    <line x1="11" y1="46" x2="18" y2="46" stroke="#ffdd00" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
    <line x1="27" y1="46" x2="34" y2="46" stroke="#ffdd00" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
  </svg>`,
  // GLÚTEOS — hip thrust (bridge position with barbell)
  gluteos: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="22" width="20" height="4.5" rx="2.25" fill="#ff7744" opacity="0.4"/>
    <circle cx="5" cy="20" r="3.5" fill="#ff7744" opacity="0.8"/>
    <line x1="8" y1="23" x2="26" y2="16" stroke="#ff7744" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
    <line x1="8" y1="21" x2="26" y2="14" stroke="#ff7744" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
    <rect x="13" y="11" width="28" height="4" rx="2" fill="#ff7744" opacity="0.85"/>
    <rect x="11" y="9" width="4.5" height="8" rx="2" fill="#ff7744"/>
    <rect x="36.5" y="9" width="4.5" height="8" rx="2" fill="#ff7744"/>
    <line x1="26" y1="18" x2="32" y2="34" stroke="#ff7744" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
    <line x1="32" y1="34" x2="32" y2="45" stroke="#ff7744" stroke-width="4" stroke-linecap="round" opacity="0.65"/>
    <line x1="4" y1="45" x2="44" y2="45" stroke="#ff7744" stroke-width="1.5" opacity="0.2"/>
  </svg>`,
  // CORE — plank position (full body horizontal)
  core: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="20" r="4" fill="#44ffdd" opacity="0.85"/>
    <line x1="11" y1="22" x2="38" y2="27" stroke="#44ffdd" stroke-width="7" stroke-linecap="round" opacity="0.4"/>
    <line x1="11" y1="20" x2="38" y2="25" stroke="#44ffdd" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <line x1="22" y1="22" x2="22" y2="27" stroke="#44ffdd" stroke-width="1.5" opacity="0.5"/>
    <line x1="27" y1="23" x2="27" y2="28" stroke="#44ffdd" stroke-width="1.5" opacity="0.5"/>
    <line x1="32" y1="24" x2="32" y2="29" stroke="#44ffdd" stroke-width="1.5" opacity="0.5"/>
    <line x1="12" y1="26" x2="20" y2="35" stroke="#44ffdd" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="20" y1="35" x2="4" y2="38" stroke="#44ffdd" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
    <line x1="38" y1="27" x2="41" y2="38" stroke="#44ffdd" stroke-width="3.5" stroke-linecap="round" opacity="0.65"/>
    <line x1="4" y1="38" x2="44" y2="40" stroke="#44ffdd" stroke-width="1.5" opacity="0.25"/>
  </svg>`,
  // CARDIO — dynamic running figure
  cardio: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="33" cy="7" r="4" fill="#88aaff" opacity="0.85"/>
    <line x1="31" y1="11" x2="24" y2="24" stroke="#88aaff" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
    <line x1="29" y1="13" x2="38" y2="22" stroke="#88aaff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="38" y1="22" x2="42" y2="16" stroke="#88aaff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="27" y1="16" x2="16" y2="22" stroke="#88aaff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="16" y1="22" x2="10" y2="30" stroke="#88aaff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="24" y1="24" x2="15" y2="36" stroke="#88aaff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
    <line x1="15" y1="36" x2="8" y2="44" stroke="#88aaff" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
    <line x1="24" y1="24" x2="32" y2="36" stroke="#88aaff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
    <line x1="32" y1="36" x2="40" y2="44" stroke="#88aaff" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
  </svg>`,
}

export const exercises: Exercise[] = [
  // PECHO (10)
  { id: 'pecho-01', nameEs: 'Press de Banca', muscleGroup: 'pecho', primaryMuscles: ['Pectoral mayor'], equipment: 'Barra', icon: svgs.pecho },
  { id: 'pecho-02', nameEs: 'Press Inclinado DB', muscleGroup: 'pecho', primaryMuscles: ['Pectoral superior'], equipment: 'Mancuernas', icon: svgs.pecho },
  { id: 'pecho-03', nameEs: 'Press de Mancuernas', muscleGroup: 'pecho', primaryMuscles: ['Pectoral mayor'], equipment: 'Mancuernas', icon: svgs.pecho },
  { id: 'pecho-04', nameEs: 'Aperturas Cable', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Cable', icon: svgs.pecho },
  { id: 'pecho-05', nameEs: 'Aperturas DB', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Mancuernas', icon: svgs.pecho },
  { id: 'pecho-06', nameEs: 'Fondos en Paralelas', muscleGroup: 'pecho', primaryMuscles: ['Pectoral inferior'], equipment: 'Paralelas', icon: svgs.pecho },
  { id: 'pecho-07', nameEs: 'Flexiones', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Peso corporal', icon: svgs.pecho },
  { id: 'pecho-08', nameEs: 'Press Declinado', muscleGroup: 'pecho', primaryMuscles: ['Pectoral inferior'], equipment: 'Barra', icon: svgs.pecho },
  { id: 'pecho-09', nameEs: 'Pec Deck', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Máquina', icon: svgs.pecho },
  { id: 'pecho-10', nameEs: 'Press Inclinado Barra', muscleGroup: 'pecho', primaryMuscles: ['Pectoral superior'], equipment: 'Barra', icon: svgs.pecho },
  // ESPALDA (10)
  { id: 'espalda-01', nameEs: 'Peso Muerto', muscleGroup: 'espalda', primaryMuscles: ['Erector espinal', 'Trapecios'], equipment: 'Barra', icon: svgs.espalda },
  { id: 'espalda-02', nameEs: 'Remo con Barra', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Barra', icon: svgs.espalda },
  { id: 'espalda-03', nameEs: 'Remo Mancuerna', muscleGroup: 'espalda', primaryMuscles: ['Dorsal'], equipment: 'Mancuerna', icon: svgs.espalda },
  { id: 'espalda-04', nameEs: 'Dominadas', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Bíceps'], equipment: 'Barra fija', icon: svgs.espalda },
  { id: 'espalda-05', nameEs: 'Jalón Frontal', muscleGroup: 'espalda', primaryMuscles: ['Dorsal'], equipment: 'Cable', icon: svgs.espalda },
  { id: 'espalda-06', nameEs: 'Remo Cable', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Cable', icon: svgs.espalda },
  { id: 'espalda-07', nameEs: 'Remo T', muscleGroup: 'espalda', primaryMuscles: ['Dorsal medio'], equipment: 'Barra T', icon: svgs.espalda },
  { id: 'espalda-08', nameEs: 'Chin-ups', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Bíceps'], equipment: 'Barra fija', icon: svgs.espalda },
  { id: 'espalda-09', nameEs: 'Face Pulls', muscleGroup: 'espalda', primaryMuscles: ['Deltoides posterior'], equipment: 'Cable', icon: svgs.espalda },
  { id: 'espalda-10', nameEs: 'Pullover', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Pectoral'], equipment: 'Mancuerna', icon: svgs.espalda },
  // HOMBROS (9)
  { id: 'hombros-01', nameEs: 'Press Militar', muscleGroup: 'hombros', primaryMuscles: ['Deltoides frontal'], equipment: 'Barra', icon: svgs.hombros },
  { id: 'hombros-02', nameEs: 'Press DB Hombro', muscleGroup: 'hombros', primaryMuscles: ['Deltoides'], equipment: 'Mancuernas', icon: svgs.hombros },
  { id: 'hombros-03', nameEs: 'Arnold Press', muscleGroup: 'hombros', primaryMuscles: ['Deltoides completo'], equipment: 'Mancuernas', icon: svgs.hombros },
  { id: 'hombros-04', nameEs: 'Elevación Lateral', muscleGroup: 'hombros', primaryMuscles: ['Deltoides lateral'], equipment: 'Mancuernas', icon: svgs.hombros },
  { id: 'hombros-05', nameEs: 'Elevación Frontal', muscleGroup: 'hombros', primaryMuscles: ['Deltoides frontal'], equipment: 'Mancuernas', icon: svgs.hombros },
  { id: 'hombros-06', nameEs: 'Pájaros', muscleGroup: 'hombros', primaryMuscles: ['Deltoides posterior'], equipment: 'Mancuernas', icon: svgs.hombros },
  { id: 'hombros-07', nameEs: 'Remo Vertical', muscleGroup: 'hombros', primaryMuscles: ['Deltoides', 'Trapecios'], equipment: 'Barra', icon: svgs.hombros },
  { id: 'hombros-08', nameEs: 'Elevación Lateral Cable', muscleGroup: 'hombros', primaryMuscles: ['Deltoides lateral'], equipment: 'Cable', icon: svgs.hombros },
  { id: 'hombros-09', nameEs: 'Press Máquina', muscleGroup: 'hombros', primaryMuscles: ['Deltoides'], equipment: 'Máquina', icon: svgs.hombros },
  // BICEPS (8)
  { id: 'biceps-01', nameEs: 'Curl Barra', muscleGroup: 'biceps', primaryMuscles: ['Bíceps braquial'], equipment: 'Barra', icon: svgs.biceps },
  { id: 'biceps-02', nameEs: 'Curl Mancuerna', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Mancuernas', icon: svgs.biceps },
  { id: 'biceps-03', nameEs: 'Curl Martillo', muscleGroup: 'biceps', primaryMuscles: ['Braquial', 'Braquiorradial'], equipment: 'Mancuernas', icon: svgs.biceps },
  { id: 'biceps-04', nameEs: 'Curl EZ', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Barra EZ', icon: svgs.biceps },
  { id: 'biceps-05', nameEs: 'Curl Predicador', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Banco predicador', icon: svgs.biceps },
  { id: 'biceps-06', nameEs: 'Curl Concentrado', muscleGroup: 'biceps', primaryMuscles: ['Bíceps pico'], equipment: 'Mancuerna', icon: svgs.biceps },
  { id: 'biceps-07', nameEs: 'Curl Cable', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Cable', icon: svgs.biceps },
  { id: 'biceps-08', nameEs: 'Curl Inclinado', muscleGroup: 'biceps', primaryMuscles: ['Bíceps largo'], equipment: 'Mancuernas', icon: svgs.biceps },
  // TRICEPS (8)
  { id: 'triceps-01', nameEs: 'Extensión Cuerda', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Cable', icon: svgs.triceps },
  { id: 'triceps-02', nameEs: 'Press Cerrado', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Barra', icon: svgs.triceps },
  { id: 'triceps-03', nameEs: 'Press Francés', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Barra EZ', icon: svgs.triceps },
  { id: 'triceps-04', nameEs: 'Extensión Overhead DB', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Mancuerna', icon: svgs.triceps },
  { id: 'triceps-05', nameEs: 'Fondos Tríceps', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Banco', icon: svgs.triceps },
  { id: 'triceps-06', nameEs: 'Kickback', muscleGroup: 'triceps', primaryMuscles: ['Tríceps lateral'], equipment: 'Mancuerna', icon: svgs.triceps },
  { id: 'triceps-07', nameEs: 'Extensión V-Bar', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Cable', icon: svgs.triceps },
  { id: 'triceps-08', nameEs: 'Máquina Tríceps', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Máquina', icon: svgs.triceps },
  // PIERNAS (12)
  { id: 'piernas-01', nameEs: 'Sentadilla', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Barra', icon: svgs.piernas },
  { id: 'piernas-02', nameEs: 'Sentadilla Frontal', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Barra', icon: svgs.piernas },
  { id: 'piernas-03', nameEs: 'Prensa Piernas', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Máquina', icon: svgs.piernas },
  { id: 'piernas-04', nameEs: 'Extensión Cuádriceps', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Máquina', icon: svgs.piernas },
  { id: 'piernas-05', nameEs: 'Curl Isquiotibiales', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales'], equipment: 'Máquina', icon: svgs.piernas },
  { id: 'piernas-06', nameEs: 'Peso Muerto Rumano', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales', 'Glúteos'], equipment: 'Barra', icon: svgs.piernas },
  { id: 'piernas-07', nameEs: 'Zancadas', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Peso corporal', icon: svgs.piernas },
  { id: 'piernas-08', nameEs: 'Sentadilla Búlg ara', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Mancuernas', icon: svgs.piernas },
  { id: 'piernas-09', nameEs: 'Hack Squat', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Máquina', icon: svgs.piernas },
  { id: 'piernas-10', nameEs: 'Hip Thrust', muscleGroup: 'piernas', primaryMuscles: ['Glúteos', 'Isquiotibiales'], equipment: 'Barra', icon: svgs.piernas },
  { id: 'piernas-11', nameEs: 'Elevación Pantorrilla', muscleGroup: 'piernas', primaryMuscles: ['Gemelos'], equipment: 'Máquina', icon: svgs.piernas },
  { id: 'piernas-12', nameEs: 'Curl Sentado', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales'], equipment: 'Máquina', icon: svgs.piernas },
  // GLUTEOS (6)
  { id: 'gluteos-01', nameEs: 'Hip Thrust Glúteo', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Barra', icon: svgs.gluteos },
  { id: 'gluteos-02', nameEs: 'Glute Bridge', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos'], equipment: 'Peso corporal', icon: svgs.gluteos },
  { id: 'gluteos-03', nameEs: 'Cable Kickback', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Cable', icon: svgs.gluteos },
  { id: 'gluteos-04', nameEs: 'Abductor Máquina', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo medio'], equipment: 'Máquina', icon: svgs.gluteos },
  { id: 'gluteos-05', nameEs: 'Peso Muerto Sumo', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos', 'Isquiotibiales'], equipment: 'Barra', icon: svgs.gluteos },
  { id: 'gluteos-06', nameEs: 'Subida Escalón', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos', 'Cuádriceps'], equipment: 'Cajón', icon: svgs.gluteos },
  // CORE (11)
  { id: 'core-01', nameEs: 'Rueda Abdominal', muscleGroup: 'core', primaryMuscles: ['Core completo'], equipment: 'Rueda', icon: svgs.core },
  { id: 'core-02', nameEs: 'Crunch Cable', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Cable', icon: svgs.core },
  { id: 'core-03', nameEs: 'Plancha', muscleGroup: 'core', primaryMuscles: ['Core', 'Transverso'], equipment: 'Peso corporal', icon: svgs.core },
  { id: 'core-04', nameEs: 'Elevación Piernas Colgante', muscleGroup: 'core', primaryMuscles: ['Recto abdominal inferior'], equipment: 'Barra fija', icon: svgs.core },
  { id: 'core-05', nameEs: 'Russian Twist', muscleGroup: 'core', primaryMuscles: ['Oblicuos'], equipment: 'Peso corporal', icon: svgs.core },
  { id: 'core-06', nameEs: 'Crunch Declinado', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Banco', icon: svgs.core },
  { id: 'core-07', nameEs: 'Press Pallof', muscleGroup: 'core', primaryMuscles: ['Core anti-rotacional'], equipment: 'Cable', icon: svgs.core },
  { id: 'core-08', nameEs: 'Flexión Lateral DB', muscleGroup: 'core', primaryMuscles: ['Oblicuos'], equipment: 'Mancuerna', icon: svgs.core },
  { id: 'core-09', nameEs: 'Mountain Climbers', muscleGroup: 'core', primaryMuscles: ['Core', 'Cardio'], equipment: 'Peso corporal', icon: svgs.core },
  { id: 'core-10', nameEs: 'Dead Bug', muscleGroup: 'core', primaryMuscles: ['Core profundo'], equipment: 'Peso corporal', icon: svgs.core },
  { id: 'core-11', nameEs: 'Crunch Máquina', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Máquina', icon: svgs.core },
  // CARDIO (5)
  { id: 'cardio-01', nameEs: 'Cinta Correr', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Cinta', icon: svgs.cardio },
  { id: 'cardio-02', nameEs: 'Bicicleta Estática', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Bicicleta', icon: svgs.cardio },
  { id: 'cardio-03', nameEs: 'Remo Máquina', muscleGroup: 'cardio', primaryMuscles: ['Full body', 'Cardio'], equipment: 'Remo', icon: svgs.cardio },
  { id: 'cardio-04', nameEs: 'Elíptica', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Elíptica', icon: svgs.cardio },
  { id: 'cardio-05', nameEs: 'Saltar Cuerda', muscleGroup: 'cardio', primaryMuscles: ['Gemelos', 'Cardio'], equipment: 'Cuerda', icon: svgs.cardio },
]
