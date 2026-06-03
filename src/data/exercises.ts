import type { Exercise } from '../types'

const IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

// SVG stick figures per muscle group
const svgs: Record<string, string> = {
  pecho: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" stroke="#00ff88" stroke-width="2"/>
    <line x1="24" y1="11" x2="24" y2="28" stroke="#00ff88" stroke-width="2"/>
    <line x1="8" y1="16" x2="40" y2="16" stroke="#00ff88" stroke-width="2.5"/>
    <line x1="8" y1="14" x2="8" y2="22" stroke="#00ff88" stroke-width="2"/>
    <line x1="40" y1="14" x2="40" y2="22" stroke="#00ff88" stroke-width="2"/>
    <line x1="24" y1="28" x2="16" y2="42" stroke="#00ff88" stroke-width="2"/>
    <line x1="24" y1="28" x2="32" y2="42" stroke="#00ff88" stroke-width="2"/>
    <rect x="4" y="20" width="8" height="4" rx="1" fill="#00ff88" opacity="0.3"/>
    <rect x="36" y="20" width="8" height="4" rx="1" fill="#00ff88" opacity="0.3"/>
  </svg>`,
  espalda: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" stroke="#00d4ff" stroke-width="2"/>
    <line x1="24" y1="11" x2="24" y2="28" stroke="#00d4ff" stroke-width="2"/>
    <line x1="10" y1="18" x2="38" y2="18" stroke="#00d4ff" stroke-width="2.5"/>
    <line x1="24" y1="11" x2="10" y2="18" stroke="#00d4ff" stroke-width="2"/>
    <line x1="24" y1="11" x2="38" y2="18" stroke="#00d4ff" stroke-width="2"/>
    <line x1="10" y1="18" x2="6" y2="28" stroke="#00d4ff" stroke-width="2"/>
    <line x1="38" y1="18" x2="42" y2="28" stroke="#00d4ff" stroke-width="2"/>
    <line x1="24" y1="28" x2="16" y2="42" stroke="#00d4ff" stroke-width="2"/>
    <line x1="24" y1="28" x2="32" y2="42" stroke="#00d4ff" stroke-width="2"/>
  </svg>`,
  hombros: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" stroke="#ff9500" stroke-width="2"/>
    <line x1="24" y1="11" x2="24" y2="28" stroke="#ff9500" stroke-width="2"/>
    <line x1="24" y1="13" x2="8" y2="20" stroke="#ff9500" stroke-width="2.5"/>
    <line x1="24" y1="13" x2="40" y2="20" stroke="#ff9500" stroke-width="2.5"/>
    <line x1="8" y1="20" x2="4" y2="14" stroke="#ff9500" stroke-width="2"/>
    <line x1="40" y1="20" x2="44" y2="14" stroke="#ff9500" stroke-width="2"/>
    <circle cx="4" cy="13" r="2" fill="#ff9500" opacity="0.5"/>
    <circle cx="44" cy="13" r="2" fill="#ff9500" opacity="0.5"/>
    <line x1="24" y1="28" x2="16" y2="42" stroke="#ff9500" stroke-width="2"/>
    <line x1="24" y1="28" x2="32" y2="42" stroke="#ff9500" stroke-width="2"/>
  </svg>`,
  biceps: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" stroke="#ff4488" stroke-width="2"/>
    <line x1="24" y1="11" x2="24" y2="28" stroke="#ff4488" stroke-width="2"/>
    <line x1="24" y1="14" x2="8" y2="20" stroke="#ff4488" stroke-width="2"/>
    <path d="M8 20 Q4 26 8 30" stroke="#ff4488" stroke-width="2.5" fill="none"/>
    <line x1="8" y1="30" x2="12" y2="24" stroke="#ff4488" stroke-width="2"/>
    <line x1="24" y1="14" x2="40" y2="20" stroke="#ff4488" stroke-width="2"/>
    <path d="M40 20 Q44 26 40 30" stroke="#ff4488" stroke-width="2.5" fill="none"/>
    <line x1="40" y1="30" x2="36" y2="24" stroke="#ff4488" stroke-width="2"/>
    <line x1="24" y1="28" x2="16" y2="42" stroke="#ff4488" stroke-width="2"/>
    <line x1="24" y1="28" x2="32" y2="42" stroke="#ff4488" stroke-width="2"/>
  </svg>`,
  triceps: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" stroke="#aa44ff" stroke-width="2"/>
    <line x1="24" y1="11" x2="24" y2="28" stroke="#aa44ff" stroke-width="2"/>
    <line x1="24" y1="14" x2="8" y2="20" stroke="#aa44ff" stroke-width="2"/>
    <line x1="8" y1="20" x2="6" y2="30" stroke="#aa44ff" stroke-width="2.5"/>
    <line x1="6" y1="30" x2="14" y2="28" stroke="#aa44ff" stroke-width="2"/>
    <line x1="24" y1="14" x2="40" y2="20" stroke="#aa44ff" stroke-width="2"/>
    <line x1="40" y1="20" x2="42" y2="30" stroke="#aa44ff" stroke-width="2.5"/>
    <line x1="42" y1="30" x2="34" y2="28" stroke="#aa44ff" stroke-width="2"/>
    <line x1="24" y1="28" x2="16" y2="42" stroke="#aa44ff" stroke-width="2"/>
    <line x1="24" y1="28" x2="32" y2="42" stroke="#aa44ff" stroke-width="2"/>
  </svg>`,
  piernas: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" stroke="#ffdd00" stroke-width="2"/>
    <line x1="24" y1="11" x2="24" y2="24" stroke="#ffdd00" stroke-width="2"/>
    <line x1="10" y1="16" x2="38" y2="16" stroke="#ffdd00" stroke-width="2"/>
    <line x1="24" y1="24" x2="16" y2="36" stroke="#ffdd00" stroke-width="2.5"/>
    <line x1="24" y1="24" x2="32" y2="36" stroke="#ffdd00" stroke-width="2.5"/>
    <line x1="16" y1="36" x2="14" y2="46" stroke="#ffdd00" stroke-width="2"/>
    <line x1="32" y1="36" x2="34" y2="46" stroke="#ffdd00" stroke-width="2"/>
    <line x1="14" y1="46" x2="20" y2="46" stroke="#ffdd00" stroke-width="2"/>
    <line x1="34" y1="46" x2="28" y2="46" stroke="#ffdd00" stroke-width="2"/>
  </svg>`,
  gluteos: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" stroke="#ff7744" stroke-width="2"/>
    <line x1="24" y1="11" x2="24" y2="24" stroke="#ff7744" stroke-width="2"/>
    <line x1="10" y1="16" x2="38" y2="16" stroke="#ff7744" stroke-width="2"/>
    <path d="M24 24 Q16 30 16 36" stroke="#ff7744" stroke-width="2.5" fill="none"/>
    <path d="M24 24 Q32 30 32 36" stroke="#ff7744" stroke-width="2.5" fill="none"/>
    <ellipse cx="20" cy="28" rx="5" ry="4" fill="#ff7744" opacity="0.2"/>
    <ellipse cx="28" cy="28" rx="5" ry="4" fill="#ff7744" opacity="0.2"/>
    <line x1="16" y1="36" x2="14" y2="46" stroke="#ff7744" stroke-width="2"/>
    <line x1="32" y1="36" x2="34" y2="46" stroke="#ff7744" stroke-width="2"/>
  </svg>`,
  core: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" stroke="#44ffdd" stroke-width="2"/>
    <line x1="24" y1="11" x2="24" y2="28" stroke="#44ffdd" stroke-width="2"/>
    <rect x="18" y="16" width="12" height="10" rx="2" stroke="#44ffdd" stroke-width="1.5" fill="#44ffdd" fill-opacity="0.1"/>
    <line x1="18" y1="19" x2="30" y2="19" stroke="#44ffdd" stroke-width="1"/>
    <line x1="18" y1="22" x2="30" y2="22" stroke="#44ffdd" stroke-width="1"/>
    <line x1="10" y1="16" x2="38" y2="16" stroke="#44ffdd" stroke-width="2"/>
    <line x1="24" y1="28" x2="16" y2="42" stroke="#44ffdd" stroke-width="2"/>
    <line x1="24" y1="28" x2="32" y2="42" stroke="#44ffdd" stroke-width="2"/>
  </svg>`,
  cardio: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="7" r="4" stroke="#88aaff" stroke-width="2"/>
    <line x1="24" y1="11" x2="22" y2="24" stroke="#88aaff" stroke-width="2"/>
    <line x1="10" y1="16" x2="26" y2="18" stroke="#88aaff" stroke-width="2"/>
    <line x1="26" y1="18" x2="38" y2="14" stroke="#88aaff" stroke-width="2"/>
    <line x1="22" y1="24" x2="14" y2="36" stroke="#88aaff" stroke-width="2"/>
    <line x1="22" y1="24" x2="32" y2="34" stroke="#88aaff" stroke-width="2.5"/>
    <line x1="14" y1="36" x2="10" y2="46" stroke="#88aaff" stroke-width="2"/>
    <line x1="32" y1="34" x2="36" y2="44" stroke="#88aaff" stroke-width="2"/>
  </svg>`,
}

export const exercises: Exercise[] = [
  // PECHO (10)
  { id: 'pecho-01', nameEs: 'Press de Banca', muscleGroup: 'pecho', primaryMuscles: ['Pectoral mayor'], equipment: 'Barra', icon: svgs.pecho, image: IMG + 'Barbell_Bench_Press_-_Medium_Grip/0.jpg' },
  { id: 'pecho-02', nameEs: 'Press Inclinado DB', muscleGroup: 'pecho', primaryMuscles: ['Pectoral superior'], equipment: 'Mancuernas', icon: svgs.pecho, image: IMG + 'Incline_Dumbbell_Press/0.jpg' },
  { id: 'pecho-03', nameEs: 'Press de Mancuernas', muscleGroup: 'pecho', primaryMuscles: ['Pectoral mayor'], equipment: 'Mancuernas', icon: svgs.pecho, image: IMG + 'Dumbbell_Bench_Press/0.jpg' },
  { id: 'pecho-04', nameEs: 'Aperturas Cable', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Cable', icon: svgs.pecho, image: IMG + 'Cable_Crossover/0.jpg' },
  { id: 'pecho-05', nameEs: 'Aperturas DB', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Mancuernas', icon: svgs.pecho, image: IMG + 'Dumbbell_Flyes/0.jpg' },
  { id: 'pecho-06', nameEs: 'Fondos en Paralelas', muscleGroup: 'pecho', primaryMuscles: ['Pectoral inferior'], equipment: 'Paralelas', icon: svgs.pecho, image: IMG + 'Chest_Dip/0.jpg' },
  { id: 'pecho-07', nameEs: 'Flexiones', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Peso corporal', icon: svgs.pecho, image: IMG + 'Push-ups/0.jpg' },
  { id: 'pecho-08', nameEs: 'Press Declinado', muscleGroup: 'pecho', primaryMuscles: ['Pectoral inferior'], equipment: 'Barra', icon: svgs.pecho, image: IMG + 'Decline_Barbell_Bench_Press/0.jpg' },
  { id: 'pecho-09', nameEs: 'Pec Deck', muscleGroup: 'pecho', primaryMuscles: ['Pectoral'], equipment: 'Máquina', icon: svgs.pecho, image: IMG + 'Pec_Deck_Fly/0.jpg' },
  { id: 'pecho-10', nameEs: 'Press Inclinado Barra', muscleGroup: 'pecho', primaryMuscles: ['Pectoral superior'], equipment: 'Barra', icon: svgs.pecho, image: IMG + 'Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg' },
  // ESPALDA (10)
  { id: 'espalda-01', nameEs: 'Peso Muerto', muscleGroup: 'espalda', primaryMuscles: ['Erector espinal', 'Trapecios'], equipment: 'Barra', icon: svgs.espalda, image: IMG + 'Barbell_Deadlift/0.jpg' },
  { id: 'espalda-02', nameEs: 'Remo con Barra', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Barra', icon: svgs.espalda, image: IMG + 'Barbell_Bent_Over_Row/0.jpg' },
  { id: 'espalda-03', nameEs: 'Remo Mancuerna', muscleGroup: 'espalda', primaryMuscles: ['Dorsal'], equipment: 'Mancuerna', icon: svgs.espalda, image: IMG + 'Bent_Over_One-Arm_Dumbbell_Row/0.jpg' },
  { id: 'espalda-04', nameEs: 'Dominadas', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Bíceps'], equipment: 'Barra fija', icon: svgs.espalda, image: IMG + 'Pull-ups/0.jpg' },
  { id: 'espalda-05', nameEs: 'Jalón Frontal', muscleGroup: 'espalda', primaryMuscles: ['Dorsal'], equipment: 'Cable', icon: svgs.espalda, image: IMG + 'Front_Lat_Pulldown/0.jpg' },
  { id: 'espalda-06', nameEs: 'Remo Cable', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Cable', icon: svgs.espalda, image: IMG + 'Seated_Cable_Rows/0.jpg' },
  { id: 'espalda-07', nameEs: 'Remo T', muscleGroup: 'espalda', primaryMuscles: ['Dorsal medio'], equipment: 'Barra T', icon: svgs.espalda, image: IMG + 'T-Bar_Row_with_Handle/0.jpg' },
  { id: 'espalda-08', nameEs: 'Chin-ups', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Bíceps'], equipment: 'Barra fija', icon: svgs.espalda, image: IMG + 'Chin-up/0.jpg' },
  { id: 'espalda-09', nameEs: 'Face Pulls', muscleGroup: 'espalda', primaryMuscles: ['Deltoides posterior'], equipment: 'Cable', icon: svgs.espalda, image: IMG + 'Face_Pull/0.jpg' },
  { id: 'espalda-10', nameEs: 'Pullover', muscleGroup: 'espalda', primaryMuscles: ['Dorsal', 'Pectoral'], equipment: 'Mancuerna', icon: svgs.espalda, image: IMG + 'Dumbbell_Pullover/0.jpg' },
  // HOMBROS (9)
  { id: 'hombros-01', nameEs: 'Press Militar', muscleGroup: 'hombros', primaryMuscles: ['Deltoides frontal'], equipment: 'Barra', icon: svgs.hombros, image: IMG + 'Barbell_Shoulder_Press_-_Medium_Grip/0.jpg' },
  { id: 'hombros-02', nameEs: 'Press DB Hombro', muscleGroup: 'hombros', primaryMuscles: ['Deltoides'], equipment: 'Mancuernas', icon: svgs.hombros, image: IMG + 'Dumbbell_Shoulder_Press/0.jpg' },
  { id: 'hombros-03', nameEs: 'Arnold Press', muscleGroup: 'hombros', primaryMuscles: ['Deltoides completo'], equipment: 'Mancuernas', icon: svgs.hombros, image: IMG + 'Arnold_Press/0.jpg' },
  { id: 'hombros-04', nameEs: 'Elevación Lateral', muscleGroup: 'hombros', primaryMuscles: ['Deltoides lateral'], equipment: 'Mancuernas', icon: svgs.hombros, image: IMG + 'Side_Lateral_Raise/0.jpg' },
  { id: 'hombros-05', nameEs: 'Elevación Frontal', muscleGroup: 'hombros', primaryMuscles: ['Deltoides frontal'], equipment: 'Mancuernas', icon: svgs.hombros, image: IMG + 'Front_Dumbbell_Raise/0.jpg' },
  { id: 'hombros-06', nameEs: 'Pájaros', muscleGroup: 'hombros', primaryMuscles: ['Deltoides posterior'], equipment: 'Mancuernas', icon: svgs.hombros, image: IMG + 'Seated_Bent-Over_Rear_Delt_Raise/0.jpg' },
  { id: 'hombros-07', nameEs: 'Remo Vertical', muscleGroup: 'hombros', primaryMuscles: ['Deltoides', 'Trapecios'], equipment: 'Barra', icon: svgs.hombros, image: IMG + 'Upright_Barbell_Row/0.jpg' },
  { id: 'hombros-08', nameEs: 'Elevación Lateral Cable', muscleGroup: 'hombros', primaryMuscles: ['Deltoides lateral'], equipment: 'Cable', icon: svgs.hombros, image: IMG + 'Cable_Lateral_Raise/0.jpg' },
  { id: 'hombros-09', nameEs: 'Press Máquina', muscleGroup: 'hombros', primaryMuscles: ['Deltoides'], equipment: 'Máquina', icon: svgs.hombros, image: IMG + 'Shoulder_Press/0.jpg' },
  // BICEPS (8)
  { id: 'biceps-01', nameEs: 'Curl Barra', muscleGroup: 'biceps', primaryMuscles: ['Bíceps braquial'], equipment: 'Barra', icon: svgs.biceps, image: IMG + 'Barbell_Curl/0.jpg' },
  { id: 'biceps-02', nameEs: 'Curl Mancuerna', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Mancuernas', icon: svgs.biceps, image: IMG + 'Dumbbell_Alternate_Bicep_Curl/0.jpg' },
  { id: 'biceps-03', nameEs: 'Curl Martillo', muscleGroup: 'biceps', primaryMuscles: ['Braquial', 'Braquiorradial'], equipment: 'Mancuernas', icon: svgs.biceps, image: IMG + 'Hammer_Curls/0.jpg' },
  { id: 'biceps-04', nameEs: 'Curl EZ', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Barra EZ', icon: svgs.biceps, image: IMG + 'EZ-Bar_Curl/0.jpg' },
  { id: 'biceps-05', nameEs: 'Curl Predicador', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Banco predicador', icon: svgs.biceps, image: IMG + 'Preacher_Curl/0.jpg' },
  { id: 'biceps-06', nameEs: 'Curl Concentrado', muscleGroup: 'biceps', primaryMuscles: ['Bíceps pico'], equipment: 'Mancuerna', icon: svgs.biceps, image: IMG + 'Concentration_Curls/0.jpg' },
  { id: 'biceps-07', nameEs: 'Curl Cable', muscleGroup: 'biceps', primaryMuscles: ['Bíceps'], equipment: 'Cable', icon: svgs.biceps, image: IMG + 'Cable_Hammer_Curls_-_Rope_Attachment/0.jpg' },
  { id: 'biceps-08', nameEs: 'Curl Inclinado', muscleGroup: 'biceps', primaryMuscles: ['Bíceps largo'], equipment: 'Mancuernas', icon: svgs.biceps, image: IMG + 'Incline_Dumbbell_Curl/0.jpg' },
  // TRICEPS (8)
  { id: 'triceps-01', nameEs: 'Extensión Cuerda', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Cable', icon: svgs.triceps, image: IMG + 'Triceps_Pushdown_-_Rope_Attachment/0.jpg' },
  { id: 'triceps-02', nameEs: 'Press Cerrado', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Barra', icon: svgs.triceps, image: IMG + 'Close-Grip_Barbell_Bench_Press/0.jpg' },
  { id: 'triceps-03', nameEs: 'Press Francés', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Barra EZ', icon: svgs.triceps, image: IMG + 'EZ-Bar_Skullcrusher/0.jpg' },
  { id: 'triceps-04', nameEs: 'Extensión Overhead DB', muscleGroup: 'triceps', primaryMuscles: ['Tríceps largo'], equipment: 'Mancuerna', icon: svgs.triceps, image: IMG + 'Dumbbell_Tricep_Overhead_Extension/0.jpg' },
  { id: 'triceps-05', nameEs: 'Fondos Tríceps', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Banco', icon: svgs.triceps, image: IMG + 'Triceps_Dip/0.jpg' },
  { id: 'triceps-06', nameEs: 'Kickback', muscleGroup: 'triceps', primaryMuscles: ['Tríceps lateral'], equipment: 'Mancuerna', icon: svgs.triceps, image: IMG + 'Tricep_Dumbbell_Kickback/0.jpg' },
  { id: 'triceps-07', nameEs: 'Extensión V-Bar', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Cable', icon: svgs.triceps, image: IMG + 'Triceps_Pushdown/0.jpg' },
  { id: 'triceps-08', nameEs: 'Máquina Tríceps', muscleGroup: 'triceps', primaryMuscles: ['Tríceps'], equipment: 'Máquina', icon: svgs.triceps, image: IMG + 'Pushdown/0.jpg' },
  // PIERNAS (12)
  { id: 'piernas-01', nameEs: 'Sentadilla', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Barra', icon: svgs.piernas, image: IMG + 'Barbell_Squat/0.jpg' },
  { id: 'piernas-02', nameEs: 'Sentadilla Frontal', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Barra', icon: svgs.piernas, image: IMG + 'Barbell_Full_Squat/0.jpg' },
  { id: 'piernas-03', nameEs: 'Prensa Piernas', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Máquina', icon: svgs.piernas, image: IMG + 'Leg_Press/0.jpg' },
  { id: 'piernas-04', nameEs: 'Extensión Cuádriceps', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Máquina', icon: svgs.piernas, image: IMG + 'Leg_Extensions/0.jpg' },
  { id: 'piernas-05', nameEs: 'Curl Isquiotibiales', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales'], equipment: 'Máquina', icon: svgs.piernas, image: IMG + 'Lying_Leg_Curls/0.jpg' },
  { id: 'piernas-06', nameEs: 'Peso Muerto Rumano', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales', 'Glúteos'], equipment: 'Barra', icon: svgs.piernas, image: IMG + 'Romanian_Deadlift/0.jpg' },
  { id: 'piernas-07', nameEs: 'Zancadas', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Peso corporal', icon: svgs.piernas, image: IMG + 'Barbell_Walking_Lunge/0.jpg' },
  { id: 'piernas-08', nameEs: 'Sentadilla Búlgara', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Mancuernas', icon: svgs.piernas, image: IMG + 'Barbell_Bulgarian_Split_Squat/0.jpg' },
  { id: 'piernas-09', nameEs: 'Hack Squat', muscleGroup: 'piernas', primaryMuscles: ['Cuádriceps'], equipment: 'Máquina', icon: svgs.piernas, image: IMG + 'Barbell_Hack_Squat/0.jpg' },
  { id: 'piernas-10', nameEs: 'Hip Thrust', muscleGroup: 'piernas', primaryMuscles: ['Glúteos', 'Isquiotibiales'], equipment: 'Barra', icon: svgs.piernas, image: IMG + 'Barbell_Hip_Thrust/0.jpg' },
  { id: 'piernas-11', nameEs: 'Elevación Pantorrilla', muscleGroup: 'piernas', primaryMuscles: ['Gemelos'], equipment: 'Máquina', icon: svgs.piernas, image: IMG + 'Standing_Calf_Raises/0.jpg' },
  { id: 'piernas-12', nameEs: 'Curl Sentado', muscleGroup: 'piernas', primaryMuscles: ['Isquiotibiales'], equipment: 'Máquina', icon: svgs.piernas, image: IMG + 'Seated_Leg_Curl/0.jpg' },
  // GLUTEOS (6)
  { id: 'gluteos-01', nameEs: 'Hip Thrust Glúteo', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Barra', icon: svgs.gluteos, image: IMG + 'Barbell_Hip_Thrust/0.jpg' },
  { id: 'gluteos-02', nameEs: 'Glute Bridge', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos'], equipment: 'Peso corporal', icon: svgs.gluteos, image: IMG + 'Glute_Bridge/0.jpg' },
  { id: 'gluteos-03', nameEs: 'Cable Kickback', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo mayor'], equipment: 'Cable', icon: svgs.gluteos, image: IMG + 'Cable_Kickback/0.jpg' },
  { id: 'gluteos-04', nameEs: 'Abductor Máquina', muscleGroup: 'gluteos', primaryMuscles: ['Glúteo medio'], equipment: 'Máquina', icon: svgs.gluteos, image: IMG + 'Adductor/0.jpg' },
  { id: 'gluteos-05', nameEs: 'Peso Muerto Sumo', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos', 'Isquiotibiales'], equipment: 'Barra', icon: svgs.gluteos, image: IMG + 'Sumo_Deadlift/0.jpg' },
  { id: 'gluteos-06', nameEs: 'Subida Escalón', muscleGroup: 'gluteos', primaryMuscles: ['Glúteos', 'Cuádriceps'], equipment: 'Cajón', icon: svgs.gluteos, image: IMG + 'Barbell_Step_Ups/0.jpg' },
  // CORE (11)
  { id: 'core-01', nameEs: 'Rueda Abdominal', muscleGroup: 'core', primaryMuscles: ['Core completo'], equipment: 'Rueda', icon: svgs.core, image: IMG + 'Ab_Roller/0.jpg' },
  { id: 'core-02', nameEs: 'Crunch Cable', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Cable', icon: svgs.core, image: IMG + 'Cable_Crunch/0.jpg' },
  { id: 'core-03', nameEs: 'Plancha', muscleGroup: 'core', primaryMuscles: ['Core', 'Transverso'], equipment: 'Peso corporal', icon: svgs.core, image: IMG + 'Plank/0.jpg' },
  { id: 'core-04', nameEs: 'Elevación Piernas Colgante', muscleGroup: 'core', primaryMuscles: ['Recto abdominal inferior'], equipment: 'Barra fija', icon: svgs.core, image: IMG + 'Hanging_Leg_Raise/0.jpg' },
  { id: 'core-05', nameEs: 'Russian Twist', muscleGroup: 'core', primaryMuscles: ['Oblicuos'], equipment: 'Peso corporal', icon: svgs.core, image: IMG + 'Weighted_Russian_Twist/0.jpg' },
  { id: 'core-06', nameEs: 'Crunch Declinado', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Banco', icon: svgs.core, image: IMG + 'Decline_Crunch/0.jpg' },
  { id: 'core-07', nameEs: 'Press Pallof', muscleGroup: 'core', primaryMuscles: ['Core anti-rotacional'], equipment: 'Cable', icon: svgs.core, image: IMG + 'Pallof_Press_with_Rotation/0.jpg' },
  { id: 'core-08', nameEs: 'Flexión Lateral DB', muscleGroup: 'core', primaryMuscles: ['Oblicuos'], equipment: 'Mancuerna', icon: svgs.core, image: IMG + 'Dumbbell_Side_Bend/0.jpg' },
  { id: 'core-09', nameEs: 'Mountain Climbers', muscleGroup: 'core', primaryMuscles: ['Core', 'Cardio'], equipment: 'Peso corporal', icon: svgs.core, image: IMG + 'Mountain_Climbers/0.jpg' },
  { id: 'core-10', nameEs: 'Dead Bug', muscleGroup: 'core', primaryMuscles: ['Core profundo'], equipment: 'Peso corporal', icon: svgs.core, image: IMG + 'Dead_Bug/0.jpg' },
  { id: 'core-11', nameEs: 'Crunch Máquina', muscleGroup: 'core', primaryMuscles: ['Recto abdominal'], equipment: 'Máquina', icon: svgs.core, image: IMG + 'Machine_Crunch/0.jpg' },
  // CARDIO (5)
  { id: 'cardio-01', nameEs: 'Cinta Correr', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Cinta', icon: svgs.cardio, image: IMG + 'Running,_Treadmill/0.jpg' },
  { id: 'cardio-02', nameEs: 'Bicicleta Estática', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Bicicleta', icon: svgs.cardio, image: IMG + 'Stationary_Bike/0.jpg' },
  { id: 'cardio-03', nameEs: 'Remo Máquina', muscleGroup: 'cardio', primaryMuscles: ['Full body', 'Cardio'], equipment: 'Remo', icon: svgs.cardio, image: IMG + 'Rowing/0.jpg' },
  { id: 'cardio-04', nameEs: 'Elíptica', muscleGroup: 'cardio', primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Elíptica', icon: svgs.cardio, image: IMG + 'Elliptical_Trainer/0.jpg' },
  { id: 'cardio-05', nameEs: 'Saltar Cuerda', muscleGroup: 'cardio', primaryMuscles: ['Gemelos', 'Cardio'], equipment: 'Cuerda', icon: svgs.cardio, image: IMG + 'Jump_Rope/0.jpg' },
]
