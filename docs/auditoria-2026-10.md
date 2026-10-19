# Auditoría de GymPro (octubre de 2026)

Versión auditada: 1.4.1. Revisión completa: lógica, pantallas, datos, accesibilidad,
seguridad, rendimiento, Android y CI, con una simulación de 8,5 meses de uso sobre los
stores reales y un recorrido por cada pantalla en Chromium. Las propuestas visuales con
antes y después están en la página del informe: https://claude.ai/artifact/YCDGoicEcdodrQSAWptt83 (privada; ahí se marca qué implementar).

**31 hallazgos**: 7 de severidad alta, 12 media, 12 baja. Todos verificados
(test, código, medición o captura). Ningún archivo del repo se modificó durante la auditoría.

> **Estado en la 1.5.0.** Los 31 hallazgos quedaron resueltos en la versión 1.5.0, junto
> con las propuestas visuales aceptadas (formato numérico único, semántica de deltas,
> escala de espaciado y alturas de fila, Inicio en tres bloques con hero, puntitos de
> rutina en la Agenda, cuánto subió cada récord, una fila de filtros en Marcas,
> asistencia por semana en el informe, Perfil con una cifra grande, Medidas, Ajustes en
> cuatro grupos y el descanso con "Siguiente"). Cada arreglo con lógica testeable tiene
> su test de regresión en `src/utils/__tests__/` (`auditoria150`, `auditoriaPantallas`,
> `frente3`). Los dos puntos que siguen abiertos a propósito: tailwind 3 y sharp quedan
> con avisos de `npm audit` (sólo en desarrollo; subirlos es tarea aparte) y el APK se
> firma como release recién cuando el repo tenga los secrets del keystore (ver README →
> Android).

## En dos minutos

La base está muy por encima del promedio para una app personal sin backend: récords
derivados del historial, tiempos por reloj de pared, borrados con deshacer, almacenamiento
que no revienta al llenarse, y la simulación de 8,5 meses (109 entrenos, 6 ciclos del
plan, backups, ejercicios propios, cierres automáticos) terminó sin una sola
inconsistencia. Los problemas serios están en los bordes:

1. Importar un backup puede pisar la copia previa con un doble toque (H01) y un archivo
   roto deja la app en pantalla de error en cada arranque (H02).
2. El APK es un WebView pelado: no importa ni exporta, y cada versión obliga a
   desinstalar, con pérdida de datos (H04).
3. La salida de emergencia exporta la API key en texto plano (H03).
4. Los domingos el plan por semanas se pelea consigo mismo, y el test que lo cubre falla
   ese día y bloquea el deploy (H05).
5. El entreno activo se re-renderiza entero dos veces por segundo (H06) y el arranque baja
   732 kB de JS más 2,4 MB de dibujos (H07).

Accesibilidad: hoy no conforma WCAG 2.1 AA; con H15 a H18 resueltos queda cerca.

## Simulación de 8,5 meses

Script sobre los stores reales (zustand + localStorage en memoria), del 2 de febrero de
2026 a hoy: apertura diaria (cierre automático + sincronización del plan), entrenos los
días del plan con 82 % de asistencia, progresión sugerida, tabata, entrenos olvidados,
cargas desde la Agenda, medidas, ejercicio propio creado/borrado/recuperado, entrenos
borrados y deshechos, edición de pesos, reinicios y fin del plan, backup semanal
reimportado. Invariantes semanales (récords = computeRecords, fechas y duraciones sanas,
sin NaN, ids únicos) e informes mensuales.

```
días simulados: 259
entrenos iniciados: 109 (guardados: 109; olvidados→auto: 4; cancelados: 2; cargados a mano: 2; con tabata: 49)
ciclos del plan: reinicios 5, terminados 1; ciclosPrograma guardados: 5; programa actual: {"inicio":1791158400000,"fase":"base"}
récords: 31; medidas: 19; ejercicios propios: 1
tamaño en localStorage: 264.7 KB (backup: 264.7 KB)
serializar+invariantes: máx 14.3 ms; computeRecords sobre 109 entrenos: máx 5.51 ms
por origen: {"auto":4,"en-vivo":103,"manual":2}
por semana del plan: {"1":15,"2":15,"3":17,"4":15,"5":13,"6":16,"-":18}
avisos de cambio de bloque (5):
  2026-02-23 (lu): Semana 4: las rutinas pasaron a Semanas 4-6
  2026-04-06 (lu): Semana 4: las rutinas pasaron a Semanas 4-6
  2026-05-18 (lu): Semana 4: las rutinas pasaron a Semanas 4-6
  2026-08-03 (lu): Semana 4: las rutinas pasaron a Semanas 4-6
  2026-09-14 (lu): Semana 4: las rutinas pasaron a Semanas 4-6
```

Resultado: ninguna inconsistencia. 265 KB en localStorage (≈ 370 KB por año); serializar
el estado lleva 15 ms y recalcular récords 5 ms.

## Hallazgos

### Severidad alta

#### H01 · Doble toque en "Reemplazar datos" pisa la copia de antes del import

- **Área:** Datos · **Dónde:** `src/screens/SettingsScreen.tsx:92-103 · src/utils/backup.ts applyBackup`
- **Qué pasa:** handleConfirmImport es async y el botón sigue habilitado mientras lee el archivo. Un segundo toque corre applyBackup otra vez: la copia previa (gympro-storage-v2-previo) se sobreescribe con el import recién aplicado. "Volver a los datos de antes del último import" (Ajustes y ErrorBoundary) restaura el backup importado, no lo que tenía el usuario.
- **Cómo verlo:** Perfil → Ajustes → Importar → elegir archivo → tocar dos veces "Reemplazar datos" (con un .json de cientos de KB la ventana es de decenas a cientos de ms).
- **Arreglo:** Guardia importando (estado o ref) + disabled en el botón; en applyBackup no pisar PREVIOUS_KEY si lo actual ya es igual al import.

#### H02 · Un backup roto o armado a mano deja la app en pantalla de error en cada arranque

