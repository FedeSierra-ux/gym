# Ideas tomadas de openGym (y qué conviene implementar acá)

Relevamiento de [openGym](https://gitlab.com/DuarteSantos8/opengym) (AGPL-3.0, React +
Node + Docker + Capacitor, self-hosted). El espejo de gitea.com no se pudo abrir desde
este entorno (bloqueado por el proxy de red), así que el listado sale del README de
GitLab.

Importante: openGym es **AGPL-3.0**. Se pueden tomar *ideas* de producto, pero no copiar
su código a esta app sin adoptar esa licencia. Todo lo de abajo es para reimplementar
desde cero.

## Lo que GymPro ya tiene

| openGym | GymPro |
| --- | --- |
| Plan semanal (una rutina por día) | ✅ `weekPlan` en la agenda |
| Series de calentamiento | ✅ marca `W` por serie |
| 1RM estimado | ✅ en la serie y en el PR |
| Detección de PR en vivo | ✅ banner + toast |
| Cargar un entreno pasado | ✅ desde la agenda |
| Export/import JSON | ✅ backup en Ajustes |
| Ejercicios propios ("con nombre y grupo alcanza") | ✅ y ahora también desde la rutina |
| Pantalla que no se apaga entrenando | ✅ Wake Lock (recién agregado) |
| PWA instalable y offline | ✅ (los dibujos ahora son locales) |
| Sin telemetría | ✅ todo local |

## Alto valor / esfuerzo bajo-medio

1. **Descanso propio por ejercicio.** Hoy el timer es global (75 s). Guardar
   `restSeconds` en `RoutineExercise` y usarlo al completar una serie. Cambia poco
   código y se nota en cada entreno (piernas pesadas ≠ curls).
2. **Ejercicios por tiempo.** Plancha, colgarse, farmer carry: `exerciseType`
   (`weight_reps` | `duration` | `distance_duration`) y una fila de set con cronómetro en
   vez de kg × reps. Sin esto el core y el cardio se registran mal.
3. **RIR / RPE por serie.** Un campo opcional de esfuerzo; es la señal que falta para
   decidir cuándo subir el peso.
4. **Reps por lado.** Zancadas, remo unilateral: hoy hay que sumar mentalmente.
5. **Heatmap anual estilo GitHub.** La agenda ya tiene los datos; es una vista nueva,
   pura presentación, y engancha mucho.
6. **Filtro por equipamiento.** El campo `equipmentType` ya existe en cada ejercicio y no
   se está usando para filtrar en el picker.

## Alto valor / esfuerzo alto

7. **Superseries.** Agrupar dos ejercicios en la rutina y alternarlos en el entreno
   (`supersetId` en `RoutineExercise` + navegación intercalada en la pantalla activa).
8. **Progresión con regla.** Elegir por rutina entre lineal, doble progresión o Greyskull
   y que la app proponga el peso de la próxima sesión. Encaja con los datos que ya se
   guardan y es lo que más diferencia a openGym de un cuaderno.
9. **Sesión libre.** Empezar a entrenar sin rutina y armarla sobre la marcha. Con el alta
   rápida por nombre que acabamos de agregar, es casi todo lo que falta.
10. **Importar desde Strong / Hevy / FitNotes.** Sólo si el objetivo es que alguien migre
    desde otra app; es un parser de CSV por cada una.
11. **Deloads planificados.** Marcar una rutina como excluida de la progresión.

## Para descartar (por ahora)

- **Passkeys, multiperfil, panel de admin, sync entre dispositivos**: son consecuencia de
  que openGym tenga backend. GymPro es 100 % local; meter servidor cambia el proyecto
  entero.
- **14 idiomas**: la app es en castellano rioplatense a propósito.
- **Notificaciones push del timer**: en iOS una PWA sólo puede notificar si está instalada
  y con permiso; el flash de pantalla + vibración cubre el 90 % del caso.
- **Compartir rutinas**: interesante, pero necesita un formato y un canal (link/QR) que hoy
  no existe.

## Idea propia que salió del relevamiento

- **Flash de pantalla al terminar el descanso** (openGym lo tiene como opción): en iOS el
  `navigator.vibrate` no existe, así que hoy el aviso del timer es sólo sonoro. Un flash
  visual es el reemplazo natural de la vibración en iPhone.
