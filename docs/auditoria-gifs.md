# Auditoría de GIFs de ejercicios

Revisión de los 60 ejercicios del catálogo: para cada uno se verificó que el GIF
cargue, que el `mediaId` corresponda al ejercicio que decimos que es, y —lo más
importante— **se miraron los frames**, porque el nombre puede coincidir y la
animación mostrar otra cosa.

Cómo reproducirla: `Actions → Auditar GIFs de ejercicios → Run workflow`. Deja
como artifact el reporte y las hojas de contacto con dos frames de cada GIF
(`scripts/audit-gifs.mjs`).

## Estado general

- **60/60 GIF cargan** desde `static.exercisedb.dev`. Ninguno está roto en producción.
- **8 mostraban un ejercicio distinto** al que decía la ficha. Corregidos.
- El resto tenía nombres que no coinciden con los nuestros pero el GIF correcto
  (ExerciseDB llama "lever seated fly" al pec deck y "wheel rollerout" a la rueda
  abdominal), así que quedaron como estaban.

## Correcciones aplicadas

| Ejercicio | El GIF mostraba | Ahora muestra |
|---|---|---|
| `pecho-02` Press Inclinado Mancuernas | press inclinado **a un brazo** | press inclinado con las dos mancuernas |
| `pecho-03` Press de Banca (Máquina) | press con **mancuernas** en banco plano | press de pecho en máquina |
| `espalda-01` Jalón al pecho | jalón **de pie** en polea | jalón sentado en máquina |
| `espalda-02` Remo en Máquina | remo **con barra** inclinado | remo sentado en máquina con pecho apoyado |
| `espalda-03` Remo supino | remo con **mancuerna a una mano** | *(sin cambio — se corrigió la ficha)* |
| `triceps-01` Extensión Overhead | extensión overhead **a un brazo** | extensión overhead a dos manos |
| `piernas-08` Sentadilla Búlgara | versión **con barra** | versión con mancuernas, como dice la ficha |
| `biceps-05` Curl Predicador | idéntico a `biceps-02` | predicador con mancuerna |

En `espalda-03` el GIF era correcto y la ficha estaba mal: figuraba como "Remo
supino" en máquina cuando la animación siempre fue un remo con mancuerna a una
mano. Se corrigió el nombre, el equipamiento y las instrucciones en vez del GIF —
además el catálogo no tenía ningún remo unilateral con mancuerna.

## Duplicados que quedan a propósito

`piernas-10` y `gluteos-01` son los dos hip thrust con barra y comparten GIF. No
se tocaron: aparecen en grupos musculares distintos y tiene sentido encontrarlo
tanto en pierna como en glúteo. `triceps-01` y `triceps-04` ya no comparten GIF:
el unilateral se quedó con la animación a un brazo.

## Problemas de infraestructura encontrados

1. **La API de ExerciseDB se mudó.** `www.exercisedb.dev/api/v1` devuelve 404
   desde 2026; la versión gratuita vive en `oss.exercisedb.dev/api/v1`. El script
   `refresh-gifs.mjs` apuntaba a la vieja, así que venía fallando.
2. **Paginación por cursor.** La API capa el `limit` (pedís 100, devuelve 25) y
   pagina con `?after=<meta.nextCursor>`. El código anterior usaba `offset` y
   cortaba al recibir menos ítems de los pedidos, así que veía 25 ejercicios de
   los 1500 que hay.
3. **Rate limiting agresivo.** Responde 429 con facilidad: hay que espaciar los
   pedidos y reintentar con espera creciente.
4. **El refresco automático ahora es solo reporte.** Antes reescribía
   `exercises.ts` con cualquier match por nombre de score ≥ 0,55, que es
   justamente como se metieron varios de los GIF equivocados. Ahora el umbral es
   0,75 y hay que pasarle `APPLY=true` para que escriba.