- **Área:** Datos · **Dónde:** `src/utils/backup.ts normalizarDatos · src/store/useStore.ts onRehydrateStorage`
- **Qué pasa:** La validación del import mira un solo nivel: acepta sets: [null], routines[].exercises: [null], routine.name como objeto, kg: 'abc', customExercises: [{}]. Al rehidratar, computeRecords tira TypeError dentro de queueMicrotask (nadie lo captura) y después cualquier pantalla que pinte esos datos revienta. La única salida es la copia previa, si existía.
- **Cómo verlo:** Importar un archivo con {"state":{"workouts":[{"id":"x","startedAt":1,"exercises":[{"exerciseId":"a","sets":[null]}]}],"routines":[]},"version":2}.
- **Arreglo:** Validar sets (objeto con kg y reps numéricos), exercises de rutina (objeto con exerciseId string), name string, customExercises con id/nameEs/muscleGroup, exerciseTips string; envolver el setState de onRehydrateStorage en try/catch.

#### H03 · La salida de emergencia exporta la API key de Anthropic en texto plano

- **Área:** Seguridad · **Dónde:** `src/utils/backup.ts:65-69 exportRawBackup · src/components/ErrorBoundary.tsx:27`
- **Qué pasa:** exportRawBackup manda localStorage tal cual, y anthropicApiKey está en partialize. El README promete que el backup sale sin la key: es cierto sólo para serializarParaBackup. El archivo de la pantalla "Algo salió mal" la lleva.
- **Cómo verlo:** Forzar un error de render (p. ej. H02) → "Exportar mis datos" → abrir el .json.
- **Arreglo:** En exportRawBackup parsear, borrar state.anthropicApiKey y re-serializar; si no parsea, exportar igual avisando.

#### H04 · El APK publicado no es un TWA: importar/exportar no funcionan y cada versión obliga a desinstalar

- **Área:** Android · **Dónde:** `android/app/src/main/java/com/fedesierra/gympro/MainActivity.java · android/app/build.gradle · .github/workflows/build-apk.yml`
- **Qué pasa:** MainActivity es un WebView pelado (twa-manifest.json describe un Bubblewrap que no existe). Sin WebChromeClient el <input type=file> no abre selector (importar backup y foto de perfil rotos); sin navigator.share ni DownloadListener el <a download> no hace nada (exportar y compartir imagen rotos). build.gradle sólo tiene buildType debug y el workflow sube app-debug.apk firmado con un keystore efímero distinto en cada build: Android rechaza actualizar sobre el instalado, hay que desinstalar, y eso borra el localStorage. allowBackup=true manda el WebView (API key incluida) al Auto Backup de Google. clearCache(true) en cada onCreate.
- **Cómo verlo:** Instalar el APK, cargar entrenos, esperar la siguiente release → "App no instalada" al actualizar; adentro del APK, Ajustes → Exportar no hace nada.
- **Arreglo:** Generar el proyecto con Bubblewrap de verdad (TWA: share, download, file input y SW funcionan), firmar con un keystore en secrets (release buildType), allowBackup=false. Mínimo si se queda el WebView: onShowFileChooser + setDownloadListener + firma estable.

#### H05 · Los domingos el plan por semanas se pelea consigo mismo y los deploys fallan

- **Área:** Plan · **Dónde:** `src/utils/program.ts inicioParaSemana · src/store/useStore.ts:461,477 · src/stores/workoutStore.ts:629 · src/utils/__tests__/datosEntreno.test.ts:56 · .github/workflows/deploy.yml:30`
- **Qué pasa:** inicioParaSemana usa "mañana" como referencia los domingos; semanaDelPrograma y semanaDeEntreno usan "hoy". Un domingo, fijar "semana 4" pone fase alt y al minuto sincronizarPrograma (App.tsx) calcula semana 3 y vuelve todo a base con el toast "volvieron a Semanas 1-3"; el lunes lo pasa a alt otra vez. El entreno de ese domingo se guarda con semanaPrograma 3 y variante base. Lo mismo con semana 1 y 6. Además el test datosEntreno depende del día real: falla los domingos, y deploy.yml corre npm test antes de publicar, así que ningún push a main llega a producción un domingo (pasó hoy: 179/180).
- **Cómo verlo:** Con vi.setSystemTime en un domingo, fijarSemanaPrograma(4) y luego sincronizarPrograma().
- **Arreglo:** Una sola definición de "semana actual" en program.ts (referencia a mañana si es domingo) usada por sincronizarPrograma, semanaDeEntreno y ciclosParaListar; test con hora fija.

#### H06 · El entreno activo se re-renderiza entero dos veces por segundo

- **Área:** Rendimiento · **Dónde:** `src/App.tsx:50 · src/screens/ActiveWorkoutScreen.tsx:528-613 · src/utils/useRestTimerTick.ts:55-57`
- **Qué pasa:** 37 llamadas useStore() y 4 useWorkoutStore() sin selector: cualquier set() re-renderiza a todos. Pantalla (App.tsx) destructura el workoutStore entero; el tick del descanso escribe un activeWorkout nuevo cada segundo → re-render de ActiveWorkoutScreen (1327 líneas, 0 useMemo/useCallback/memo), que además tiene su propio setElapsed por segundo. En cada render reordena el historial y por ejercicio vuelve a filtrar/ordenar todos los entrenos (suggestNextWeight → lastSessionFor). CalendarioScreen y HomeScreen tampoco memorizan; ProgresoScreen sí.
- **Cómo verlo:** Entreno con descanso corriendo en un teléfono de gama baja: scroll y tecleo de kg con tirones.
- **Arreglo:** Selectores en App.tsx (s => s.activeWorkout !== null), useMemo de anteriores/sugerencias keyed en [workouts, routine], useShallow en los 37 useStore() (empezar por Toast y BottomNav, siempre montados).

#### H07 · Arranque pesado: 732 kB en un solo chunk, 2,4 MB de dibujos precacheados y fuentes remotas

