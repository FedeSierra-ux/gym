# GymPro

App de entrenamiento (PWA) en React + TypeScript + Vite. Todo se guarda en el dispositivo:
no hay backend ni cuentas.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # tsc -b + vite build
npm run lint
```

## Ilustraciones de los ejercicios

Los dibujos salen de [Workout Guide](https://bryllim.github.io/workout-guide/) de Bryl Lim
(**CC BY-SA 4.0**, con parte de las poses derivadas de
[Everkinetic](https://github.com/everkinetic/data), también CC BY-SA 4.0). La atribución
está a la vista en Ajustes → Créditos, como pide la licencia.

De cada uno de los 302 ejercicios del catálogo copiamos dos frames (inicio y final del
movimiento) a `public/exercise-frames/`, redimensionados a 256 px. La app los alterna para
mostrar el movimiento, así que **no depende de los GIFs remotos de ExerciseDB ni de la API
de wger** y funciona sin conexión.

Para regenerarlos:

```bash
npm i --no-save @bryllim/workout-guide   # el paquete pesa 34 MB, no queda como dependencia
node scripts/sync-exercise-frames.mjs
```

El script copia los frames y regenera `src/data/exerciseFrames.ts` (mapa de ejercicio base
→ dibujo, y el catálogo completo que se usa para adivinar el dibujo de los ejercicios que
crea el usuario).

## Ejercicios propios

Se puede armar una rutina escribiendo sólo el nombre del ejercicio:

- en el detalle de la rutina, campo *"…o escribí el nombre y listo"*;
- en el buscador de ejercicios, cuando lo que se escribe no existe aparece
  *"Crear y agregar"*.

A partir del nombre (`src/utils/exerciseMatch.ts`) se deducen grupo muscular,
equipamiento y dibujo, con un diccionario castellano → inglés sobre el catálogo. Lo que se
crea así es un ejercicio como cualquier otro: entra en el historial, en los récords y en
las estadísticas. Se puede corregir después en Rutinas → *Mis ejercicios* (tocando la
fila), sin perder el historial, porque el id no cambia.

## Ejercicios por tiempo

Un ejercicio puede registrarse por tiempo en vez de kg × reps (`trackingType:
'duration'` en `src/data/exercises.ts`). La unidad la define `durationUnit`:
minutos para el cardio (**Cinta** y **Cinta inclinada**, bicicleta) y segundos
para los isométricos (plancha, plancha lateral, sentadilla contra la pared,
plancha alta tocando hombros).

En la rutina se configura el objetivo (`targetSeconds`), la pantalla de entreno
muestra un solo campo con la unidad al lado, y el historial suma el tiempo en
vez del volumen. Los ejercicios por tiempo no generan récords de peso.

## Progresión (doble progresión)

`src/utils/progression.ts` sugiere el peso de cada ejercicio: se mantiene el
peso hasta completar **todas** las series en el tope del rango de reps y recién
ahí se sube, volviendo al piso del rango. El salto sale del equipamiento (2,5 kg
barra, 2 kg mancuernas, 5 kg máquina/polea) y se redondea a lo que hay en un
gimnasio.

Es una sugerencia, no una imposición: aparece como un cartel arriba de cada
ejercicio en el entreno y prellena los kilos, que se pueden editar. Si pasaron
más de tres semanas desde la última vez, propone arrancar un 10 % abajo.

## Cierre automático del entreno

Un entreno que queda abierto más de **4 horas** se cierra solo (al abrir la app,
al volver del segundo plano y una vez por minuto mientras está en uso): si tiene
series completadas se guarda con la duración capeada en 2 h, y si no tiene
ninguna se descarta. Así la sesión del día no se arrastra al día siguiente ni
queda viva para siempre porque el teléfono se guardó en el bolso.

## Constancia (heatmap)

En Progreso, arriba de todo, con dos zooms: **semanal** (últimas 12 semanas, día
por día) y **mensual** (el último año). Cada celda es un día y la intensidad son
las series efectivas; arranca mostrando lo más reciente.

## Plan de Milena

Las tres rutinas del plan de septiembre (`src/data/mileRoutines.ts`) vienen
cargadas desde el primer arranque, repartidas en la semana (lunes piernas,
miércoles brazos, viernes full body). Si ya usabas la app, el botón *"Cargar
plan de Mile"* en Rutinas las agrega.

Las series y reps son las de las semanas 1-2-3; la variante de las semanas 4-5-6,
los descansos y las aclaraciones ("10 por pierna", "circuito de entrada",
"tabata") quedan en la nota de cada ejercicio.

## Iconos

```bash
node scripts/generate-icons.mjs
```

Genera favicon, iconos PWA (incluido el maskable), el `apple-touch-icon.png` de 180 px que
usa iOS al agregar a pantalla de inicio, y los mipmaps del TWA de Android.

## Documentación

- `docs/ideas-opengym.md` — relevamiento de openGym y qué conviene implementar.
- `docs/evidencia-ejercicios.md`, `docs/auditoria-gifs.md` — notas previas.
