import { useHoy } from '../utils/useHoy'
import { useStore } from '../store/useStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { BackupReminder } from '../components/BackupReminder'
import { plannedDowSet, dayKey, inicioDeFaltas, routineColor } from '../utils/trainingDays'
import { planDeSemana } from '../utils/weekPlan'
import { prediccionDelPlan } from '../utils/planOrder'
import { haceCuanto } from '../utils/relativeDate'
import { seriesEfectivas } from '../utils/volume'
import { ProgramCard } from '../components/ProgramCard'
import { WeeklyReview } from '../components/WeeklyReview'
import { ResumenMesCard } from '../components/ResumenMesCard'
import { WrappedCard } from '../components/WrappedCard'
import { WeeklyMuscleSets } from '../components/WeeklyMuscleSets'
import { RoutineIcon } from '../components/RoutineIcon'
import { R, S, T, ROW, SP } from '../theme'

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
/** Margen lateral de Inicio; el hero y la franja de cifras lo anulan para ir de borde a borde. */
const LADO = 22

function formatDate() {
  const now = new Date()
  const weekday = now.toLocaleDateString('es-AR', { weekday: 'long' })
  const day = now.getDate()
  const month = now.toLocaleDateString('es-AR', { month: 'long' })
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`
}

export function HomeScreen() {
  const { userName, avatarPhoto, workouts, routines, prs, weekPlan: planBase, weekOverrides, weeklyGoal, setActiveTab, openAgendaDay, getArchivedRoutineName, inicioUso } = useStore()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)

  const finishedWorkouts = workouts.filter(w => w.finishedAt)
  const sortedWorkouts = [...finishedWorkouts].sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  const lastWorkout = sortedWorkouts[0]
  const lastRoutineVigente = lastWorkout ? routines.find(r => r.id === lastWorkout.routineId) : undefined
  const lastRoutine = lastWorkout
    ? (lastRoutineVigente ?? getArchivedRoutineName(lastWorkout.routineId))
    : null

  const nowTs = useHoy()
  // La semana en curso puede tener un plan propio distinto de la semana por defecto.
  const weekPlan = planDeSemana(planBase, weekOverrides, nowTs)
  const diasPlanificados = plannedDowSet(weekPlan, routines.map(r => r.id)).size

  // La semana en curso, de lunes a domingo: hecho, planificado o descanso.
  const hoy = new Date(nowTs)
  const hoyIdx = (hoy.getDay() + 6) % 7
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoyIdx)
  const diasEntrenados = new Set(finishedWorkouts.map(w => dayKey(w.startedAt)))
  // Los días anteriores a empezar a usar la app no son faltas ni cuentan para la meta.
  const desde = inicioDeFaltas(inicioUso, finishedWorkouts)
  const semana = DIAS.map((letra, i) => {
    const fecha = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i)
    const antesDeEmpezar = desde != null && fecha.getTime() < desde
    const rutinaPlan = !antesDeEmpezar && weekPlan[i] && routines.some(r => r.id === weekPlan[i]) ? weekPlan[i] : null
    return {
      letra,
      hecho: diasEntrenados.has(dayKey(fecha.getTime())),
      planificado: !!rutinaPlan,
      pasado: i < hoyIdx,
      esHoy: i === hoyIdx,
    }
  })
  const hechosSemana = semana.filter(d => d.hecho).length
  // La meta de Ajustes manda; sin meta, los días de la semana tipo.
  const metaSemana = weeklyGoal ?? semana.filter(d => d.planificado).length

  // La franja de cifras: entrenos del mes, y series y récords de los últimos
  // 7 días (no desde el lunes: un domingo "esta semana" ya casi terminó).
  const entrenosDelMes = finishedWorkouts.filter(w => {
    const d = new Date(w.startedAt)
    return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth()
  }).length
  const hace7 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 6).getTime()
  const ultimos7 = finishedWorkouts.filter(w => w.startedAt >= hace7)
  const series7 = seriesEfectivas(ultimos7)
  // Los récords quedan fechados con el inicio del entreno en que se hicieron.
  const fechas7 = new Set(ultimos7.map(w => w.startedAt))
  const records7 = prs.reduce((n, p) => n + [p, ...(p.history ?? [])].filter(h => fechas7.has(h.date)).length, 0)

  // Last session stats (con días de calendario: el cambio de horario no corre la cuenta)
  const daysAgoStr = lastWorkout ? haceCuanto(lastWorkout.startedAt, nowTs) : ''
  const lastTotalSets = lastWorkout?.exercises.reduce((a, e) => a + e.sets.filter(s => !s.isWarmup).length, 0) ?? 0
  const lastRecords = lastWorkout
    ? prs.reduce((n, p) => n + [p, ...(p.history ?? [])].filter(h => h.date === lastWorkout.startedAt).length, 0)
    : 0

  // Qué toca hoy. La semana tipo dice qué días se entrena y en qué orden van
  // las rutinas, pero no ata cada rutina a un día: toca la siguiente a la
  // última que hiciste. Si faltaste el miércoles, el viernes te espera brazos.
  const hoyDow = hoyIdx  // 0 = lunes
  const routineIds = routines.map(r => r.id)
  // La misma cuenta que la Agenda: en una semana con plan propio manda la
  // rutina que se puso ese día, y si no, la siguiente en el orden.
  const delPlan = prediccionDelPlan(planBase, routineIds, finishedWorkouts, nowTs, 14, weekOverrides).values().next().value ?? null
  const proximaPlan = delPlan ? routines.find(r => r.id === delPlan) : undefined
  const yaEntreneHoy = lastWorkout
    ? new Date(lastWorkout.startedAt).toDateString() === new Date(nowTs).toDateString()
    : false
  const hoySeEntrena = !!weekPlan[hoyDow] && routineIds.includes(weekPlan[hoyDow]!)

  // Sin semana tipo: la rutina que hace más tiempo que no tocás, evitando
  // repetir la última.
  const lastPerformedAt = new Map<string, number>()
  for (const w of sortedWorkouts) {
    if (!lastPerformedAt.has(w.routineId)) lastPerformedAt.set(w.routineId, w.finishedAt ?? w.startedAt)
  }
  // Una rutina sin ejercicios no se puede arrancar: el entreno quedaba sin
  // forma de terminarse.
  const conEjercicios = routines.filter(r => r.exercises.length > 0)
  const otherRoutines = conEjercicios.filter(r => r.id !== lastWorkout?.routineId)
  const suggestionPool = otherRoutines.length > 0 ? otherRoutines : conEjercicios
  const porRotacion = [...suggestionPool].sort(
    (a, b) => (lastPerformedAt.get(a.id) ?? 0) - (lastPerformedAt.get(b.id) ?? 0)
  )[0]
  const suggestedRoutine = (proximaPlan && proximaPlan.exercises.length > 0 ? proximaPlan : undefined) ?? porRotacion
  const esDelPlan = !!proximaPlan && hoySeEntrena && !yaEntreneHoy
  // Día de descanso según el plan: se dice, no se esconde.
  const esDescansoPlanificado = diasPlanificados > 0 && !hoySeEntrena && !yaEntreneHoy
  const suggestedExerciseCount = suggestedRoutine?.exercises.length ?? 0
  const approxMinutes = Math.round((suggestedRoutine?.exercises.reduce((a, e) => a + e.sets * 2.5, 0) ?? 0))
  const etiquetaHoy = yaEntreneHoy ? 'Próximo entreno' : esDelPlan ? 'Hoy te toca' : esDescansoPlanificado ? 'Hoy descansás · podés adelantar' : 'Próximo entreno'

  const userInitial = userName?.charAt(0)?.toUpperCase() ?? '?'

  /* El bloque Semana: los días (relleno = entrenado, aro = planificado) y la línea de cifras. */
  const bloqueSemana = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${SP[4]}px 4px 0` }} role="list" aria-label="Esta semana">
        {semana.map((d) => {
          const estado = d.hecho ? 'entrenado' : d.planificado ? (d.pasado ? 'planificado, no se hizo' : 'planificado') : 'descanso'
          const borde = d.hecho ? 'none'
            : d.esHoy ? `2px dashed ${d.planificado ? S.acc : S.faint}`
            : d.planificado ? `2px solid ${d.pasado ? S.faint : S.mute}` : 'none'
          return (
            <div key={d.letra} role="listitem" aria-label={`${d.letra}: ${estado}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SP[2], width: 36 }}>
              <span style={{ fontSize: T.caption, fontWeight: 700, color: d.esHoy ? S.ink : S.dim }}>{d.letra}</span>
              <span style={{
                width: 28, height: 28, borderRadius: 14, boxSizing: 'border-box',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: d.hecho ? S.good : 'transparent', border: borde,
              }}>
                {d.hecho
                  ? <span style={{ color: S.onAcc, fontSize: T.caption, fontWeight: 700 }}>✓</span>
                  : (!d.planificado || d.esHoy) && <span style={{ width: 6, height: 6, borderRadius: 3, background: d.esHoy ? S.dim : S.faint }} />}
              </span>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: SP[2], rowGap: SP[1], marginTop: SP[3], paddingTop: SP[3], borderTop: `1px solid ${S.line}`, fontSize: T.caption, color: S.dim }}>
        <span style={{ whiteSpace: 'nowrap' }}>
          Esta semana <b className="num" style={{ color: S.ink }}>{hechosSemana}</b>
          {metaSemana > 0 ? <span className="num">/{metaSemana}</span> : hechosSemana === 1 ? ' entreno' : ' entrenos'}
        </span>
        <WeeklyReview />
      </div>
    </>
  )

  const cifra = (valor: number, etiqueta: string, color = S.ink) => (
    <div style={{ flex: 1, minWidth: 0, padding: `${SP[3]}px ${SP[3]}px` }}>
      <div className="num" style={{ fontSize: T.h2, fontWeight: 700, lineHeight: 1.1, color }}>{valor}</div>
      <div style={{ fontSize: T.micro, color: S.dim, marginTop: SP[1], textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{etiqueta}</div>
    </div>
  )

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
      <div className="flex-1 min-h-0 scroll-area">

        {/* Header */}
        <div style={{ paddingTop: 'max(60px, calc(env(safe-area-inset-top, 0px) + 22px))', paddingLeft: LADO, paddingRight: LADO }}>
          <div className="flex justify-between items-center">
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: T.caption, fontWeight: 500, color: S.dim, letterSpacing: 0.3 }}>
                {formatDate()}
              </div>
              <div style={{ fontSize: T.h1, fontWeight: 700, letterSpacing: -0.4, marginTop: 2, color: S.ink }}>
                Hola, {userName}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('perfil')}
              aria-label="Abrir perfil"
              style={{
                flexShrink: 0, width: 44, height: 44, borderRadius: 22,
                background: S.surf2, border: `2px solid ${S.acc}`, overflow: 'hidden', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: T.title, fontWeight: 700, color: S.acc,
              }}
            >
              {avatarPhoto
                ? <img src={avatarPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : userInitial}
            </button>
          </div>
        </div>

        {/* Hoy: la acción del día, sin tarjeta. La jerarquía la hacen el tamaño y el espacio. */}
        {suggestedRoutine ? (
          <section
            aria-label={etiquetaHoy}
            style={{
              marginTop: SP[3], padding: `${SP[4]}px ${LADO}px ${SP[4]}px`,
              background: 'linear-gradient(180deg, rgba(232,99,74,0.14), rgba(232,99,74,0) 85%)',
              borderBottom: `1px solid ${S.line}`,
            }}
          >
            <div className="eyebrow" style={{ color: S.acc }}>{etiquetaHoy}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: SP[3], marginTop: SP[2] }}>
              <RoutineIcon routine={suggestedRoutine} size={18} boxed />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: S.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {suggestedRoutine.name}
                </div>
                <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>
                  <span className="num">{suggestedExerciseCount}</span> ejercicios · ~<span className="num">{approxMinutes}</span> min
                </div>
              </div>
            </div>
            <button
              onClick={() => startWorkout(suggestedRoutine.id)}
              style={{
                width: '100%', marginTop: SP[4], background: S.acc, border: 'none', borderRadius: R.md,
                color: S.onAcc, fontSize: T.title, fontWeight: 700, minHeight: ROW.regular,
                cursor: 'pointer', letterSpacing: 0.3,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SP[2],
              }}
            >
              <span style={{ fontSize: T.body }} aria-hidden="true">▶</span> Iniciar entreno
            </button>
            {/* Cualquier otra rutina, sin pasar por la pestaña Rutinas */}
            {conEjercicios.length > 1 && (
              <div
                className="flex gap-2"
                style={{ marginTop: SP[3], overflowX: 'auto', scrollbarWidth: 'none' }}
              >
                {conEjercicios.filter(r => r.id !== suggestedRoutine.id).map(r => (
                  <button
                    key={r.id}
                    onClick={() => startWorkout(r.id)}
                    aria-label={`Iniciar ${r.name}`}
                    style={{
                      flexShrink: 0, minHeight: 40, padding: `0 ${SP[4]}px`, borderRadius: 999,
                      background: 'transparent', border: `1px solid ${S.line2}`,
                      color: S.dim, fontSize: T.body, fontWeight: 600,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, background: routineColor(r.id, routines), flexShrink: 0 }} />
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <div style={{ padding: `${SP[4]}px ${LADO}px 0` }}>
            <div style={{ borderRadius: R.lg, padding: SP[5], border: `1.5px dashed ${S.line2}`, textAlign: 'center' }}>
              <div style={{ fontSize: T.display, marginBottom: SP[2] }} aria-hidden="true">🏋️</div>
              <p style={{ color: S.ink, fontWeight: 600, fontSize: T.body }}>¡Tu primera sesión te espera!</p>
              <button
                onClick={() => setActiveTab('rutinas')}
                style={{ color: S.acc, fontSize: T.body, fontWeight: 600, marginTop: SP[2], minHeight: ROW.compact, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Crear primera rutina →
              </button>
            </div>
          </div>
        )}

        {/* Tres cifras sin tarjeta: el mes, la semana y los récords de la semana. */}
        {finishedWorkouts.length > 0 && (
          <div
            role="list"
            aria-label="Cifras del mes y de los últimos 7 días"
            style={{ display: 'flex', padding: `0 ${LADO - SP[3]}px`, borderBottom: `1px solid ${S.line}` }}
          >
            <div role="listitem" aria-label={`${entrenosDelMes} entrenos en ${MESES_CORTOS[hoy.getMonth()]}`} style={{ flex: 1, minWidth: 0, display: 'flex', borderRight: `1px solid ${S.line}` }}>
              {cifra(entrenosDelMes, `Entrenos · ${MESES_CORTOS[hoy.getMonth()]}`)}
            </div>
            <div role="listitem" aria-label={`${series7} series en los últimos 7 días`} style={{ flex: 1, minWidth: 0, display: 'flex', borderRight: `1px solid ${S.line}` }}>
              {cifra(series7, 'Series · 7 d')}
            </div>
            <div role="listitem" aria-label={`${records7} récords en los últimos 7 días`} style={{ flex: 1, minWidth: 0, display: 'flex' }}>
              {cifra(records7, 'Récords · 7 d', records7 > 0 ? S.acc2 : S.ink)}
            </div>
          </div>
        )}

        {/* Del 1/12 al 15/1: "Tu año en el gym" */}
        <WrappedCard />

        {/* Semana: en qué semana del plan estás, los días y las cifras de esta semana y la pasada */}
        <ProgramCard>{bloqueSemana}</ProgramCard>

        {/* Del 1 al 7 de cada mes, cómo fue el mes pasado */}
        <ResumenMesCard />

        {/* Última sesión: una fila que abre el entreno en la Agenda */}
        {lastWorkout && lastRoutine && (
          <div style={{ padding: `${SP[1]}px ${LADO}px 0` }}>
            <button
              onClick={() => openAgendaDay(lastWorkout.startedAt)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: SP[3], textAlign: 'left',
                background: 'none', border: 'none', padding: `${SP[3]}px 4px`, minHeight: ROW.compact,
                cursor: 'pointer', color: S.ink,
              }}
            >
              {lastRoutineVigente
                ? <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, flexShrink: 0, background: routineColor(lastRoutineVigente.id, routines) }} />
                : <span style={{ fontSize: T.bodyLg, flexShrink: 0 }} aria-hidden="true">{lastRoutine.emoji}</span>}
              <span style={{ flex: 1, minWidth: 0, fontSize: T.caption, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ color: S.dim }}>Última sesión · {daysAgoStr} · </span>
                <b style={{ color: S.ink }}>{lastRoutine.name}</b>
                <span style={{ color: S.dim }}>
                  {' · '}<span className="num">{lastWorkout.durationMin ?? 0}</span> min · <span className="num">{lastTotalSets}</span> series
                  {lastRecords > 0 && <> · <span className="num" style={{ color: S.acc2 }}>{lastRecords}</span> {lastRecords === 1 ? 'récord' : 'récords'}</>}
                </span>
              </span>
              <span style={{ color: S.dim, fontSize: T.title, flexShrink: 0 }} aria-hidden="true">›</span>
            </button>
          </div>
        )}

        {/* Series de la semana por músculo, contra la franja de 10 a 20 */}
        <WeeklyMuscleSets />

        {/* La copia de seguridad, abajo de todo y en una línea */}
        <BackupReminder />

        <div style={{ height: SP[6] }} />
      </div>

    </div>
  )
}