- **Área:** Rendimiento · **Dónde:** `vite.config.ts:41-43 · src/App.tsx:7-16 · index.html:16-18`
- **Qué pasa:** Nada va por React.lazy. Composición medida: react 190 kB, núcleo 123, ActiveWorkout+Tabata 123, bodyModels 67, exerciseDetails 40, exercises 37, Calendario 35, InformeCiclo 33, Progreso 33, exerciseFrames 28. El service worker precachea 622 entradas (604 PNG de exercise-frames, 2,5 MB) en la instalación aunque la rutina use 30 dibujos. Google Fonts es render-blocking, va a Google en cada apertura y offline cae a la fuente del sistema (también en las imágenes compartidas).
- **Cómo verlo:** Primera apertura con datos móviles: 2,4 MB antes de usar nada; Lighthouse marca el chunk > 500 kB.
- **Arreglo:** React.lazy de ActiveWorkout, Calendario, Progreso, InformeCiclo, TuAnio, Medidas, ExerciseModal (≈ −240 kB raw / −71 gz); bodyModels y exerciseDetails con sus pantallas (−107 kB); globIgnores exercise-frames + runtimeCaching CacheFirst; @fontsource para DM Sans y JetBrains Mono.

### Severidad media

#### H08 · Con la PWA y una pestaña abiertas se pierde el entreno en curso

- **Área:** Datos · **Dónde:** `src/stores/workoutStore.ts (sin listener de storage) · src/store/useStore.ts:688-692`
- **Qué pasa:** El store principal relee cuando otra instancia escribe (listener de storage); el del entreno activo no. Cada instancia escribe su activeWorkout por turnos y la que se cierre pierde sus series. startWorkout tampoco rechaza si ya hay uno persistido.
- **Cómo verlo:** PWA con entreno en curso → abrir gympro en Chrome → Iniciar entreno → volver a la PWA y tildar → cerrar Chrome.
- **Arreglo:** Mismo listener de storage para gympro-active-workout + rehydrate; startWorkout rehidrata y avisa si ya hay uno.

#### H09 · Si el descanso vence con la app cerrada, al volver el panel queda clavado en 0:00

- **Área:** Entreno · **Dónde:** `src/utils/useRestTimerTick.ts:263-265 · src/stores/workoutStore.ts:843-844 merge`
- **Qué pasa:** Al rehidratar con restEndsAt en el pasado, merge deja restSecondsLeft 0 y restTimerVisible true. En cada tick left === prev (0) y sale antes de la rama que cierra, vibra y suena. El overlay tapa el entreno hasta tocar Saltar.
- **Cómo verlo:** ✓⏱ (descanso 1:15) → bloquear el teléfono (iOS mata la PWA) → reabrir después de 1:15.
- **Arreglo:** En merge: restTimerVisible: aw.restTimerVisible && left > 0 (y restEndsAt undefined si venció).

#### H10 · Un ejercicio que ya no existe (tras un import) queda invisible pero sigue contando series

- **Área:** Entreno · **Dónde:** `src/screens/ActiveWorkoutScreen.tsx:626-627,796 · src/screens/RoutineDetailScreen.tsx:296-297`
- **Qué pasa:** No crashea (verificado), pero la tarjeta no se dibuja mientras totalSets la cuenta, proximaSerie puede apuntarle, el menú ⋯ con Saltear vive adentro de la tarjeta oculta y en un circuito la ronda nunca cierra. En el detalle de rutina el ejercicio huérfano tampoco se puede quitar.
- **Cómo verlo:** Entreno en curso con un ejercicio propio → importar un backup de otro teléfono sin ese customExercises → reload.
- **Arreglo:** Tarjeta de respaldo "Ejercicio desconocido" con ⋯ para saltearlo, o filtrar al rehidratar/startWorkout con un aviso.

#### H11 · Editar un entreno guarda series de 0×0 y entrenos sin ejercicios

- **Área:** Datos · **Dónde:** `src/screens/CalendarioScreen.tsx:215-232,252-266`
- **Qué pasa:** "+ Agregar serie" arranca con kg '0' y reps '0', que pasa el filtro !== '' y se guarda como serie real. Borrar todas las series de todos los ejercicios y guardar persiste un Workout con exercises: [] que sigue contando para racha, entrenos del mes y horas.
- **Cómo verlo:** Agenda → día → ✏️ → borrar series / agregar serie sin tocar nada → Guardar.
- **Arreglo:** Filtrar reps > 0 || durationSec > 0; si no queda ningún ejercicio, convertir en Borrar entreno (ya tiene deshacer).

#### H12 · Corregir la semana del plan deja los entrenos ya hechos con la semana vieja

- **Área:** Plan · **Dónde:** `src/utils/cycleReport.ts:116 · src/store/useStore.ts:457-472`
- **Qué pasa:** informeCiclo prioriza w.semanaPrograma (estampado al terminar) sobre la fecha, y fijarSemanaPrograma no re-estampa. Corregir de semana 1 a 3 el jueves deja el entreno del martes en S1 del informe; reiniciar a mitad de ciclo manda entrenos de esa semana a una S3 futura del ciclo nuevo.
- **Cómo verlo:** Lunes fija semana 1, martes entrena, jueves corrige a semana 3 → informe del ciclo.
- **Arreglo:** Re-estampar semanaPrograma de los entrenos con startedAt >= nuevo inicio al fijar la semana.

#### H13 · El cartel de récord en vivo no coincide con los récords reales en peso corporal

- **Área:** Entreno · **Dónde:** `src/stores/workoutStore.ts:421-435 · src/utils/records.ts:17-26`
- **Qué pasa:** completeSet sólo mira kg > 0 y compara kg/reps; computeRecords decide por mayoría de series si el ejercicio se mide en kg, reps o tiempo. Dominadas con lastre de 5 kg × 6 muestran récord y el resumen cuenta 0; 15 reps a 0 kg (récord real) no muestran cartel. Con kg 0 el livePr anterior no se limpia, y dos series mejores seguidas dan dos carteles contra un récord contado.
- **Cómo verlo:** Historial de dominadas a 0 kg; hoy una serie con 5 kg × 6.
- **Arreglo:** Usar recordKindFor + el mismo criterio esMejor de records.ts; livePr = null cuando no es récord; comparar también contra las series ya hechas en la sesión.

#### H14 · La meta semanal cuenta faltas de antes de instalar la app

