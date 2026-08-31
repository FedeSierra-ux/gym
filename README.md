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

## Iconos

```bash
node scripts/generate-icons.mjs
```

Genera favicon, iconos PWA (incluido el maskable), el `apple-touch-icon.png` de 180 px que
usa iOS al agregar a pantalla de inicio, y los mipmaps del TWA de Android.

## Documentación

- `docs/ideas-opengym.md` — relevamiento de openGym y qué conviene implementar.
- `docs/evidencia-ejercicios.md`, `docs/auditoria-gifs.md` — notas previas.
