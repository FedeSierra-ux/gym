import type { Exercise } from '../types'

export const exercises: Exercise[] = [
  // PECHO (10)
  {
    id: 'pecho-01', nameEs: 'Press de Banca', nameEn: 'Barbell Bench Press', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral mayor'], equipment: 'Barra',
    instructions: [
      'Acuéstate en el banco con los pies apoyados en el suelo.',
      'Agarra la barra con las manos a más de la anchura de los hombros.',
      'Desciende la barra lentamente hasta que toque el pecho.',
      'Empuja la barra hacia arriba de forma controlada hasta extender los codos.',
      'Mantén los omóplatos retraídos durante todo el movimiento.',
    ],
  },
  {
    id: 'pecho-02', nameEs: 'Press Inclinado DB', nameEn: 'Incline Dumbbell Press', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral superior'], equipment: 'Mancuernas',
    instructions: [
      'Ajusta el banco a 30-45° de inclinación.',
      'Coge las mancuernas a la altura del pecho con los codos a 45°.',
      'Empuja las mancuernas hacia arriba hasta casi extender los brazos.',
      'Baja lentamente hasta que los codos queden por debajo del banco.',
      'Siente el estiramiento en la parte superior del pecho.',
    ],
  },
  {
    id: 'pecho-03', nameEs: 'Press de Mancuernas', nameEn: 'Dumbbell Bench Press', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral mayor'], equipment: 'Mancuernas',
    instructions: [
      'Acuéstate en banco plano con una mancuerna en cada mano.',
      'Sube las mancuernas hasta que casi se toquen arriba.',
      'Baja despacio con control, codos a 45° del torso.',
      'Mantén los pies firmes en el suelo durante todo el recorrido.',
      'Aprieta el pecho en la parte alta del movimiento.',
    ],
  },
  {
    id: 'pecho-04', nameEs: 'Aperturas Cable', nameEn: 'Cable Crossover', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral'], equipment: 'Cable',
    instructions: [
      'Coloca las poleas en la posición más alta.',
      'De pie o inclinado, sujeta un cable en cada mano.',
      'Con los brazos ligeramente flexionados, ciérralos hacia el centro.',
      'Cruza las manos ligeramente al final del recorrido.',
      'Vuelve despacio al punto de partida controlando la tensión.',
    ],
  },
  {
    id: 'pecho-05', nameEs: 'Aperturas DB', nameEn: 'Dumbbell Flyes', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral'], equipment: 'Mancuernas',
    instructions: [
      'Acuéstate en banco plano con mancuernas extendidas sobre el pecho.',
      'Abre los brazos hacia los lados manteniendo una ligera flexión en el codo.',
      'Baja hasta sentir el estiramiento sin forzar el hombro.',
      'Eleva de vuelta apretando el pecho como si abrazaras un árbol.',
      'Controla el movimiento durante todo el recorrido.',
    ],
  },
  {
    id: 'pecho-06', nameEs: 'Fondos en Paralelas', nameEn: 'Chest Dips', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral inferior'], equipment: 'Paralelas',
    instructions: [
      'Sujétate en las paralelas con los brazos extendidos.',
      'Inclínate ligeramente hacia adelante para enfocar el pecho.',
      'Baja el cuerpo doblando los codos hasta 90°.',
      'Empuja con fuerza hacia arriba sin bloquear los codos.',
      'Mantén el torso inclinado durante todo el ejercicio.',
    ],
  },
  {
    id: 'pecho-07', nameEs: 'Flexiones', nameEn: 'Push-Up', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral'], equipment: 'Peso corporal',
    instructions: [
      'Coloca las manos un poco más anchas que los hombros.',
      'Mantén el cuerpo en línea recta de cabeza a pies.',
      'Baja el pecho hasta casi tocar el suelo.',
      'Empuja hacia arriba de forma explosiva.',
      'No dejes que las caderas caigan ni se eleven.',
    ],
  },
  {
    id: 'pecho-08', nameEs: 'Press Declinado', nameEn: 'Decline Bench Press', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral inferior'], equipment: 'Barra',
    instructions: [
      'Ajusta el banco en declive y asegura los pies.',
      'Agarra la barra con los codos ligeramente más cerrados.',
      'Baja la barra hacia la parte baja del pecho.',
      'Empuja de forma explosiva hacia arriba.',
      'Mantén los omóplatos apretados contra el banco.',
    ],
  },
  {
    id: 'pecho-09', nameEs: 'Pec Deck', nameEn: 'Pec Deck Fly', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral'], equipment: 'Máquina',
    instructions: [
      'Siéntate en la máquina y ajusta el asiento a la altura adecuada.',
      'Coloca los antebrazos en los acolchados laterales.',
      'Cierra los brazos hacia el centro con control.',
      'Aprieta el pecho al llegar al punto más cerrado.',
      'Vuelve atrás de forma controlada sin dejar caer el peso.',
    ],
  },
  {
    id: 'pecho-10', nameEs: 'Press Inclinado Barra', nameEn: 'Incline Barbell Bench Press', muscleGroup: 'pecho',
    primaryMuscles: ['Pectoral superior'], equipment: 'Barra',
    instructions: [
      'Ajusta el banco a 30-45° de inclinación.',
      'Agarra la barra a la misma anchura que el press de banca.',
      'Baja la barra hasta la parte superior del pecho.',
      'Empuja hacia arriba y ligeramente hacia atrás.',
      'Mantén la tensión en la parte clavicular del pectoral.',
    ],
  },

  // ESPALDA (10)
  {
    id: 'espalda-01', nameEs: 'Peso Muerto', nameEn: 'Deadlift', muscleGroup: 'espalda',
    primaryMuscles: ['Erector espinal', 'Trapecios'], equipment: 'Barra',
    instructions: [
      'Párate con los pies a la anchura de caderas y la barra sobre los pies.',
      'Agáchate manteniendo la espalda recta y agarra la barra.',
      'Empuja el suelo con los pies mientras extiendes las caderas y rodillas.',
      'Mantén la barra pegada al cuerpo durante todo el ascenso.',
      'Extiende completamente caderas y rodillas arriba. Baja con control.',
    ],
  },
  {
    id: 'espalda-02', nameEs: 'Remo con Barra', nameEn: 'Bent Over Row', muscleGroup: 'espalda',
    primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Barra',
    instructions: [
      'Párate con los pies a la anchura de hombros.',
      'Inclínate hacia adelante manteniendo la espalda recta.',
      'Tira de la barra hacia el ombligo apretando los codos.',
      'Siente la contracción en la parte media de la espalda.',
      'Baja la barra de forma controlada hasta el estiramiento completo.',
    ],
  },
  {
    id: 'espalda-03', nameEs: 'Remo Mancuerna', nameEn: 'One Arm Dumbbell Row', muscleGroup: 'espalda',
    primaryMuscles: ['Dorsal'], equipment: 'Mancuerna',
    instructions: [
      'Apoya una rodilla y mano en el banco.',
      'Con la mano libre sujeta la mancuerna.',
      'Tira de la mancuerna hacia la cadera sin rotar el torso.',
      'Aprieta el dorsal en el punto más alto.',
      'Baja lentamente para sentir el estiramiento.',
    ],
  },
  {
    id: 'espalda-04', nameEs: 'Dominadas', nameEn: 'Pull-Up', muscleGroup: 'espalda',
    primaryMuscles: ['Dorsal', 'Bíceps'], equipment: 'Barra fija',
    instructions: [
      'Cuelga de la barra con agarre prono a la anchura de hombros.',
      'Inicia el movimiento retrayendo los omóplatos.',
      'Tira del cuerpo hacia arriba hasta que la barbilla supere la barra.',
      'Mantén el core apretado durante todo el movimiento.',
      'Baja de forma controlada hasta el estiramiento completo.',
    ],
  },
  {
    id: 'espalda-05', nameEn: 'Lat Pulldown', nameEs: 'Jalón Frontal', muscleGroup: 'espalda',
    primaryMuscles: ['Dorsal'], equipment: 'Cable',
    instructions: [
      'Siéntate en la máquina y agarra la barra con las manos más anchas que los hombros.',
      'Inclínate ligeramente hacia atrás.',
      'Tira de la barra hacia el pecho superior apretando los codos hacia abajo.',
      'Aprieta los dorsales en el punto más bajo.',
      'Sube controlando el peso hasta extender los brazos.',
    ],
  },
  {
    id: 'espalda-06', nameEs: 'Remo Cable', nameEn: 'Seated Cable Row', muscleGroup: 'espalda',
    primaryMuscles: ['Dorsal', 'Romboides'], equipment: 'Cable',
    instructions: [
      'Siéntate en la máquina con las rodillas ligeramente flexionadas.',
      'Agarra el accesorio y saca el pecho.',
      'Tira del cable hacia el abdomen apretando los codos.',
      'Mantén la espalda recta y no te balancees.',
      'Extiende lentamente los brazos para el estiramiento.',
    ],
  },
  {
    id: 'espalda-07', nameEs: 'Remo T', nameEn: 'T-Bar Row', muscleGroup: 'espalda',
    primaryMuscles: ['Dorsal medio'], equipment: 'Barra T',
    instructions: [
      'Sitúate sobre la barra T con las piernas semiflexionadas.',
      'Agarra las asas y mantén la espalda a unos 45°.',
      'Tira del peso hacia el pecho apretando los omóplatos.',
      'Mantén la posición durante un segundo en la contracción.',
      'Baja con control sin dejar que el torso se desplome.',
    ],
  },
  {
    id: 'espalda-08', nameEs: 'Chin-ups', nameEn: 'Chin-Up', muscleGroup: 'espalda',
    primaryMuscles: ['Dorsal', 'Bíceps'], equipment: 'Barra fija',
    instructions: [
      'Cuelga de la barra con agarre supino (palmas hacia ti).',
      'Activa el core y retrae los omóplatos.',
      'Tira del cuerpo hacia arriba hasta que la barbilla supere la barra.',
      'Controla el descenso durante al menos 2 segundos.',
      'Estira completamente los brazos abajo antes de la siguiente repetición.',
    ],
  },
  {
    id: 'espalda-09', nameEs: 'Face Pulls', nameEn: 'Face Pull', muscleGroup: 'espalda',
    primaryMuscles: ['Deltoides posterior'], equipment: 'Cable',
    instructions: [
      'Coloca la cuerda en polea alta.',
      'Agarra la cuerda con ambas manos y da un paso atrás.',
      'Tira de la cuerda hacia la cara separando las manos.',
      'Aprieta los músculos del hombro posterior al final.',
      'Extiende los brazos lentamente hacia la polea.',
    ],
  },
  {
    id: 'espalda-10', nameEs: 'Pullover', nameEn: 'Dumbbell Pullover', muscleGroup: 'espalda',
    primaryMuscles: ['Dorsal', 'Pectoral'], equipment: 'Mancuerna',
    instructions: [
      'Acuéstate perpendicular al banco, con la cabeza y cuello en el borde.',
      'Sujeta la mancuerna con ambas manos sobre el pecho.',
      'Baja la mancuerna por detrás de la cabeza manteniendo los codos ligeramente flexionados.',
      'Siente el estiramiento del dorsal.',
      'Trae la mancuerna de vuelta sobre el pecho apretando el dorsal.',
    ],
  },

  // HOMBROS (9)
  {
    id: 'hombros-01', nameEs: 'Press Militar', nameEn: 'Military Press', muscleGroup: 'hombros',
    primaryMuscles: ['Deltoides frontal'], equipment: 'Barra',
    instructions: [
      'Párate con los pies a la anchura de hombros.',
      'Agarra la barra a la anchura de los hombros frente al cuello.',
      'Empuja la barra verticalmente por encima de la cabeza.',
      'Extiende completamente los brazos sin bloquear los codos.',
      'Baja la barra lentamente hasta la altura del mentón.',
    ],
  },
  {
    id: 'hombros-02', nameEs: 'Press DB Hombro', nameEn: 'Dumbbell Shoulder Press', muscleGroup: 'hombros',
    primaryMuscles: ['Deltoides'], equipment: 'Mancuernas',
    instructions: [
      'Siéntate en banco con respaldo vertical.',
      'Sujeta las mancuernas a la altura de las orejas con los codos a 90°.',
      'Empuja ambas mancuernas hacia arriba.',
      'Casi júntalas en lo alto sin bloquear los codos.',
      'Baja de forma controlada hasta la posición inicial.',
    ],
  },
  {
    id: 'hombros-03', nameEs: 'Arnold Press', nameEn: 'Arnold Press', muscleGroup: 'hombros',
    primaryMuscles: ['Deltoides completo'], equipment: 'Mancuernas',
    instructions: [
      'Siéntate sosteniendo las mancuernas frente a ti con las palmas mirando hacia ti.',
      'Al empujar hacia arriba, rota las muñecas hasta que las palmas miren al frente.',
      'Extiende los brazos completamente arriba.',
      'Al bajar, rota de vuelta a la posición inicial.',
      'Controla la rotación durante todo el movimiento.',
    ],
  },
  {
    id: 'hombros-04', nameEs: 'Elevación Lateral', nameEn: 'Lateral Raise', muscleGroup: 'hombros',
    primaryMuscles: ['Deltoides lateral'], equipment: 'Mancuernas',
    instructions: [
      'Párate con una mancuerna en cada mano a los lados.',
      'Con los codos ligeramente flexionados, eleva los brazos hacia los lados.',
      'Lleva los brazos hasta la altura de los hombros.',
      'El meñique debe quedar ligeramente más alto que el pulgar.',
      'Baja lentamente durante 2-3 segundos.',
    ],
  },
  {
    id: 'hombros-05', nameEs: 'Elevación Frontal', nameEn: 'Front Raise', muscleGroup: 'hombros',
    primaryMuscles: ['Deltoides frontal'], equipment: 'Mancuernas',
    instructions: [
      'Sujeta las mancuernas frente a los muslos.',
      'Con los codos casi extendidos, eleva un brazo hacia el frente.',
      'Llega hasta la altura de los hombros.',
      'Baja de forma controlada y alterna con el otro brazo.',
      'Mantén el torso estable sin balancearte.',
    ],
  },
  {
    id: 'hombros-06', nameEs: 'Pájaros', nameEn: 'Reverse Fly', muscleGroup: 'hombros',
    primaryMuscles: ['Deltoides posterior'], equipment: 'Mancuernas',
    instructions: [
      'Inclínate hacia adelante hasta que el torso quede paralelo al suelo.',
      'Sujeta mancuernas ligeras con los brazos colgando.',
      'Eleva los brazos hacia los lados hasta la altura de los hombros.',
      'Aprieta los deltoides posteriores en el punto más alto.',
      'Baja lentamente con control.',
    ],
  },
  {
    id: 'hombros-07', nameEs: 'Remo Vertical', nameEn: 'Upright Row', muscleGroup: 'hombros',
    primaryMuscles: ['Deltoides', 'Trapecios'], equipment: 'Barra',
    instructions: [
      'Párate con la barra frente a los muslos.',
      'Tira de la barra verticalmente hasta la altura del mentón.',
      'Los codos deben subir más alto que la barra.',
      'Mantén la barra cerca del cuerpo.',
      'Baja de forma controlada.',
    ],
  },
  {
    id: 'hombros-08', nameEs: 'Elevación Lateral Cable', nameEn: 'Cable Lateral Raise', muscleGroup: 'hombros',
    primaryMuscles: ['Deltoides lateral'], equipment: 'Cable',
    instructions: [
      'Coloca la polea baja y sujeta el cable con la mano opuesta.',
      'Eleva el brazo hacia el lado hasta la altura del hombro.',
      'Mantén el codo ligeramente flexionado.',
      'Controla el descenso resistiendo la polea.',
      'Mantén el torso estático durante el movimiento.',
    ],
  },
  {
    id: 'hombros-09', nameEs: 'Press Máquina', nameEn: 'Machine Shoulder Press', muscleGroup: 'hombros',
    primaryMuscles: ['Deltoides'], equipment: 'Máquina',
    instructions: [
      'Ajusta el asiento para que las asas queden a la altura de los hombros.',
      'Empuja las asas hacia arriba hasta casi extender los brazos.',
      'Baja de forma controlada sin que el peso descanse entre repeticiones.',
      'Mantén la espalda pegada al respaldo.',
      'Aprieta los hombros en la parte más alta.',
    ],
  },

  // BICEPS (8)
  {
    id: 'biceps-01', nameEs: 'Curl Barra', nameEn: 'Barbell Curl', muscleGroup: 'biceps',
    primaryMuscles: ['Bíceps braquial'], equipment: 'Barra',
    instructions: [
      'Párate con la barra sujeta con agarre supino.',
      'Mantén los codos pegados a los costados.',
      'Flexiona los codos para subir la barra hacia los hombros.',
      'Aprieta el bíceps en la contracción máxima.',
      'Baja lentamente en 2-3 segundos.',
    ],
  },
  {
    id: 'biceps-02', nameEs: 'Curl Mancuerna', nameEn: 'Dumbbell Curl', muscleGroup: 'biceps',
    primaryMuscles: ['Bíceps'], equipment: 'Mancuernas',
    instructions: [
      'Sujeta una mancuerna en cada mano con el agarre supino.',
      'Flexiona un brazo mientras el otro baja.',
      'Gira levemente la muñeca al subir para mayor contracción.',
      'Alterna los brazos de forma fluida.',
      'Mantén los codos fijos sin moverlos hacia adelante.',
    ],
  },
  {
    id: 'biceps-03', nameEs: 'Curl Martillo', nameEn: 'Hammer Curl', muscleGroup: 'biceps',
    primaryMuscles: ['Braquial', 'Braquiorradial'], equipment: 'Mancuernas',
    instructions: [
      'Sujeta las mancuernas con el pulgar apuntando arriba.',
      'Flexiona los codos manteniendo la muñeca neutra.',
      'Trabaja el braquial y el antebrazo.',
      'Baja controlado hasta la extensión completa.',
      'Puedes hacer las repeticiones simultáneas o alternadas.',
    ],
  },
  {
    id: 'biceps-04', nameEs: 'Curl EZ', nameEn: 'EZ Bar Curl', muscleGroup: 'biceps',
    primaryMuscles: ['Bíceps'], equipment: 'Barra EZ',
    instructions: [
      'Sujeta la barra EZ por los ángulos exteriores.',
      'El agarre EZ reduce el estrés en las muñecas.',
      'Flexiona los codos llevando la barra hacia los hombros.',
      'Aprieta fuerte en la parte alta.',
      'Baja en 3 segundos para mayor tensión.',
    ],
  },
  {
    id: 'biceps-05', nameEs: 'Curl Predicador', nameEn: 'Preacher Curl', muscleGroup: 'biceps',
    primaryMuscles: ['Bíceps'], equipment: 'Banco predicador',
    instructions: [
      'Apoya la parte posterior de los brazos en el banco predicador.',
      'Sujeta la barra o mancuernas con agarre supino.',
      'Flexiona los codos lentamente hacia arriba.',
      'El movimiento es más corto pero la tensión es constante.',
      'Baja completamente para el estiramiento máximo.',
    ],
  },
  {
    id: 'biceps-06', nameEs: 'Curl Concentrado', nameEn: 'Concentration Curl', muscleGroup: 'biceps',
    primaryMuscles: ['Bíceps pico'], equipment: 'Mancuerna',
    instructions: [
      'Siéntate en el banco con las piernas abiertas.',
      'Apoya el codo en la cara interna del muslo.',
      'Flexiona el brazo llevando la mancuerna hacia el hombro.',
      'Gira ligeramente la muñeca en el punto más alto.',
      'Baja lentamente para maximizar el estiramiento.',
    ],
  },
  {
    id: 'biceps-07', nameEs: 'Curl Cable', nameEn: 'Cable Curl', muscleGroup: 'biceps',
    primaryMuscles: ['Bíceps'], equipment: 'Cable',
    instructions: [
      'Ajusta la polea baja y sujeta el accesorio.',
      'Párate derecho y flexiona los codos.',
      'La tensión del cable es constante en todo el recorrido.',
      'Aprieta fuerte en la parte alta.',
      'Controla la bajada resistiendo el cable.',
    ],
  },
  {
    id: 'biceps-08', nameEs: 'Curl Inclinado', nameEn: 'Incline Dumbbell Curl', muscleGroup: 'biceps',
    primaryMuscles: ['Bíceps largo'], equipment: 'Mancuernas',
    instructions: [
      'Ajusta el banco a unos 45-60° de inclinación.',
      'Acuéstate hacia atrás con los brazos colgando.',
      'Flexiona los codos hacia arriba.',
      'El estiramiento inicial del bíceps es mayor en esta posición.',
      'Baja lentamente para aprovechar el recorrido completo.',
    ],
  },

  // TRICEPS (8)
  {
    id: 'triceps-01', nameEs: 'Extensión Cuerda', nameEn: 'Triceps Rope Pushdown', muscleGroup: 'triceps',
    primaryMuscles: ['Tríceps'], equipment: 'Cable',
    instructions: [
      'Sujeta la cuerda en polea alta.',
      'Mantén los codos pegados a los costados.',
      'Extiende los brazos hacia abajo separando la cuerda al final.',
      'Aprieta los tríceps en la extensión máxima.',
      'Flexiona los codos controlando el retorno.',
    ],
  },
  {
    id: 'triceps-02', nameEs: 'Press Cerrado', nameEn: 'Close Grip Bench Press', muscleGroup: 'triceps',
    primaryMuscles: ['Tríceps'], equipment: 'Barra',
    instructions: [
      'Acuéstate en banco con la barra a la anchura de los hombros.',
      'Baja la barra al pecho manteniendo los codos cerca del cuerpo.',
      'Empuja la barra hacia arriba enfocándote en los tríceps.',
      'No lleves los codos hacia afuera.',
      'Controla el descenso en todo momento.',
    ],
  },
  {
    id: 'triceps-03', nameEs: 'Press Francés', nameEn: 'Skull Crushers', muscleGroup: 'triceps',
    primaryMuscles: ['Tríceps largo'], equipment: 'Barra EZ',
    instructions: [
      'Acuéstate en banco con la barra EZ sobre el pecho.',
      'Mantén los codos apuntando al techo.',
      'Baja la barra hacia la frente flexionando los codos.',
      'Empuja de vuelta extendiendo los codos.',
      'Mantén los brazos en la misma posición durante todo el movimiento.',
    ],
  },
  {
    id: 'triceps-04', nameEs: 'Extensión Overhead DB', nameEn: 'Overhead Triceps Extension', muscleGroup: 'triceps',
    primaryMuscles: ['Tríceps largo'], equipment: 'Mancuerna',
    instructions: [
      'Siéntate sosteniendo la mancuerna con ambas manos sobre la cabeza.',
      'Los codos deben apuntar hacia arriba.',
      'Baja la mancuerna detrás de la cabeza.',
      'Extiende los codos para subir.',
      'Este ejercicio estira el tríceps largo al máximo.',
    ],
  },
  {
    id: 'triceps-05', nameEs: 'Fondos Tríceps', nameEn: 'Triceps Dips', muscleGroup: 'triceps',
    primaryMuscles: ['Tríceps'], equipment: 'Banco',
    instructions: [
      'Apoya las manos en el banco con los dedos hacia adelante.',
      'Extiende las piernas frente a ti.',
      'Baja el cuerpo flexionando los codos hasta 90°.',
      'Empuja hacia arriba con los tríceps.',
      'Para más dificultad, eleva los pies en otro banco.',
    ],
  },
  {
    id: 'triceps-06', nameEs: 'Kickback', nameEn: 'Triceps Kickback', muscleGroup: 'triceps',
    primaryMuscles: ['Tríceps lateral'], equipment: 'Mancuerna',
    instructions: [
      'Inclínate hacia adelante apoyando una mano en el banco.',
      'Lleva el codo al nivel de la cadera con el brazo flexionado.',
      'Extiende el antebrazo hacia atrás.',
      'Aprieta los tríceps en la extensión máxima.',
      'Mantén el brazo superior paralelo al suelo en todo momento.',
    ],
  },
  {
    id: 'triceps-07', nameEs: 'Extensión V-Bar', nameEn: 'Triceps Pushdown', muscleGroup: 'triceps',
    primaryMuscles: ['Tríceps'], equipment: 'Cable',
    instructions: [
      'Sujeta el accesorio en V en polea alta.',
      'Mantén los codos pegados al cuerpo.',
      'Extiende los brazos hacia abajo.',
      'Aprieta los tríceps y mantén 1 segundo.',
      'Flexiona de vuelta de forma controlada.',
    ],
  },
  {
    id: 'triceps-08', nameEs: 'Máquina Tríceps', nameEn: 'Triceps Machine', muscleGroup: 'triceps',
    primaryMuscles: ['Tríceps'], equipment: 'Máquina',
    instructions: [
      'Ajusta el asiento para que los codos queden en el acolchado.',
      'Sujeta las asas y extiende los brazos hacia abajo.',
      'Aprieta los tríceps en el punto más bajo.',
      'Controla el retorno sin dejar que el peso caiga.',
      'Mantén la espalda apoyada en el respaldo.',
    ],
  },

  // PIERNAS (12)
  {
    id: 'piernas-01', nameEs: 'Sentadilla', nameEn: 'Barbell Squat', muscleGroup: 'piernas',
    primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Barra',
    instructions: [
      'Coloca la barra en los trapecios y da un paso atrás.',
      'Abre los pies a la anchura de los hombros con las puntas ligeramente hacia afuera.',
      'Baja como si fueras a sentarte, rodillas siguiendo la dirección de los pies.',
      'Lleva los muslos paralelos al suelo o más abajo.',
      'Empuja el suelo con los talones para subir.',
    ],
  },
  {
    id: 'piernas-02', nameEs: 'Sentadilla Frontal', nameEn: 'Front Squat', muscleGroup: 'piernas',
    primaryMuscles: ['Cuádriceps'], equipment: 'Barra',
    instructions: [
      'Coloca la barra sobre los deltoides frontales.',
      'Los codos deben apuntar hacia adelante para mantener la barra.',
      'Desciende manteniendo el torso más vertical.',
      'Las rodillas viajan más hacia adelante en esta variante.',
      'Empuja hacia arriba manteniendo los codos altos.',
    ],
  },
  {
    id: 'piernas-03', nameEs: 'Prensa Piernas', nameEn: 'Leg Press', muscleGroup: 'piernas',
    primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Máquina',
    instructions: [
      'Ajusta el asiento y coloca los pies en la plataforma.',
      'Pies a la anchura de hombros, puntas ligeramente abiertas.',
      'Baja la plataforma flexionando las rodillas hacia el pecho.',
      'Empuja con los talones hasta casi extender las rodillas.',
      'No bloquees completamente las rodillas arriba.',
    ],
  },
  {
    id: 'piernas-04', nameEs: 'Extensión Cuádriceps', nameEn: 'Leg Extension', muscleGroup: 'piernas',
    primaryMuscles: ['Cuádriceps'], equipment: 'Máquina',
    instructions: [
      'Siéntate en la máquina con el respaldo cómodo.',
      'Coloca los pies bajo el acolchado.',
      'Extiende las rodillas hasta casi bloquearlas.',
      'Aprieta los cuádriceps en la extensión máxima.',
      'Baja controlando el peso durante 3 segundos.',
    ],
  },
  {
    id: 'piernas-05', nameEs: 'Curl Isquiotibiales', nameEn: 'Lying Leg Curl', muscleGroup: 'piernas',
    primaryMuscles: ['Isquiotibiales'], equipment: 'Máquina',
    instructions: [
      'Túmbate boca abajo en la máquina.',
      'Coloca los tobillos bajo el acolchado.',
      'Flexiona las rodillas llevando los talones hacia los glúteos.',
      'Aprieta los isquiotibiales al final.',
      'Baja lentamente resistiendo el peso.',
    ],
  },
  {
    id: 'piernas-06', nameEs: 'Peso Muerto Rumano', nameEn: 'Romanian Deadlift', muscleGroup: 'piernas',
    primaryMuscles: ['Isquiotibiales', 'Glúteos'], equipment: 'Barra',
    instructions: [
      'Párate con la barra frente a los muslos.',
      'Con las rodillas levemente flexionadas, desliza la barra por las piernas.',
      'Inclínate hacia adelante manteniendo la espalda recta.',
      'Siente el estiramiento en los isquiotibiales.',
      'Activa los glúteos para volver a la posición inicial.',
    ],
  },
  {
    id: 'piernas-07', nameEs: 'Zancadas', nameEn: 'Lunge', muscleGroup: 'piernas',
    primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Peso corporal',
    instructions: [
      'Párate derecho con los pies juntos.',
      'Da un paso largo hacia adelante.',
      'Baja la rodilla trasera casi hasta el suelo.',
      'Empuja con el pie delantero para volver.',
      'Alterna las piernas o completa todas las reps de un lado.',
    ],
  },
  {
    id: 'piernas-08', nameEs: 'Sentadilla Búlgara', nameEn: 'Bulgarian Split Squat', muscleGroup: 'piernas',
    primaryMuscles: ['Cuádriceps', 'Glúteos'], equipment: 'Mancuernas',
    instructions: [
      'Coloca el pie trasero en un banco.',
      'Da un paso largo hacia adelante con el pie de apoyo.',
      'Baja flexionando la rodilla delantera hasta 90°.',
      'Empuja con el talón del pie delantero para subir.',
      'Mantén el torso erguido durante todo el movimiento.',
    ],
  },
  {
    id: 'piernas-09', nameEs: 'Hack Squat', nameEn: 'Hack Squat', muscleGroup: 'piernas',
    primaryMuscles: ['Cuádriceps'], equipment: 'Máquina',
    instructions: [
      'Coloca los hombros bajo los acolchados.',
      'Pies en el centro de la plataforma a la anchura de hombros.',
      'Baja flexionando las rodillas hasta 90° o más.',
      'Empuja hacia arriba sin bloquear las rodillas.',
      'Mantén la espalda apoyada en todo momento.',
    ],
  },
  {
    id: 'piernas-10', nameEs: 'Hip Thrust', nameEn: 'Barbell Hip Thrust', muscleGroup: 'piernas',
    primaryMuscles: ['Glúteos', 'Isquiotibiales'], equipment: 'Barra',
    instructions: [
      'Apoya la espalda alta en el banco con la barra sobre las caderas.',
      'Pies apoyados en el suelo a la anchura de caderas.',
      'Baja las caderas hacia el suelo.',
      'Empuja las caderas hacia arriba apretando los glúteos.',
      'Mantén la barbilla metida y los pies firmes.',
    ],
  },
  {
    id: 'piernas-11', nameEs: 'Elevación Pantorrilla', nameEn: 'Calf Raise', muscleGroup: 'piernas',
    primaryMuscles: ['Gemelos'], equipment: 'Máquina',
    instructions: [
      'Coloca los antepies en el borde de la plataforma.',
      'Baja los talones hasta sentir el estiramiento.',
      'Elévate lo más alto posible sobre los antepies.',
      'Mantén 1 segundo arriba apretando los gemelos.',
      'Baja despacio para el estiramiento completo.',
    ],
  },
  {
    id: 'piernas-12', nameEs: 'Curl Sentado', nameEn: 'Seated Leg Curl', muscleGroup: 'piernas',
    primaryMuscles: ['Isquiotibiales'], equipment: 'Máquina',
    instructions: [
      'Siéntate en la máquina con los muslos bajo el acolchado.',
      'Coloca los talones sobre el rodillo inferior.',
      'Flexiona las rodillas hacia abajo.',
      'Aprieta los isquiotibiales en la flexión máxima.',
      'Controla el retorno durante 2-3 segundos.',
    ],
  },

  // GLUTEOS (6)
  {
    id: 'gluteos-01', nameEs: 'Hip Thrust Glúteo', nameEn: 'Hip Thrust', muscleGroup: 'gluteos',
    primaryMuscles: ['Glúteo mayor'], equipment: 'Barra',
    instructions: [
      'Apoya la espalda alta en el banco con la barra sobre las caderas.',
      'Usa un pad acolchado para proteger las caderas.',
      'Empuja las caderas hacia arriba apretando fuerte los glúteos.',
      'Mantén las rodillas a 90° en la parte más alta.',
      'Baja controlado y repite.',
    ],
  },
  {
    id: 'gluteos-02', nameEs: 'Glute Bridge', nameEn: 'Glute Bridge', muscleGroup: 'gluteos',
    primaryMuscles: ['Glúteos'], equipment: 'Peso corporal',
    instructions: [
      'Túmbate boca arriba con las rodillas flexionadas.',
      'Pies apoyados en el suelo a la anchura de caderas.',
      'Eleva las caderas apretando los glúteos.',
      'Mantén la posición 2 segundos en lo alto.',
      'Baja lentamente hasta casi tocar el suelo.',
    ],
  },
  {
    id: 'gluteos-03', nameEs: 'Cable Kickback', nameEn: 'Cable Glute Kickback', muscleGroup: 'gluteos',
    primaryMuscles: ['Glúteo mayor'], equipment: 'Cable',
    instructions: [
      'Coloca el tobillo en el accesorio de la polea baja.',
      'Inclínate ligeramente hacia adelante apoyándote.',
      'Lleva la pierna hacia atrás extendida.',
      'Aprieta el glúteo al final del recorrido.',
      'Baja controlando la resistencia del cable.',
    ],
  },
  {
    id: 'gluteos-04', nameEs: 'Abductor Máquina', nameEn: 'Hip Abduction Machine', muscleGroup: 'gluteos',
    primaryMuscles: ['Glúteo medio'], equipment: 'Máquina',
    instructions: [
      'Siéntate en la máquina con las rodillas contra los acolchados.',
      'Abre las piernas hacia los lados.',
      'Aprieta los glúteos medios al final del recorrido.',
      'Vuelve lentamente a la posición inicial sin dejar caer el peso.',
      'Mantén la espalda apoyada en el respaldo.',
    ],
  },
  {
    id: 'gluteos-05', nameEs: 'Peso Muerto Sumo', nameEn: 'Sumo Deadlift', muscleGroup: 'gluteos',
    primaryMuscles: ['Glúteos', 'Isquiotibiales'], equipment: 'Barra',
    instructions: [
      'Abre los pies más de lo normal con los pies rotados hacia afuera.',
      'Agarra la barra entre las piernas.',
      'Empuja el suelo con los pies activando los glúteos.',
      'Extiende caderas y rodillas a la vez.',
      'Baja de forma controlada manteniendo la espalda recta.',
    ],
  },
  {
    id: 'gluteos-06', nameEs: 'Subida Escalón', nameEn: 'Step-Up', muscleGroup: 'gluteos',
    primaryMuscles: ['Glúteos', 'Cuádriceps'], equipment: 'Cajón',
    instructions: [
      'Párate frente a un cajón o escalón.',
      'Sube un pie sobre el cajón.',
      'Empuja con el talón del pie elevado para subir.',
      'Lleva la otra rodilla hacia el pecho en la subida.',
      'Baja de forma controlada y alterna piernas.',
    ],
  },

  // CORE (11)
  {
    id: 'core-01', nameEs: 'Rueda Abdominal', nameEn: 'Ab Wheel Rollout', muscleGroup: 'core',
    primaryMuscles: ['Core completo'], equipment: 'Rueda',
    instructions: [
      'Arrodíllate con la rueda frente a ti.',
      'Rueda hacia adelante extendiendo el cuerpo.',
      'Llega lo más lejos posible sin arquear la espalda.',
      'Activa el core para volver a la posición inicial.',
      'Nunca dejes que las caderas caigan.',
    ],
  },
  {
    id: 'core-02', nameEs: 'Crunch Cable', nameEn: 'Cable Crunch', muscleGroup: 'core',
    primaryMuscles: ['Recto abdominal'], equipment: 'Cable',
    instructions: [
      'Arrodíllate frente a la polea alta con la cuerda sobre la cabeza.',
      'Flexiona el torso hacia abajo.',
      'Aprieta los abdominales en la posición más baja.',
      'Vuelve arriba de forma controlada.',
      'No tires con los brazos, el movimiento viene del core.',
    ],
  },
  {
    id: 'core-03', nameEs: 'Plancha', nameEn: 'Plank', muscleGroup: 'core',
    primaryMuscles: ['Core', 'Transverso'], equipment: 'Peso corporal',
    instructions: [
      'Apoya los antebrazos y los pies en el suelo.',
      'El cuerpo debe formar una línea recta.',
      'Aprieta el core, glúteos y cuádriceps.',
      'Mantén la posición sin dejar caer las caderas.',
      'Respira de forma continua durante el tiempo de plancha.',
    ],
  },
  {
    id: 'core-04', nameEs: 'Elevación Piernas Colgante', nameEn: 'Hanging Leg Raise', muscleGroup: 'core',
    primaryMuscles: ['Recto abdominal inferior'], equipment: 'Barra fija',
    instructions: [
      'Cuelga de la barra con los brazos extendidos.',
      'Eleva las piernas rectas (o con rodillas flexionadas) hasta la horizontal.',
      'Aprieta los abdominales en la posición más alta.',
      'Baja las piernas lentamente con control.',
      'Evita el balanceo usando el momentum.',
    ],
  },
  {
    id: 'core-05', nameEs: 'Russian Twist', nameEn: 'Russian Twist', muscleGroup: 'core',
    primaryMuscles: ['Oblicuos'], equipment: 'Peso corporal',
    instructions: [
      'Siéntate con las rodillas flexionadas.',
      'Inclínate ligeramente hacia atrás.',
      'Rota el torso de lado a lado.',
      'Para mayor dificultad, eleva los pies del suelo.',
      'Mantén el core apretado durante todo el movimiento.',
    ],
  },
  {
    id: 'core-06', nameEs: 'Crunch Declinado', nameEn: 'Decline Crunch', muscleGroup: 'core',
    primaryMuscles: ['Recto abdominal'], equipment: 'Banco',
    instructions: [
      'Ajusta el banco en declive y asegura los pies.',
      'Con las manos en la sien, flexiona el torso hacia las rodillas.',
      'Aprieta los abdominales en la contracción máxima.',
      'Baja lentamente hasta el estiramiento.',
      'Evita tirar del cuello con las manos.',
    ],
  },
  {
    id: 'core-07', nameEs: 'Press Pallof', nameEn: 'Pallof Press', muscleGroup: 'core',
    primaryMuscles: ['Core anti-rotacional'], equipment: 'Cable',
    instructions: [
      'Coloca la polea a la altura del pecho.',
      'Párate de lado a la polea.',
      'Sujeta el cable con ambas manos frente al pecho.',
      'Extiende los brazos al frente.',
      'Vuelve al pecho. El core resiste la rotación en todo momento.',
    ],
  },
  {
    id: 'core-08', nameEs: 'Flexión Lateral DB', nameEn: 'Dumbbell Side Bend', muscleGroup: 'core',
    primaryMuscles: ['Oblicuos'], equipment: 'Mancuerna',
    instructions: [
      'Párate con una mancuerna en una mano.',
      'Inclínate hacia el lado de la mancuerna controlando el movimiento.',
      'Vuelve arriba activando el oblicuo del lado contrario.',
      'Haz todas las repeticiones de un lado antes de cambiar.',
      'No te inclines hacia adelante ni atrás.',
    ],
  },
  {
    id: 'core-09', nameEs: 'Mountain Climbers', nameEn: 'Mountain Climbers', muscleGroup: 'core',
    primaryMuscles: ['Core', 'Cardio'], equipment: 'Peso corporal',
    instructions: [
      'Adopta la posición de plancha con los brazos extendidos.',
      'Lleva una rodilla hacia el pecho.',
      'Cambia rápidamente de pierna como si corrieras.',
      'Mantén las caderas bajas en todo momento.',
      'Cuanto más rápido, mayor el componente cardiovascular.',
    ],
  },
  {
    id: 'core-10', nameEs: 'Dead Bug', nameEn: 'Dead Bug', muscleGroup: 'core',
    primaryMuscles: ['Core profundo'], equipment: 'Peso corporal',
    instructions: [
      'Túmbate boca arriba con los brazos al techo y las rodillas a 90°.',
      'Baja simultáneamente el brazo derecho y la pierna izquierda.',
      'Acerca el brazo al suelo y la pierna a 5cm del suelo.',
      'Vuelve al centro y alterna lados.',
      'Mantén siempre la espalda baja pegada al suelo.',
    ],
  },
  {
    id: 'core-11', nameEs: 'Crunch Máquina', nameEn: 'Machine Crunch', muscleGroup: 'core',
    primaryMuscles: ['Recto abdominal'], equipment: 'Máquina',
    instructions: [
      'Siéntate en la máquina y sujeta las asas.',
      'Flexiona el torso hacia adelante.',
      'Aprieta los abdominales en el punto más bajo.',
      'Vuelve arriba de forma controlada.',
      'Ajusta el peso para hacer 12-15 reps con buena técnica.',
    ],
  },

  // CARDIO (5)
  {
    id: 'cardio-01', nameEs: 'Cinta Correr', nameEn: 'Running', muscleGroup: 'cardio',
    primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Cinta',
    instructions: [
      'Comienza caminando para calentar durante 2-3 minutos.',
      'Aumenta la velocidad gradualmente.',
      'Mantén una postura erguida con los brazos en movimiento.',
      'Aterriza con el mediopié, no con el talón.',
      'Finaliza con 2-3 minutos de caminata para enfriar.',
    ],
  },
  {
    id: 'cardio-02', nameEs: 'Bicicleta Estática', nameEn: 'Stationary Bike', muscleGroup: 'cardio',
    primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Bicicleta',
    instructions: [
      'Ajusta el asiento para que la rodilla quede levemente flexionada en la bajada.',
      'Pedalea a un ritmo constante durante el calentamiento.',
      'Aumenta la resistencia para intervalos de alta intensidad.',
      'Mantén el torso relajado, no te apoyes en el manillar.',
      'Finaliza con 3 minutos de pedaleo suave.',
    ],
  },
  {
    id: 'cardio-03', nameEs: 'Remo Máquina', nameEn: 'Rowing Machine', muscleGroup: 'cardio',
    primaryMuscles: ['Full body', 'Cardio'], equipment: 'Remo',
    instructions: [
      'Siéntate y sujeta los remos con los pies asegurados.',
      'Inicia el movimiento empujando con las piernas.',
      'Inclínate hacia atrás y tira de los remos hacia el abdomen.',
      'Extiende los brazos y vuelve hacia adelante.',
      'El 60% del trabajo lo hacen las piernas.',
    ],
  },
  {
    id: 'cardio-04', nameEs: 'Elíptica', nameEn: 'Elliptical', muscleGroup: 'cardio',
    primaryMuscles: ['Piernas', 'Cardio'], equipment: 'Elíptica',
    instructions: [
      'Ajusta el nivel de resistencia según tu condición.',
      'Mantén el torso erguido durante el movimiento.',
      'Usa los mangos móviles para involucrar la parte superior.',
      'Pedalea hacia adelante para cuádriceps y hacia atrás para glúteos.',
      'Mantén una cadencia constante de 60-80 rpm.',
    ],
  },
  {
    id: 'cardio-05', nameEs: 'Saltar Cuerda', nameEn: 'Jump Rope', muscleGroup: 'cardio',
    primaryMuscles: ['Gemelos', 'Cardio'], equipment: 'Cuerda',
    instructions: [
      'Agarra las asas con ambas manos.',
      'Salta con ambos pies a la vez al inicio.',
      'Aterriza suavemente sobre los antepies.',
      'Mantén los codos cerca del cuerpo y gira solo las muñecas.',
      'Aumenta la velocidad progresivamente.',
    ],
  },
]