- **Área:** Informes · **Dónde:** `src/utils/informes.ts:107 planificadasPorSemana`
- **Qué pasa:** Con weeklyGoal fijado, la semana en que se empezó a usar la app cuenta la meta entera (3) aunque la app se haya instalado el sábado; el informe del ciclo marca faltas imposibles. Con la semana tipo sí se recorta.
- **Cómo verlo:** inicioUso = sábado 17/10, weeklyGoal 3, semana del lunes 12/10 → 3 planificadas (esperado 0).
- **Arreglo:** min(weeklyGoal, días de la semana >= inicioUso) o prorratear.

#### H15 · Campos y selectores sin nombre accesible en los formularios principales

- **Área:** Accesibilidad · **Dónde:** `src/screens/CalendarioScreen.tsx:403 (7 select) · RoutineDetailScreen.tsx:174,500 · CalendarioScreen.tsx:302-337 · CustomExercisesScreen.tsx:185-218 · SettingsScreen.tsx:116,174 · OnboardingScreen.tsx:64 · ExercisePickerScreen.tsx:159`
- **Qué pasa:** axe marca select-name ×7 (critical) y label ×13 (critical): los <label> no tienen htmlFor y varios campos sólo tienen placeholder. Un lector de pantalla lee "cuadro combinado" sin decir de qué día.
- **Cómo verlo:** VoiceOver/TalkBack en Agenda → Semana por defecto.
- **Arreglo:** aria-label o htmlFor+id (el patrón ya existe en ActiveWorkoutScreen:430-453).

#### H16 · Diez hojas y modales no usan el primitivo Dialog: sin rol, sin foco, sin Escape

- **Área:** Accesibilidad · **Dónde:** `src/components/ExercisePickerSheet.tsx:45 · ExerciseHistorySheet.tsx:100 · ExerciseModal.tsx:25 · WorkoutSummaryModal.tsx:175 · src/screens/HistorialBuscadorSheet.tsx:98 · MedidasSheet.tsx:75 · RutinasScreen.tsx:214,266 · RoutineDetailScreen.tsx:582 · RestTimerOverlay.tsx:80`
- **Qué pasa:** El componente Dialog (useDialog) hace rol, trampa de Tab, Escape y devolución de foco, pero la mitad de las hojas lo esquivan. RestTimerOverlay declara role=dialog aria-modal sin trampa: el foco queda detrás. Verificado en vivo: la hoja de historial no se cierra con Escape.
- **Cómo verlo:** Teclado: abrir Historial de un ejercicio → Tab recorre la pantalla de atrás.
- **Arreglo:** Reemplazar el <div> del panel por <Dialog label onClose>.

#### H17 · Avisos sin región viva, foco invisible en los campos del entreno, textos por debajo de 4,5:1

- **Área:** Accesibilidad · **Dónde:** `src/components/Toast.tsx:65 · src/screens/ActiveWorkoutScreen.tsx:249 · RoutineDetailScreen.tsx:387-431,491 · ExercisePickerScreen.tsx:139,149,332 · CustomExercisesScreen.tsx:93,184-217 · CreateExerciseCard.tsx:69-73`
- **Qué pasa:** ToastContainer devuelve null sin avisos, así que los 29 addToast (récords incluidos) no se anuncian. estiloCampo pone outline:none y pisa el :focus-visible global en todos los kg/reps. Texto en rgba(255,255,255,0.3) = 2,64:1, 0.35 = 3,17:1, 0.4 = 3,79:1 y "Agregar ejercicio" en coral al 50 % = 2,25:1; mute sobre surf2 = 4,34:1.
- **Cómo verlo:** Lector de pantalla al tildar una serie con récord: silencio.
- **Arreglo:** Contenedor siempre montado con role=status aria-live=polite; borrar los 4 outline:none; reemplazar los rgba por S.dim/S.mute/S.acc.

#### H18 · Acciones sólo por pulsación larga, orientación bloqueada y objetivos táctiles chicos

- **Área:** Accesibilidad · **Dónde:** `src/screens/ActiveWorkoutScreen.tsx:366,468 · RutinasScreen.tsx:26-33 · vite.config.ts:29 · ProfileScreen.tsx:151 · RoutineDetailScreen.tsx:340-426`
- **Qué pasa:** Confirmar y descansar sólo con mantener apretado (invisible y sin equivalente de teclado); el menú de la rutina sólo con long-press. orientation: portrait en el manifest (WCAG 1.3.4). ~25 objetivos menores a 44 px: ✏️ de perfil 16×20, flechas ↑↓ 32×28, × 32×32, ‹› 36×36; theme.ts exporta tappable pero casi nadie lo usa.
- **Cómo verlo:** Usuario con teclado o switch: no puede arrancar el descanso desde el tilde.
- **Arreglo:** "Confirmar y descansar" en la hoja de opciones de la serie; botón ⋯ visible en la tarjeta de rutina; orientation any; style={tappable}.

#### H19 · Workflows: release borrado antes de crearse, Gradle sin checksum, TLS desactivado, acciones sin pin

- **Área:** CI · **Dónde:** `.github/workflows/build-apk.yml:42,66-86 · audit-gifs.yml:38 · refresh-gifs.yml:44 · todos los workflows`
- **Qué pasa:** build-apk borra el release y el tag apk-latest y recién después crea el nuevo: si el POST falla queda sin APK publicado. wget de Gradle 8.4 sin verificar SHA. NODE_TLS_REJECT_UNAUTHORIZED=0 en dos workflows (apaga TLS para todo el proceso) que además son código muerto. Todas las actions van por tag mayor, no por SHA; ci.yml no declara permissions.
- **Cómo verlo:** Un fallo transitorio de la API de GitHub en el paso de release.
- **Arreglo:** Crear el release nuevo antes de borrar el viejo (o usar softprops/action-gh-release); setup-gradle o checksum; borrar los workflows de GIFs; pinear por SHA.

### Severidad baja

#### H20 · La fecha del entreno en curso acepta el futuro y congela "hoy" al montar

