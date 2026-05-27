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
  // PECHO (22)
  { id: 'pecho-01', nameEs: 'Press de Banca', nameArg: 'Press de Banco', muscleGroup: 'pecho', primaryMuscles: ['Pectoral mayor'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.pecho, wgerId: 192 },
  { id: 'pecho-02', nameEs: 'Press Inclinado DB', nameArg: 'Press Inclinado', muscleGroup: 'pecho', primaryMuscles: ['Pectoral superior'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.pecho, wgerId: 314 },
  { id: 'pecho-03', nameEs: 'Press de Mancuernas', muscleGroup: 'pecho', primaryMuscles: ['Pectoral mayor'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.pecho },
  { id: 'pecho-04', nameEs: 'Aperturas Cable', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.pecho },
  { id: 'pecho-05', nameEs: 'Aperturas Mancuernas', nameArg: 'Aperturas con Mancuernas', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.pecho, wgerId: 119 },
  { id: 'pecho-06', nameEs: 'Fondos en Paralelas', muscleGroup: 'pecho', primaryMuscles: ['Pectoral inferior'], equipment: 'Paralelas', equipmentType: 'peso_corporal', icon: svgs.pecho },
  { id: 'pecho-07', nameEs: 'Flexiones', muscleGroup: 'pecho', primaryMuscles: ['Pectoral', 'Tríceps'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.pecho },
  { id: 'pecho-08', nameEs: 'Press Declinado Barra', muscleGroup: 'pecho', primaryMuscles: ['Pectoral inferior'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.pecho },
  { id: 'pecho-09', nameEs: 'Pec Deck', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.pecho },
  { id: 'pecho-10', nameEs: 'Press Inclinado Barra', muscleGroup: 'pecho', primaryMuscles: ['Pectoral superior'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.pecho },
  { id: 'pecho-11', nameEs: 'Crossover Cable Alto', muscleGroup: 'pecho', primaryMuscles: ['Pectoral inferior', 'Pectoral medio'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.pecho },
  { id: 'pecho-12', nameEs: 'Crossover Cable Bajo', muscleGroup: 'pecho', primaryMuscles: ['Pectoral superior'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.pecho },
  { id: 'pecho-13', nameEs: 'Press Declinado DB', muscleGroup: 'pecho', primaryMuscles: ['Pectoral inferior'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.pecho },
  { id: 'pecho-14', nameEs: 'Pullover Mancuerna', muscleGroup: 'pecho', primaryMuscles: ['Pectoral', 'Dorsal'], equipment: 'Mancuerna', equipmentType: 'mancuernas', icon: svgs.pecho },
  { id: 'pecho-15', nameEs: 'Flexiones Diamante', muscleGroup: 'pecho', primaryMuscles: ['Pectoral interior', 'Tríceps'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.pecho },
  { id: 'pecho-16', nameEs: 'Flexiones Inclinadas', muscleGroup: 'pecho', primaryMuscles: ['Pectoral inferior'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.pecho },
  { id: 'pecho-17', nameEs: 'Flexiones Declinadas', muscleGroup: 'pecho', primaryMuscles: ['Pectoral superior'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.pecho },
  { id: 'pecho-18', nameEs: 'Press Máquina Convergente', muscleGroup: 'pecho', primaryMuscles: ['Pectoral mayor'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.pecho },
  { id: 'pecho-19', nameEs: 'Svend Press', muscleGroup: 'pecho', primaryMuscles: ['Pectoral interior'], equipment: 'Disco', equipmentType: 'peso_corporal', icon: svgs.pecho },
  { id: 'pecho-20', nameEs: 'Press Landmine', muscleGroup: 'pecho', primaryMuscles: ['Pectoral superior', 'Hombros'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.pecho },
  { id: 'pecho-21', nameEs: 'Cable Fly Horizontal', muscleGroup: 'pecho', primaryMuscles: ['Pectoral medio'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.pecho },
  { id: 'pecho-22', nameEs: 'Floor Press', muscleGroup: 'pecho', primaryMuscles: ['Pectoral', 'Tríceps'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.pecho },

  // ESPALDA (22)
  { id: 'espalda-01', nameEs: 'Peso Muerto', muscleGroup: 'espalda', primaryMuscles: ['Erector espinal', 'Trapecios'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.espalda, wgerId: 223 },
  { id: 'espalda-02', nameEs: 'Remo con Barra', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.espalda, wgerId: 213 },
  { id: 'espalda-03', nameEs: 'Remo Mancuerna', nameArg: 'Remo con Mancuerna', muscleGroup: 'espalda', primaryMuscles: ['Dorsal'], equipment: 'Mancuerna', equipmentType: 'mancuernas', icon: svgs.espalda, wgerId: 197 },
  { id: 'espalda-04', nameEs: 'Dominadas', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Bíceps'], equipment: 'Barra fija', equipmentType: 'peso_corporal', icon: svgs.espalda, wgerId: 194 },
  { id: 'espalda-05', nameEs: 'Jalón Frontal', nameArg: 'Jalón al Pecho', muscleGroup: 'espalda', primaryMuscles: ['Dorsal'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.espalda, wgerId: 122 },
  { id: 'espalda-06', nameEs: 'Remo Cable Sentado', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.espalda },
  { id: 'espalda-07', nameEs: 'Remo T', muscleGroup: 'espalda', primaryMuscles: ['Dorsal medio'], equipment: 'Barra T', equipmentType: 'barra', icon: svgs.espalda },
  { id: 'espalda-08', nameEs: 'Chin-ups', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Bíceps'], equipment: 'Barra fija', equipmentType: 'peso_corporal', icon: svgs.espalda },
  { id: 'espalda-09', nameEs: 'Face Pulls', muscleGroup: 'espalda', primaryMuscles: ['Deltoides posterior', 'Romboides'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.espalda },
  { id: 'espalda-10', nameEs: 'Pullover Cable', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Pectoral'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.espalda },
  { id: 'espalda-11', nameEs: 'Remo Pendlay', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.espalda },
  { id: 'espalda-12', nameEs: 'Remo Inclinado Máquina', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.espalda },
  { id: 'espalda-13', nameEs: 'Hyperextensiones', muscleGroup: 'espalda', primaryMuscles: ['Erector espinal', 'Glúteos'], equipment: 'Banco romano', equipmentType: 'peso_corporal', icon: svgs.espalda },
  { id: 'espalda-14', nameEs: 'Buenos Días', muscleGroup: 'espalda', primaryMuscles: ['Erector espinal', 'Isquiotibiales'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.espalda },
  { id: 'espalda-15', nameEs: 'Encogimientos Barra', muscleGroup: 'espalda', primaryMuscles: ['Trapecios'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.espalda },
  { id: 'espalda-16', nameEs: 'Jalón Neutro', muscleGroup: 'espalda', primaryMuscles: ['Dorsal'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.espalda },
  { id: 'espalda-17', nameEs: 'Jalón Trasnuca', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Trapecios'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.espalda },
  { id: 'espalda-18', nameEs: 'Remo Unilateral Cable', muscleGroup: 'espalda', primaryMuscles: ['Dorsal'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.espalda },
  { id: 'espalda-19', nameEs: 'Superman', muscleGroup: 'espalda', primaryMuscles: ['Erector espinal', 'Glúteos'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.espalda },
  { id: 'espalda-20', nameEs: 'Meadows Row', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.espalda },
  { id: 'espalda-21', nameEs: 'Remo Inverso en Barra', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Bíceps'], equipment: 'Barra fija', equipmentType: 'peso_corporal', icon: svgs.espalda },
  { id: 'espalda-22', nameEs: 'Encogimientos Mancuernas', muscleGroup: 'espalda', primaryMuscles: ['Trapecios'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.espalda },

  // HOMBROS (20)
  { id: 'hombros-01', nameEs: 'Press Militar', muscleGroup: 'hombros', primaryMuscles: ['Deltoides frontal'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.hombros, wgerId: 58 },
  { id: 'hombros-02', nameEs: 'Press DB Hombro', muscleGroup: 'hombros', primaryMuscles: ['Deltoides'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.hombros },
  { id: 'hombros-03', nameEs: 'Arnold Press', muscleGroup: 'hombros', primaryMuscles: ['Deltoides completo'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.hombros },
  { id: 'hombros-04', nameEs: 'Elevación Lateral', nameArg: 'Elevaciones Laterales', muscleGroup: 'hombros', primaryMuscles: ['Deltoides lateral'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.hombros, wgerId: 65 },
  { id: 'hombros-05', nameEs: 'Elevación Frontal', muscleGroup: 'hombros', primaryMuscles: ['Deltoides frontal'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.hombros },
  { id: 'hombros-06', nameEs: 'Pájaros', nameArg: 'Pájaros (Posterior)', muscleGroup: 'hombros', primaryMuscles: ['Deltoides posterior'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.hombros, wgerId: 78 },
  { id: 'hombros-07', nameEs: 'Remo Vertical', muscleGroup: 'hombros', primaryMuscles: ['Deltoides', 'Trapecios'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.hombros },
  { id: 'hombros-08', nameEs: 'Elevación Lateral Cable', muscleGroup: 'hombros', primaryMuscles: ['Deltoides lateral'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.hombros },
  { id: 'hombros-09', nameEs: 'Press Máquina Hombros', muscleGroup: 'hombros', primaryMuscles: ['Deltoides'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.hombros },
  { id: 'hombros-10', nameEs: 'Elevación Frontal Barra', muscleGroup: 'hombros', primaryMuscles: ['Deltoides frontal'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.hombros },
  { id: 'hombros-11', nameEs: 'Elevación Lateral Máquina', muscleGroup: 'hombros', primaryMuscles: ['Deltoides lateral'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.hombros },
  { id: 'hombros-12', nameEs: 'Face Pull Cuerda', muscleGroup: 'hombros', primaryMuscles: ['Deltoides posterior', 'Manguito rotador'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.hombros },
  { id: 'hombros-13', nameEs: 'Cuban Press', muscleGroup: 'hombros', primaryMuscles: ['Manguito rotador', 'Deltoides'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.hombros },
  { id: 'hombros-14', nameEs: 'Push Press', muscleGroup: 'hombros', primaryMuscles: ['Deltoides', 'Tríceps'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.hombros },
  { id: 'hombros-15', nameEs: 'Elevación Posterior Máquina', muscleGroup: 'hombros', primaryMuscles: ['Deltoides posterior'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.hombros },
  { id: 'hombros-16', nameEs: 'Press Landmine Hombros', muscleGroup: 'hombros', primaryMuscles: ['Deltoides frontal', 'Trapecios'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.hombros },
  { id: 'hombros-17', nameEs: 'Pájaros en Máquina', muscleGroup: 'hombros', primaryMuscles: ['Deltoides posterior'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.hombros },
  { id: 'hombros-18', nameEs: 'Rotación Externa Cable', muscleGroup: 'hombros', primaryMuscles: ['Manguito rotador'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.hombros },
  { id: 'hombros-19', nameEs: 'Press Z (suelo)', muscleGroup: 'hombros', primaryMuscles: ['Deltoides', 'Core'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.hombros },
  { id: 'hombros-20', nameEs: 'Elevación Lateral con Inclinación', muscleGroup: 'hombros', primaryMuscles: ['Deltoides lateral'], equipment: 'Mancuerna', equipmentType: 'mancuernas', icon: svgs.hombros },

  // BÍCEPS (20)
  { id: 'biceps-01', nameEs: 'Curl Barra', nameArg: 'Curl con Barra', muscleGroup: 'biceps', primaryMuscles: ['Bíceps braquial'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.biceps, wgerId: 72 },
  { id: 'biceps-02', nameEs: 'Curl Mancuerna', nameArg: 'Curl con Mancuernas', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.biceps, wgerId: 74 },
  { id: 'biceps-03', nameEs: 'Curl Martillo', muscleGroup: 'biceps', primaryMuscles: ['Braquial', 'Braquiorradial'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.biceps },
  { id: 'biceps-04', nameEs: 'Curl EZ', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Barra EZ', equipmentType: 'barra', icon: svgs.biceps },
  { id: 'biceps-05', nameEs: 'Curl Predicador', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Banco predicador', equipmentType: 'barra', icon: svgs.biceps, wgerId: 73 },
  { id: 'biceps-06', nameEs: 'Curl Concentrado', muscleGroup: 'biceps', primaryMuscles: ['Bíceps pico'], equipment: 'Mancuerna', equipmentType: 'mancuernas', icon: svgs.biceps },
  { id: 'biceps-07', nameEs: 'Curl Cable Polea Baja', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.biceps },
  { id: 'biceps-08', nameEs: 'Curl Inclinado DB', muscleGroup: 'biceps', primaryMuscles: ['Bíceps largo'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.biceps },
  { id: 'biceps-09', nameEs: 'Curl Araña (Spider)', muscleGroup: 'biceps', primaryMuscles: ['Bíceps corto'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.biceps },
  { id: 'biceps-10', nameEs: 'Drag Curl', muscleGroup: 'biceps', primaryMuscles: ['Bíceps largo'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.biceps },
  { id: 'biceps-11', nameEs: 'Zottman Curl', muscleGroup: 'biceps', primaryMuscles: ['Bíceps', 'Braquiorradial'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.biceps },
  { id: 'biceps-12', nameEs: 'Curl 21s', muscleGroup: 'biceps', primaryMuscles: ['Bíceps completo'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.biceps },
  { id: 'biceps-13', nameEs: 'Curl Polea Alta Unilateral', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.biceps },
  { id: 'biceps-14', nameEs: 'Curl Reverso Barra', muscleGroup: 'biceps', primaryMuscles: ['Braquiorradial', 'Bíceps'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.biceps },
  { id: 'biceps-15', nameEs: 'Curl Predicador Máquina', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.biceps },
  { id: 'biceps-16', nameEs: 'Curl EZ Inclinado', muscleGroup: 'biceps', primaryMuscles: ['Bíceps largo'], equipment: 'Barra EZ', equipmentType: 'barra', icon: svgs.biceps },
  { id: 'biceps-17', nameEs: 'Curl Alterno de Pie', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.biceps },
  { id: 'biceps-18', nameEs: 'Curl con Banda Elástica', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Banda', equipmentType: 'banda', icon: svgs.biceps },
  { id: 'biceps-19', nameEs: 'Chin-up Bíceps', muscleGroup: 'biceps', primaryMuscles: ['Bíceps', 'Dorsal'], equipment: 'Barra fija', equipmentType: 'peso_corporal', icon: svgs.biceps },
  { id: 'biceps-20', nameEs: 'Curl Wrist (muñeca)', muscleGroup: 'biceps', primaryMuscles: ['Antebrazos'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.biceps },

  // TRÍCEPS (20)
  { id: 'triceps-01', nameEs: 'Extensión Cuerda', nameArg: 'Extensión Tríceps Polea', muscleGroup: 'triceps', primaryMuscles: ['Tríceps lateral'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.triceps },
  { id: 'triceps-02', nameEs: 'Press Cerrado', muscleGroup: 'triceps', primaryMuscles: ['Tríceps', 'Pectoral'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.triceps },
  { id: 'triceps-03', nameEs: 'Press Francés EZ', nameArg: 'Press Francés', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Barra EZ', equipmentType: 'barra', icon: svgs.triceps, wgerId: 67 },
  { id: 'triceps-04', nameEs: 'Extensión Overhead DB', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Mancuerna', equipmentType: 'mancuernas', icon: svgs.triceps },
  { id: 'triceps-05', nameEs: 'Fondos Tríceps Banco', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Banco', equipmentType: 'peso_corporal', icon: svgs.triceps },
  { id: 'triceps-06', nameEs: 'Kickback DB', muscleGroup: 'triceps', primaryMuscles: ['Tríceps lateral'], equipment: 'Mancuerna', equipmentType: 'mancuernas', icon: svgs.triceps },
  { id: 'triceps-07', nameEs: 'Extensión V-Bar', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.triceps },
  { id: 'triceps-08', nameEs: 'Máquina Tríceps', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.triceps },
  { id: 'triceps-09', nameEs: 'Skull Crusher', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.triceps },
  { id: 'triceps-10', nameEs: 'JM Press', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.triceps },
  { id: 'triceps-11', nameEs: 'Flexiones Diamante', muscleGroup: 'triceps', primaryMuscles: ['Tríceps', 'Pectoral'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.triceps },
  { id: 'triceps-12', nameEs: 'Extensión Polea Alta Barra', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.triceps },
  { id: 'triceps-13', nameEs: 'Tate Press', muscleGroup: 'triceps', primaryMuscles: ['Tríceps lateral'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.triceps },
  { id: 'triceps-14', nameEs: 'Extensión Overhead Cable', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.triceps },
  { id: 'triceps-15', nameEs: 'Rolling DB Extension', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.triceps },
  { id: 'triceps-16', nameEs: 'Fondos en Paralelas con Peso', nameArg: 'Fondos en Paralelas', muscleGroup: 'triceps', primaryMuscles: ['Tríceps', 'Pectoral'], equipment: 'Paralelas', equipmentType: 'peso_corporal', icon: svgs.triceps, wgerId: 200 },
  { id: 'triceps-17', nameEs: 'Extensión Declinada DB', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.triceps },
  { id: 'triceps-18', nameEs: 'Extensión Unilateral Cable', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.triceps },
  { id: 'triceps-19', nameEs: 'Skull Crusher EZ', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Barra EZ', equipmentType: 'barra', icon: svgs.triceps },
  { id: 'triceps-20', nameEs: 'Press Francés DB', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.triceps },

  // PIERNAS (27)
  { id: 'piernas-01', nameEs: 'Sentadilla', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.piernas, wgerId: 222 },
  { id: 'piernas-02', nameEs: 'Sentadilla Frontal', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.piernas },
  { id: 'piernas-03', nameEs: 'Prensa Piernas', nameArg: 'Prensa de Piernas', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas, wgerId: 227 },
  { id: 'piernas-04', nameEs: 'Extensión Cuádriceps', nameArg: 'Extensión de Cuádriceps', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas },
  { id: 'piernas-05', nameEs: 'Curl Isquiotibiales Tumbado', nameArg: 'Curl de Isquiotibiales', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas },
  { id: 'piernas-06', nameEs: 'Peso Muerto Rumano', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales', 'Glúteos'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.piernas, wgerId: 220 },
  { id: 'piernas-07', nameEs: 'Zancadas', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.piernas },
  { id: 'piernas-08', nameEs: 'Sentadilla Búlgara', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.piernas },
  { id: 'piernas-09', nameEs: 'Hack Squat', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas },
  { id: 'piernas-10', nameEs: 'Hip Thrust', muscleGroup: 'piernas', primaryMuscles: ['Glúteos', 'Isquiotibiales'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.piernas },
  { id: 'piernas-11', nameEs: 'Elevación Pantorrilla de Pie', muscleGroup: 'piernas', primaryMuscles: ['Gemelos'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas },
  { id: 'piernas-12', nameEs: 'Curl Isquiotibiales Sentado', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas },
  { id: 'piernas-13', nameEs: 'Sentadilla Sumo', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Aductores', 'Glúteos'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.piernas },
  { id: 'piernas-14', nameEs: 'Sentadilla Goblet', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Kettlebell', equipmentType: 'kettlebell', icon: svgs.piernas },
  { id: 'piernas-15', nameEs: 'Box Squat', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.piernas },
  { id: 'piernas-16', nameEs: 'Sissy Squat', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.piernas },
  { id: 'piernas-17', nameEs: 'Zancadas Caminando DB', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.piernas },
  { id: 'piernas-18', nameEs: 'Zancadas Hacia Atrás', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.piernas },
  { id: 'piernas-19', nameEs: 'Step-Up DB', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Mancuernas', equipmentType: 'mancuernas', icon: svgs.piernas },
  { id: 'piernas-20', nameEs: 'Nordic Curl', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.piernas },
  { id: 'piernas-21', nameEs: 'Peso Muerto Piernas Rígidas', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales', 'Erector espinal'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.piernas },
  { id: 'piernas-22', nameEs: 'Sentadilla Smith', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Máquina Smith', equipmentType: 'maquina', icon: svgs.piernas },
  { id: 'piernas-23', nameEs: 'Aductor Máquina', muscleGroup: 'piernas', primaryMuscles: ['Aductores'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas },
  { id: 'piernas-24', nameEs: 'Abductor Máquina', muscleGroup: 'piernas', primaryMuscles: ['Abductores', 'Glúteo medio'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas },
  { id: 'piernas-25', nameEs: 'Elevación Pantorrilla Sentado', muscleGroup: 'piernas', primaryMuscles: ['Sóleo', 'Gemelos'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas },
  { id: 'piernas-26', nameEs: 'Sentadilla Pistol', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.piernas },
  { id: 'piernas-27', nameEs: 'Leg Press 45°', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.piernas },

  // GLÚTEOS (20)
  { id: 'gluteos-01', nameEs: 'Hip Thrust Barra', nameArg: 'Hip Thrust', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.gluteos },
  { id: 'gluteos-02', nameEs: 'Glute Bridge', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.gluteos },
  { id: 'gluteos-03', nameEs: 'Cable Kickback', nameArg: 'Patada de Glúteos en Cable', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.gluteos },
  { id: 'gluteos-04', nameEs: 'Abductor Máquina', nameArg: 'Abducción en Máquina', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo medio'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.gluteos },
  { id: 'gluteos-05', nameEs: 'Peso Muerto Sumo', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos', 'Isquiotibiales'], equipment: 'Barra', equipmentType: 'barra', icon: svgs.gluteos },
  { id: 'gluteos-06', nameEs: 'Subida Escalón', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos', 'Cuádriceps'], equipment: 'Cajón', equipmentType: 'peso_corporal', icon: svgs.gluteos },
  { id: 'gluteos-07', nameEs: 'Hip Thrust con Banda', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor', 'Glúteo medio'], equipment: 'Banda', equipmentType: 'banda', icon: svgs.gluteos },
  { id: 'gluteos-08', nameEs: 'Clamshell con Banda', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo medio', 'Rotadores'], equipment: 'Banda', equipmentType: 'banda', icon: svgs.gluteos },
  { id: 'gluteos-09', nameEs: 'Donkey Kick', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.gluteos },
  { id: 'gluteos-10', nameEs: 'Fire Hydrant', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo medio'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.gluteos },
  { id: 'gluteos-11', nameEs: 'Single Leg Hip Thrust', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.gluteos },
  { id: 'gluteos-12', nameEs: 'Monster Walk Banda', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo medio', 'TFL'], equipment: 'Banda', equipmentType: 'banda', icon: svgs.gluteos },
  { id: 'gluteos-13', nameEs: 'Cable Pull Through', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos', 'Isquiotibiales'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.gluteos },
  { id: 'gluteos-14', nameEs: 'Glute Bridge Unilateral', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.gluteos },
  { id: 'gluteos-15', nameEs: 'Reverse Hyper', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos', 'Erector espinal'], equipment: 'Banco', equipmentType: 'peso_corporal', icon: svgs.gluteos },
  { id: 'gluteos-16', nameEs: 'Sentadilla Sumo DB', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos', 'Aductores'], equipment: 'Mancuerna', equipmentType: 'mancuernas', icon: svgs.gluteos },
  { id: 'gluteos-17', nameEs: 'Lateral Band Walk', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo medio'], equipment: 'Banda', equipmentType: 'banda', icon: svgs.gluteos },
  { id: 'gluteos-18', nameEs: 'Donkey Kick Cable', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.gluteos },
  { id: 'gluteos-19', nameEs: 'Hip Abduction de Pie Cable', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo medio'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.gluteos },
  { id: 'gluteos-20', nameEs: 'Glute Drive Máquina', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.gluteos },

  // CORE (25)
  { id: 'core-01', nameEs: 'Rueda Abdominal', muscleGroup: 'core', primaryMuscles: ['Core completo'], equipment: 'Rueda', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-02', nameEs: 'Crunch Cable', nameArg: 'Abdominales en Polea', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.core },
  { id: 'core-03', nameEs: 'Plancha', muscleGroup: 'core', primaryMuscles: ['Core', 'Transverso'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-04', nameEs: 'Elevación Piernas Colgante', muscleGroup: 'core', primaryMuscles: ['Recto abdominal inferior'], equipment: 'Barra fija', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-05', nameEs: 'Russian Twist', muscleGroup: 'core', primaryMuscles: ['Oblicuos'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-06', nameEs: 'Crunch Declinado', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Banco', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-07', nameEs: 'Press Pallof', muscleGroup: 'core', primaryMuscles: ['Core anti-rotacional'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.core },
  { id: 'core-08', nameEs: 'Flexión Lateral DB', muscleGroup: 'core', primaryMuscles: ['Oblicuos'], equipment: 'Mancuerna', equipmentType: 'mancuernas', icon: svgs.core },
  { id: 'core-09', nameEs: 'Mountain Climbers', muscleGroup: 'core', primaryMuscles: ['Core', 'Cardio'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-10', nameEs: 'Dead Bug', muscleGroup: 'core', primaryMuscles: ['Core profundo', 'Transverso'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-11', nameEs: 'Crunch Máquina', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Máquina', equipmentType: 'maquina', icon: svgs.core },
  { id: 'core-12', nameEs: 'Crunch Básico', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-13', nameEs: 'Crunch Inverso', muscleGroup: 'core', primaryMuscles: ['Recto abdominal inferior'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-14', nameEs: 'V-Sit', muscleGroup: 'core', primaryMuscles: ['Recto abdominal', 'Flexores de cadera'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-15', nameEs: 'Dragon Flag', muscleGroup: 'core', primaryMuscles: ['Core completo'], equipment: 'Banco', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-16', nameEs: 'Hollow Body Hold', muscleGroup: 'core', primaryMuscles: ['Core', 'Transverso'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-17', nameEs: 'Elevación Rodillas Colgante', muscleGroup: 'core', primaryMuscles: ['Recto abdominal inferior'], equipment: 'Barra fija', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-18', nameEs: 'Cable Woodchop Alto', muscleGroup: 'core', primaryMuscles: ['Oblicuos', 'Core rotacional'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.core },
  { id: 'core-19', nameEs: 'Cable Woodchop Bajo', muscleGroup: 'core', primaryMuscles: ['Oblicuos', 'Core rotacional'], equipment: 'Cable', equipmentType: 'cable', icon: svgs.core },
  { id: 'core-20', nameEs: 'Side Plank', muscleGroup: 'core', primaryMuscles: ['Oblicuos', 'Cuadrado lumbar'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-21', nameEs: 'Bird Dog', muscleGroup: 'core', primaryMuscles: ['Core profundo', 'Erector espinal'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-22', nameEs: 'Bicycle Crunch', muscleGroup: 'core', primaryMuscles: ['Oblicuos', 'Recto abdominal'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-23', nameEs: 'Copenhagen Plank', muscleGroup: 'core', primaryMuscles: ['Aductores', 'Oblicuos'], equipment: 'Banco', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-24', nameEs: 'Windshield Wipers', muscleGroup: 'core', primaryMuscles: ['Oblicuos', 'Core rotacional'], equipment: 'Barra fija', equipmentType: 'peso_corporal', icon: svgs.core },
  { id: 'core-25', nameEs: 'Suitcase Carry', muscleGroup: 'core', primaryMuscles: ['Oblicuos', 'Core lateral'], equipment: 'Mancuerna', equipmentType: 'mancuernas', icon: svgs.core },

  // CARDIO (15)
  { id: 'cardio-01', nameEs: 'Cinta Correr', nameArg: 'Cinta de Correr', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Cinta', equipmentType: 'cardio_maquina', icon: svgs.cardio },
  { id: 'cardio-02', nameEs: 'Bicicleta Estática', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Bicicleta', equipmentType: 'cardio_maquina', icon: svgs.cardio },
  { id: 'cardio-03', nameEs: 'Remo Máquina', muscleGroup: 'cardio', primaryMuscles: ['Full body', 'Cardio'], equipment: 'Remo', equipmentType: 'cardio_maquina', icon: svgs.cardio },
  { id: 'cardio-04', nameEs: 'Elíptica', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Elíptica', equipmentType: 'cardio_maquina', icon: svgs.cardio },
  { id: 'cardio-05', nameEs: 'Saltar Cuerda', muscleGroup: 'cardio', primaryMuscles: ['Gemelos', 'Cardio'], equipment: 'Cuerda', equipmentType: 'peso_corporal', icon: svgs.cardio },
  { id: 'cardio-06', nameEs: 'HIIT en Cinta', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Cinta', equipmentType: 'cardio_maquina', icon: svgs.cardio },
  { id: 'cardio-07', nameEs: 'Assault Bike', muscleGroup: 'cardio', primaryMuscles: ['Full body', 'Cardio'], equipment: 'Assault bike', equipmentType: 'cardio_maquina', icon: svgs.cardio },
  { id: 'cardio-08', nameEs: 'Stairmaster', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Glúteos', 'Cardio'], equipment: 'Stairmaster', equipmentType: 'cardio_maquina', icon: svgs.cardio },
  { id: 'cardio-09', nameEs: 'Sprints', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.cardio },
  { id: 'cardio-10', nameEs: 'Burpees', muscleGroup: 'cardio', primaryMuscles: ['Full body', 'Cardio'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.cardio },
  { id: 'cardio-11', nameEs: 'Box Jumps', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Glúteos', 'Cardio'], equipment: 'Cajón', equipmentType: 'peso_corporal', icon: svgs.cardio },
  { id: 'cardio-12', nameEs: 'Jump Squats', muscleGroup: 'cardio', primaryMuscles: ['Cuádriceps', 'Cardio'], equipment: 'Peso corporal', equipmentType: 'peso_corporal', icon: svgs.cardio },
  { id: 'cardio-13', nameEs: 'Kettlebell Swings', muscleGroup: 'cardio', primaryMuscles: ['Glúteos', 'Isquiotibiales', 'Cardio'], equipment: 'Kettlebell', equipmentType: 'kettlebell', icon: svgs.cardio },
  { id: 'cardio-14', nameEs: 'Battle Ropes', muscleGroup: 'cardio', primaryMuscles: ['Full body', 'Cardio'], equipment: 'Cuerdas', equipmentType: 'peso_corporal', icon: svgs.cardio },
  { id: 'cardio-15', nameEs: 'Salto Cuerda Doble', muscleGroup: 'cardio', primaryMuscles: ['Gemelos', 'Cardio'], equipment: 'Cuerda', equipmentType: 'peso_corporal', icon: svgs.cardio },
]