- **Área:** Entreno · **Dónde:** `src/screens/ActiveWorkoutScreen.tsx:121-157 · src/screens/MedidasSheet.tsx:51,151`
- **Qué pasa:** Sólo hay max en el input; onChange acepta cualquier ts (en escritorio se puede imputar al futuro y finishWorkout lo guarda). hoy es useState una sola vez: un entreno que cruza la medianoche sigue diciendo Hoy para ayer. En Medidas, vaciar la fecha guarda Date.now() en silencio.
- **Cómo verlo:** Entreno abierto a las 23:50, seguir después de las 0:00 y tocar la fecha.
- **Arreglo:** Rechazar ts > Date.now() con toast y usar useHoy().

#### H21 · Nombre del archivo al compartir el resumen con fecha UTC

- **Área:** Informes · **Dónde:** `src/components/WorkoutSummaryModal.tsx:167`
- **Qué pasa:** toISOString().slice(0,10): después de las 21:00 en Buenos Aires el PNG sale con la fecha de mañana. El mismo bug ya se corrigió en backup.ts con toDateInputValue.
- **Cómo verlo:** Terminar un entreno a las 22:00 y compartir la imagen.
- **Arreglo:** toDateInputValue(workout.startedAt).

#### H22 · Una rutina puede quedar sin nombre; crear un ejercicio con nombre del catálogo no hace nada

- **Área:** Rutinas · **Dónde:** `src/screens/RoutineDetailScreen.tsx:182-183,504-512 · src/screens/CustomExercisesScreen.tsx:55-64`
- **Qué pasa:** Cada tecla del nombre persiste; borrar todo deja name '' en Rutinas, Inicio, entreno y resumen. En Mis ejercicios, "Press de banca" → Crear devuelve el existente sin avisar; en el detalle de rutina el toast dice "agregado" aunque ya estaba.
- **Cómo verlo:** Editar rutina → borrar el nombre → salir.
- **Arreglo:** Borrador local confirmado en blur con trim() || nombre anterior; avisar "ya existe" / "ya está en la rutina".

#### H23 · Fin de ciclo con aritmética de milisegundos: se corre una hora con cambio de horario

- **Área:** Plan · **Dónde:** `src/store/useStore.ts:464,498 (lunesDe + 7 × 86400000)`
- **Qué pasa:** El resto del módulo usa aritmética de fechas; acá no. En una zona con DST el ciclo archivado termina a las 23:00 del domingo y un entreno de las 23:30 queda afuera. No afecta a Argentina hoy.
- **Cómo verlo:** TZ=Europe/Madrid, semana del 19/10/2026.
- **Arreglo:** new Date(y, m, d + 7) sobre lunesDe(nowTs).

#### H24 · "Ciclos del plan completos" cuenta ciclos cortados a la mitad

- **Área:** Informes · **Dónde:** `src/utils/yearReview.ts:190 · src/store/useStore.ts archivarCiclo`
- **Qué pasa:** archivarCiclo guarda cualquier ciclo de 13 días o más; Tu año los cuenta como completos.
- **Cómo verlo:** Reiniciar el plan en la semana 4 → Tu año dice 1 ciclo completo.
- **Arreglo:** Exigir c.fin >= finDeCiclo(c.inicio) o un flag completo.

#### H25 · Tras tres semanas sin hacer un ejercicio propone bajar 25 % (el README dice 10 %)

- **Área:** Progresión · **Dónde:** `src/utils/progression.ts:127-139`
- **Qué pasa:** El umbral kg < last.kg × 0.75 incluye el 25 %. Máquina (salto 5), último 20 kg hace 28 días: propone 15 kg "bajar" en vez de mantener con calma.
- **Cómo verlo:** Ver la sugerencia de un ejercicio de máquina después de 4 semanas.
- **Arreglo:** Umbral 0.8 (o <= 0.75).

#### H26 · Progreso decide kg o reps sólo con el rango visible; Récords usa todo el historial

- **Área:** Progreso · **Dónde:** `src/utils/progressSeries.ts:107-113 · src/utils/periodSummary.ts:112`
- **Qué pasa:** Dominadas con 30 series a peso corporal y 6 de 8 con lastre en los últimos 3 meses: Progreso las mide en kg y Récords en reps; "estancado" se calcula con distinta unidad.
- **Cómo verlo:** Dominadas con lastre reciente, pestaña Marcas en 3 meses.
- **Arreglo:** Pasar kindsPorEjercicio(workouts, exercises) a buildProgressSeries.

#### H27 · El historial de medidas mezcla coma y punto y muestra dos decimales

- **Área:** Medidas · **Dónde:** `src/screens/MedidasSheet.tsx (lista del historial)`
- **Qué pasa:** Arriba dice 58,2 kg (es-AR); la lista dice "Peso 58.2 kg · Cintura 67.45 cm". Visto en la captura con datos simulados.
- **Cómo verlo:** Perfil → Peso y medidas, anotar 67,45 de cintura.
- **Arreglo:** Un solo formateador (toLocaleString es-AR, 1 decimal) para toda la hoja.

#### H28 · El entreno activo se serializa entero una vez por segundo durante el descanso

- **Área:** Rendimiento · **Dónde:** `src/stores/workoutStore.ts:837-839 partialize`
- **Qué pasa:** partialize hace spread de activeWorkout, así que mismasReferencias nunca acierta: JSON.stringify de ~2,5 KB por segundo (la escritura sí se evita porque el JSON no cambia).
- **Cómo verlo:** Descanso corriendo; perfil de CPU.
- **Arreglo:** Devolver la misma referencia cuando restSecondsLeft ya es 0, o comparador propio.

#### H29 · Manifest en inglés, sin meta description, API key visible a cualquier script del origen

- **Área:** PWA · **Dónde:** `vite.config.ts manifest · index.html`
- **Qué pasa:** El manifest sale con lang en; index.html no tiene meta description ni CSP. La API key en localStorage es legible por cualquier extensión o script del origen: aceptable para una app personal, pero conviene documentarlo y, con fuentes locales, sumar un meta CSP.
- **Cómo verlo:** Lighthouse PWA.
- **Arreglo:** lang: 'es' en VitePWA.manifest; meta description; CSP default-src 'self' + connect-src api.anthropic.com cuando las fuentes sean locales.

#### H30 · Código y archivos muertos: la cadena de GIFs de ExerciseDB, seedData, preview.html y más

- **Área:** Higiene · **Dónde:** `preview.html · ejercicios_actuales.csv · plantilla_rutinas.csv · src/assets/* · src/App.css · src/components/ExerciseDetailSheet.tsx · scripts/audit-gifs.mjs · scripts/refresh-gifs.mjs · .github/workflows/audit-gifs.yml, refresh-gifs.yml · docs/auditoria-gifs.md, evidencia-ejercicios.md · src/data/seedData.ts, exerciseIcons.ts · types.ts AppSettings, Exercise.image/wgerId/nameEn · package.json playwright`
- **Qué pasa:** Nada de esto se importa ni se ejecuta (verificado con grep en src, scripts y workflows). ExerciseDetailSheet (305 líneas, 4 fetch a wger) no está montado; seedData arma PRs falsos pero nadie lo llama; seedData.ts igual entra al bundle por el import. tailwindcss/postcss/autoprefixer están en dependencies.
- **Cómo verlo:** —
- **Arreglo:** Borrar; mover tailwind/postcss/autoprefixer a devDependencies; quitar playwright.

#### H31 · npm audit: 15 avisos, ninguno en código que llegue al usuario

- **Área:** Dependencias · **Dónde:** `package-lock.json`
- **Qué pasa:** vite, postcss (+nanoid, source-map-js), tailwind v3 (micromatch, chokidar), sharp (libvips). El bundle sólo contiene react, react-dom, scheduler, zustand y workbox-window. npm audit fix sin --force deja 8 (la cadena de tailwind v3 pide pasar a 4.x y sharp a 0.35) y build y tests quedan igual.
- **Cómo verlo:** npm audit
- **Arreglo:** npm audit fix ahora; tailwind 4 y sharp 0.35 en una tarea aparte.

## Plan sugerido

1. **Hoy (una tarde, sin riesgo):** H01, H03, H05, H08, H09, H21, H27, H31 y borrar código muerto (H30).
2. **Esta semana:** H02, H06, H07, H11, H13 y los cuatro de accesibilidad (H15 a H18).
3. **Android (tarea aparte):** H04 y H19.
4. **Después:** H12, H14, H23, H24, H25, H26.
5. **Propuestas visuales:** las que se marquen como "Implementar" en la página del informe, en un PR aparte con su versión.

## Método y límites

- Lectura completa del código, lint, tsc, 180 tests y build.
- Cuatro revisiones independientes (pantallas; lógica pura y fechas; accesibilidad con
  axe-core en Chromium; seguridad, infraestructura y rendimiento), más la simulación y el
  recorrido con Playwright a 390×844 (39 capturas).
- Sin lector de pantalla real ni APK instalado en un dispositivo. Datos de la simulación
  sintéticos.

## Propuestas visuales (resumen)

Las comparaciones antes/después y la decisión por propuesta están en la página del informe.
Acá queda sólo el índice.

### Por sección

- **Onboarding · Tus datos quedan en este teléfono** (esfuerzo bajo): Las 4 features genéricas pasan a 3 concretas con una línea de explicación cada una (bloques, descanso automático, marcas y récords) y ícono de línea en vez de emoji.; Tarjeta nueva 'Tus datos quedan en este teléfono': sin cuenta ni servidor, y dónde hacer el backup.; Enlace secundario 'Ya usaba GymPro · Importar un backup' debajo de Comenzar (la importación ya existe en Ajustes).. Archivos: `src/screens/OnboardingScreen.tsx`
- **Inicio · Tres bloques en vez de cinco tarjetas (conservadora)** (esfuerzo medio): 'Tu plan', la semana (L–D) y 'Semana pasada' se funden en una sola tarjeta 'Semana 3 de 6' con la barra de 6 segmentos, los días y una línea de cierre: esta semana 1/3 · la pasada 3/3 · 102 series · 7 récords.; La racha en 0 desaparece (la mejor racha vive en Perfil); el dato positivo de la semana pasada queda al lado del de esta semana, sin tarjeta propia ni botón ×.; 'Última sesión' pasa de tarjeta a fila; la silueta de la rutina se reemplaza por un tile con ícono de línea en el color de la rutina; barra inferior con íconos SVG.. Archivos: `src/screens/HomeScreen.tsx`, `src/components/WeeklyReview.tsx`, `src/components/ProgramCard.tsx`, `src/components/BottomNav.tsx`
- **Inicio · Hero sin tarjeta y franja de tres cifras (audaz)** (esfuerzo alto): La acción del día deja de ser una tarjeta: título grande, botón de 56 px y 'o adelantar piernas · full body' como texto; el fondo lleva un degradé coral muy suave.; Una franja de tres cifras sin tarjetas (1/3 esta semana · 3/3 semana pasada · 7 récords) reemplaza a las tarjetas de semana pasada y racha.; Semana del plan y días L–D en una banda sin borde; 'Series esta semana' en dos columnas para que entre completa en el primer viewport.. Archivos: `src/screens/HomeScreen.tsx`, `src/components/WeeklyReview.tsx`, `src/components/ProgramCard.tsx`, `src/components/WeeklyMuscleSets.tsx`
- **Rutinas · Menú visible y próxima fecha por rutina** (esfuerzo bajo): El gesto oculto 'mantené apretada para más opciones' se reemplaza por un botón ⋯ de 44 px en cada tarjeta; el subtítulo largo desaparece.; Cada rutina muestra 'Próxima: jue 23 · última hace 4 días', que sale del plan en orden que ya calcula la Agenda.; Siluetas y emojis de músculo pasan a tile con ícono de línea en el color de la rutina y chips con punto de color + ícono monocromo; 'Crear rutina' es un botón + de 44 px en el encabezado.. Archivos: `src/screens/RutinasScreen.tsx`, `src/components/RoutineIcon.tsx`, `src/components/MuscleIcon.tsx`
- **Rutina · detalle · Lista densa por bloque** (esfuerzo medio): Los tres chips de meta (12 ejercicios · ~100 min · último 14 oct) se vuelven una línea de texto bajo el título; el botón Volver pasa a 44 px.; Cada ejercicio pasa de tarjeta de 90 px a fila de 60 px dentro de una tarjeta por bloque: número, dibujo 40 px, nombre, '3 × 20 s · Core/Abs · nota' en una línea.; Encabezado de bloque como etiqueta de sección en mayúsculas con el conteo a la derecha.. Archivos: `src/screens/RoutineDetailScreen.tsx`, `src/components/ExerciseThumbnail.tsx`
- **Agenda · Leyenda en el encabezado y semana tipo visual** (esfuerzo medio): La leyenda de colores sube al encabezado del calendario como tres puntos con nombre; 'racha 0' se quita de '6 de 7 planificados'.; El párrafo que explica 'Semana por defecto' se reemplaza por una fila L–D con un cuadrado del color de cada rutina (Pier / Braz / Full) y '—' en los días de descanso, más una sola línea de ayuda con ícono ⓘ.; Flechas de mes de 44 px con chevrones SVG; segmentado Calendario / Récords con íconos de línea.. Archivos: `src/screens/CalendarioScreen.tsx`, `src/components/MonthCalendar.tsx`
- **Récords · Cuánto subió cada récord** (esfuerzo bajo): Cada fila muestra en ámbar la mejora contra el récord anterior ('+5 kg') junto a la fecha; el valor queda en mono tabular a la derecha.; El ▼ se reemplaza por un chevron › de 44 px que abre el historial del ejercicio; las filas de un mismo grupo comparten una tarjeta.; Encabezado de grupo con punto de color + ícono de línea monocromo; tarjeta resumen con trofeo de línea en ámbar.. Archivos: `src/screens/CalendarioScreen.tsx`, `src/components/ExerciseHistorySheet.tsx`
- **Progreso · Marcas · Una fila de filtros en vez de tres** (esfuerzo medio): Rango y grupo muscular se vuelven dos selectores de 44 px en una sola fila ('3 meses ▾' · 'Todos los grupos ▾'); las pestañas Marcas / Músculos / Resumen quedan como están.; El aviso '10 ejercicios sin mejorar' pasa de párrafo a fila compacta con chevron; la sugerencia completa se abre al tocar.; Filas de la lista: nombre, sparkline, valor con unidad en --dim (4,5:1) y delta como píldora verde con flecha.. Archivos: `src/screens/ProgresoScreen.tsx`, `src/components/Sparkline.tsx`
- **Progreso · Músculos · Mapa compacto y tabla con barras** (esfuerzo medio): El mapa corporal baja de 330 px a 150 px (frente y espalda a los lados, escala en el medio) para que la tabla entre en la primera pantalla.; La tabla suma una barra proporcional al total de series en el color del grupo, con el total en mono y 'por semana' en --dim.; Mismo selector de rango de 44 px que en Marcas; íconos de grupo monocromos con punto de color.. Archivos: `src/screens/ProgresoScreen.tsx`, `src/components/MuscleBodyMap.tsx`, `src/components/MuscleIcon.tsx`
- **Progreso · Resumen · Deltas en gris, no en rojo** (esfuerzo bajo): Las bajas contra el mes anterior se muestran como píldora gris con flecha (↓ 2 · −25 %); el rojo queda reservado a errores, como dice el sistema.; La nota 'contra 1–18 sep, los mismos días' sube bajo el nombre del mes; el segmentado 'Contra:' pierde la etiqueta y nombra el mes concreto ('Octubre 2025').; Flechas de mes de 44 px; la lista de récords alinea valor y 'antes' en columnas mono sin cortar.. Archivos: `src/screens/ProgresoScreen.tsx`, `src/components/ResumenMesCard.tsx`
- **Informe de ciclo · Asistencia como barras por semana** (esfuerzo bajo): Encabezado con 'Semana 2 de 6', el porcentaje de asistencia en verde y tres cifras (4 de 6 entrenos · 141 series · 7 récords) en una fila.; Las seis semanas se dibujan como barras de altura proporcional (S1 llena en verde, S2 a un tercio, S3 vacía) con el divisor 'Cambio de bloque' entre S3 y S4.; 'Ejercicios' pasa a un estado vacío con ícono y una frase que explica qué va a aparecer; Compartir y Volver de 44 px con ícono de línea.. Archivos: `src/screens/InformeCicloSheet.tsx`, `src/components/InformeHost.tsx`
- **Perfil · Una cifra grande y tres secundarias** (esfuerzo bajo): Identidad y números en una sola tarjeta: 109 entrenos como cifra principal y 101 h · 3.650 series · 31 récords en una fila secundaria; el lápiz pasa a botón de 44 px.; '0 entrenos seguidos · mejor 22' se reemplaza por 'Mejor racha: 22 entrenos seguidos' en una línea con ícono de llama.; Filas de navegación con ícono de línea (balanza, lupa, engranaje); el peso muestra '58,2 kg · 15 oct' y la variación como píldora; la info de versión baja a una línea de pie.. Archivos: `src/screens/ProfileScreen.tsx`
- **Peso y medidas · Un solo formato numérico** (esfuerzo bajo): Todo el historial usa el mismo formato que la cifra principal: coma decimal, un decimal, unidad en --dim ('58,2 kg · 67,5 cm'); antes mezclaba '58.2 kg' y '67.45 cm'.; El historial pasa de tarjetas a filas de 52 px con la fecha corta a la izquierda ('15 oct') y los valores en mono tabular alineados; borrar va detrás de un ⋯ de 44 px.; Chips de medida de 44 px con el seleccionado en coral y texto oscuro; botón cerrar de 44 px.. Archivos: `src/screens/MedidasSheet.tsx`
- **Ajustes · Cuatro grupos con el backup segundo** (esfuerzo medio): El formulario se agrupa en tarjetas con ícono y subtítulo: Vos (nombre y meta), Backup, IA (opcional) y Plan de Mile.; Backup sube al segundo lugar y muestra el estado ('109 entrenos · sin copia todavía') con Exportar como botón primario e Importar al lado.; IA y Plan de Mile se colapsan en filas con chevron; el input de nombre y los botones de meta usan el nuevo borde --line3 (3:1) y 44 px de alto.. Archivos: `src/screens/SettingsScreen.tsx`, `src/components/BackupReminder.tsx`
- **Entreno activo · Encabezado de una fila y tilde dividido (conservadora)** (esfuerzo medio): El encabezado fijo baja de 150 px a 60 px: rutina, 0/28, cronómetro y 'Hoy' en una sola fila con la barra de progreso debajo.; Cada serie ocupa 52 px: el 'anterior' va en chico bajo el número de serie, y las filas 'Sin descanso', el tip y '+ Serie' salen de la tarjeta (el descanso de la ronda se explica en su encabezado; tip y + Serie quedan en el menú ⋯).; El tilde deja de ser mantener-apretado: en la serie activa de un ejercicio con descanso hay un botón dividido ✓ (confirmar) | ⏱ (confirmar y descansar), ambos de 44 px.. Archivos: `src/screens/ActiveWorkoutScreen.tsx`, `src/components/DraftNumberInput.tsx`
- **Entreno activo · Una serie a la vez (audaz)** (esfuerzo alto): La serie actual ocupa la pantalla: nombre grande, nota en ámbar, 'anterior 26 s · mejor 30 s', un solo campo de 64 px con botones −/+ de 44 px.; Dos acciones explícitas y grandes: 'Hecha → sigue B' (primaria) y 'Hecha y descansar 1:15' (secundaria); el long-press desaparece.; Debajo, 'Después' lista los próximos ejercicios en filas de 44 px con su 0/3 y objetivo; 'Ver lista completa' abre la vista actual.. Archivos: `src/screens/ActiveWorkoutScreen.tsx`, `src/utils/bloques.ts`, `src/components/DraftNumberInput.tsx`
- **Descanso · Siguiente con dibujo y presets de 44 px** (esfuerzo bajo): Bajo el anillo, 'Serie 1 hecha · Russian Twist · 10 reps' con tilde verde en una línea; la tarjeta 'Siguiente' ocupa el ancho, con dibujo, serie, objetivo y 'anterior 10'.; Los presets de tiempo pasan de 36 a 44 px de alto, en una fila que ocupa todo el ancho; el elegido va en coral con texto oscuro.; −30 s / +30 s de 60 px con la unidad escrita; 'Ver el entreno' con chevron SVG.. Archivos: `src/screens/RestTimerOverlay.tsx`
- **Tabata · Lo que sigue sobre superficie sólida** (esfuerzo bajo): La tarjeta 'Sigue: …' pasa de vidrio translúcido a superficie sólida (--surf) con borde, para que el texto cumpla 4,5:1 sobre cualquier fondo desenfocado.; Íconos de línea (cerrar, sonido, anterior, pausa, saltar) y el dibujo del ejercicio en un tile sólido de 64 px.; Texto secundario ('Quedan 7:48', 'Ejercicio 1 de 4', pitido) en blanco al 80 % en vez de gris, que sobre el vidrio quedaba por debajo de 4,5:1.. Archivos: `src/screens/TabataOverlay.tsx`, `design-tokens.js`
- **Resumen al terminar · Un entreno corto no es un fracaso** (esfuerzo bajo): Cuando se hizo menos de la mitad de las series, la tabla de comparación se reemplaza por tres cifras neutras (2 series · 1 min · 0 récords) y el título pasa a 'Entreno guardado · corto, pero cuenta'.; Lista de lo hecho con tilde verde ('Plancha 26 s', 'Russian Twist 10 reps') y una nota con ⓘ que explica por qué no se compara con el 7 oct y cuántos ejercicios quedaron.; El ícono de la rutina pasa a un tilde grande en el color de la rutina; 'Compartir imagen' como acción fantasma sobre los dos botones.. Archivos: `src/components/WorkoutSummaryModal.tsx`, `src/utils/informes.ts`

### Transversales al sistema de diseño

- **Set de íconos SVG de línea en vez de emojis** (esfuerzo medio): Un componente <Icon name> con ~40 glifos de 24 px, trazo 1,75 y color currentColor (barra inferior, acciones, grupos musculares como ícono monocromo + punto de color del grupo). Reemplaza 🏠📋📅📈👤, ✏️, 🗑, 🏆, 🔥 y los emojis de músculo, que hoy se ven distintos en iOS, Android y escritorio y no toman el color del tema.
- **Tercer tono de línea: --line3 para bordes de controles (3:1)** (esfuerzo bajo): rgba(236,238,244,0.40) sobre surf da 3,4:1, el mínimo de WCAG para bordes de inputs, selectores y botones secundarios. --line (7 %) y --line2 (12 %) quedan para separadores y tarjetas, que no necesitan contraste de componente. Se suma a design-tokens.js y de ahí a Tailwind y a S.
- **Regla de tamaño táctil: nada por debajo de 44 px** (esfuerzo bajo): TAP_MIN ya existe pero no se aplica en ✏️ de perfil (16×20), ↑↓ de orden (32×28), cerrar × (32×32), ‹› de mes (36×36) ni en los presets de descanso (36). Un componente IconButton de 44×44 (hit area) con el glifo de 24 px adentro y un lint visual en la auditoría de UI lo resuelven de una vez.
- **Un solo formato numérico: '58,2 kg', '67,5 cm', '3.650'** (esfuerzo bajo): Una función fmt(valor, unidad, decimales) con Intl.NumberFormat('es-AR') y un decimal fijo para kg y cm, que todas las pantallas usen (hoy Medidas mezcla '58.2 kg' y '67.45 cm' con '58,2'). La cifra va en .num (mono tabular) y la unidad en --dim con separación de 2 px, nunca en rgba al 30-40 %.
- **Semántica de deltas: las bajas no son errores** (esfuerzo bajo): Según el sistema, rojo = error. Un delta negativo contra el mes pasado o una sesión corta se muestran en gris (--dim), las subidas en verde y los récords en ámbar. Así el rojo queda reservado para fallos reales (no se pudo guardar, importación inválida) y el usuario no lee reproche donde hay información.
- **Escala de espaciado de 4 px y dos alturas de fila** (esfuerzo medio): Tokens --sp-1…--sp-8 (4/8/12/16/20/24/32) y dos alturas de fila estándar: 44 px para filas tocables simples (listas, tabla de músculos) y 56-60 px para filas con título y subtítulo. Hoy conviven 70, 90 y 100 px en las listas; unificar baja la altura del entreno y del detalle de rutina sin tocar la tipografía.
