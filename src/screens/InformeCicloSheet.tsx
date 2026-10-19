import { useMemo, useState } from 'react'
import { Dialog } from '../components/Dialog'
import { Sparkline } from '../components/Sparkline'
import { useAllExercises, useStore } from '../store/useStore'
import { R, S, T, deltaColor, ROW, SP } from '../theme'
import { informeCiclo, type FilaEjercicioCiclo } from '../utils/cycleReport'
import {
  candidatosACambiar, losQueMasSubieron, planificadasPorSemana, rangoCiclo, textoMarca, textoPct,
} from '../utils/informes'
import { SEMANA_CAMBIO, SEMANAS_PROGRAMA } from '../utils/program'
import { compartirImagen } from '../utils/shareImage'
import { generarImagenCiclo, type TonoCambio } from '../utils/shareInformes'
import { dayKey } from '../utils/trainingDays'
import { useHoy } from '../utils/useHoy'

// Subida en verde, baja en gris: una baja no es un error.
const colorCambio = (p: number | null) => (p == null ? S.mute : deltaColor(p))
/** Alto máximo de la barra de una semana. */
const ALTO_BARRA = 56
const tono = (p: number): TonoCambio => (p > 0 ? 'sube' : p < 0 ? 'baja' : 'igual')

/** Primera y última semana con datos dentro de [desde, hasta] (1-6), para "S1→S3". */
function extremosDeBloque(porSemana: Array<number | null>, desde: number, hasta: number): [number, number] | null {
  const con = porSemana.map((v, i) => (v == null ? null : i + 1)).filter((n): n is number => n != null && n >= desde && n <= hasta)
  return con.length >= 2 ? [con[0], con[con.length - 1]] : null
}

function Cambio({ pct, fuerte }: { pct: number | null; fuerte?: boolean }) {
  return (
    <span className="num" style={{ color: colorCambio(pct), fontWeight: fuerte ? 700 : 600, whiteSpace: 'nowrap' }}>
      {textoPct(pct)}
    </span>
  )
}

function FilaCiclo({ fila, nombre }: { fila: FilaEjercicioCiclo; nombre: string }) {
  const base = extremosDeBloque(fila.porSemana, 1, SEMANA_CAMBIO - 1)
  const alt = extremosDeBloque(fila.porSemana, SEMANA_CAMBIO, SEMANAS_PROGRAMA)
  const valores = fila.porSemana.filter((v): v is number => v != null)
  const literal = `${textoMarca(fila.kind, fila.antes)} → ${textoMarca(fila.kind, fila.despues)}`
  const partes: string[] = []
  if (base && fila.dentroDeBloque.base != null) partes.push(`semanas ${base[0]} a ${base[1]} ${textoPct(fila.dentroDeBloque.base)}`)
  if (alt && fila.dentroDeBloque.alt != null) partes.push(`semanas ${alt[0]} a ${alt[1]} ${textoPct(fila.dentroDeBloque.alt)}`)
  return (
    <li
      aria-label={`${nombre}: ${literal}, ${textoPct(fila.cambioPct)}${partes.length ? `. Dentro de cada bloque: ${partes.join(', ')}` : ''}`}
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 52px 58px', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${S.line}` }}
    >
      <div style={{ minWidth: 0 }} aria-hidden="true">
        <div style={{ fontSize: T.body, fontWeight: 600, color: S.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
        <div className="num" style={{ fontSize: T.caption, color: S.ink, marginTop: 2 }}>
          {textoMarca(fila.kind, fila.antes)} <span style={{ color: S.mute }}>→</span> {textoMarca(fila.kind, fila.despues)}
        </div>
        {(base || alt) && (
          <div style={{ fontSize: T.micro, color: S.dim, marginTop: 2, display: 'flex', flexWrap: 'wrap', columnGap: 8 }}>
            {base && fila.dentroDeBloque.base != null && (
              <span>S{base[0]}→S{base[1]} <Cambio pct={fila.dentroDeBloque.base} /></span>
            )}
            {alt && fila.dentroDeBloque.alt != null && (
              <span>S{alt[0]}→S{alt[1]} <Cambio pct={fila.dentroDeBloque.alt} /></span>
            )}
          </div>
        )}
      </div>
      <span style={{ height: 24 }} aria-hidden="true">
        {valores.length > 1 && <Sparkline values={valores} color={S.dim} puntoColor={colorCambio(fila.cambioPct)} width={52} height={24} />}
      </span>
      <span aria-hidden="true" style={{ textAlign: 'right', fontSize: T.body }}><Cambio pct={fila.cambioPct} fuerte /></span>
    </li>
  )
}

/**
 * Informe de un ciclo del plan de 6 semanas: asistencia, series y récords, y
 * qué pasó con cada ejercicio entre el principio y el final. Con el ciclo en
 * curso es un informe parcial.
 */
export function InformeCicloSheet({ inicio, fin, onClose }: { inicio: number; fin: number; onClose: () => void }) {
  const { workouts, weekPlan, weekOverrides, weeklyGoal, routines, inicioUso, addToast } = useStore()
  const exercises = useAllExercises()
  const nowTs = useHoy()
  const [compartiendo, setCompartiendo] = useState(false)

  const plan = useMemo(
    () => planificadasPorSemana({ weekPlan, weekOverrides, weeklyGoal, routines, inicioUso, workouts }),
    [weekPlan, weekOverrides, weeklyGoal, routines, inicioUso, workouts],
  )
  const informe = useMemo(
    () => informeCiclo({ workouts, exercises, inicio, fin, nowTs, planificadasEnSemana: plan }),
    [workouts, exercises, inicio, fin, nowTs, plan],
  )

  const nombreDe = useMemo(() => {
    const m = new Map(exercises.map((e) => [e.id, e.nameEs]))
    return (id: string) => m.get(id) ?? 'Ejercicio borrado'
  }, [exercises])

  const rango = rangoCiclo(inicio, fin)
  const pct = informe.asistencia != null ? Math.round(informe.asistencia * 100) : null
  // Con entrenos de más en alguna semana, "19 de 18" confunde: se dice el % del plan.
  const textoEntrenos = informe.planificadas > 0
    ? informe.sesiones <= informe.planificadas
      ? `${informe.sesiones} de ${informe.planificadas} entrenos (${pct}\u00a0%)`
      : `${informe.sesiones} entrenos (${pct}\u00a0% del plan)`
    : `${informe.sesiones} ${informe.sesiones === 1 ? 'entreno' : 'entrenos'}`
  const subieron = losQueMasSubieron(informe.ejercicios)
  const candidatos = candidatosACambiar(informe.ejercicios)

  const compartir = async () => {
    setCompartiendo(true)
    try {
      const blob = await generarImagenCiclo({
        titulo: `Ciclo ${rango}`,
        subtitulo: informe.semanaActual ? `Semana ${informe.semanaActual} de ${SEMANAS_PROGRAMA} · parcial` : textoEntrenos,
        cifras: [
          { valor: informe.planificadas > 0 ? `${pct}%` : String(informe.sesiones), etiqueta: informe.planificadas > 0 ? 'asistencia' : 'entrenos' },
          { valor: String(informe.series), etiqueta: 'series' },
          { valor: String(informe.records), etiqueta: informe.records === 1 ? 'récord' : 'récords', record: informe.records > 0 },
        ],
        semanas: informe.semanas.map((s) => (informe.semanaActual === s.n ? { ...s, planificadas: plan(s.lunes) } : s)),
        filas: informe.ejercicios.map((f) => ({
          nombre: nombreDe(f.exerciseId),
          detalle: `${textoMarca(f.kind, f.antes)} → ${textoMarca(f.kind, f.despues)}`,
          pct: textoPct(f.cambioPct).replace('\u00a0', ''),
          tono: tono(f.cambioPct),
        })),
      })
      await compartirImagen(blob, `gympro-ciclo-${dayKey(inicio)}.png`)
    } catch {
      addToast('No se pudo armar la imagen', 'info')
    } finally {
      setCompartiendo(false)
    }
  }

  const caja = { background: S.surf, borderRadius: R.lg, border: `1px solid ${S.line2}`, padding: `${SP[3]}px ${SP[4]}px` } as const

  return (
    <Dialog label={`Informe del ciclo ${rango}`} onClose={onClose} className="absolute inset-0 z-50 flex flex-col sheet-enter" style={{ background: S.bg }}>
      <div style={{ flexShrink: 0, padding: 'max(48px, calc(env(safe-area-inset-top, 0px) + 16px)) 16px 12px', borderBottom: `1px solid ${S.line2}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onClose}
          aria-label="Cerrar el informe"
          style={{ width: ROW.compact, height: ROW.compact, borderRadius: R.md, flexShrink: 0, background: S.surf2, border: `1px solid ${S.line2}`, color: S.ink, fontSize: T.h2, cursor: 'pointer', lineHeight: 1 }}
        >
          ‹
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">{informe.semanaActual ? 'Informe parcial' : 'Informe del ciclo'}</div>
          <div className="num" style={{ fontSize: 20, fontWeight: 700, color: S.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {rango}
          </div>
        </div>
        <button className="btn-secondary" onClick={compartir} disabled={compartiendo} style={{ padding: `0 ${SP[3]}px`, fontSize: T.body, flexShrink: 0 }}>
          {compartiendo ? 'Armando…' : 'Compartir'}
        </button>
      </div>

      <div className="flex-1 min-h-0 scroll-area" style={{ padding: `${SP[4]}px ${SP[4]}px ${SP[8]}px`, display: 'flex', flexDirection: 'column', gap: SP[3] }}>
        {/* Resumen: dónde va el ciclo, la asistencia y tres cifras */}
        <section aria-label="Resumen del ciclo" style={caja}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: SP[3] }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: T.h2, fontWeight: 700, color: S.ink, letterSpacing: '-0.01em' }}>
                {informe.semanaActual
                  ? <>Semana <span className="num">{informe.semanaActual}</span> de <span className="num">{SEMANAS_PROGRAMA}</span></>
                  : <>Ciclo completo</>}
              </h2>
              <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>
                {informe.semanaActual ? 'El informe se completa al terminar el ciclo.' : `Las ${SEMANAS_PROGRAMA} semanas del plan.`}
              </div>
            </div>
            {informe.planificadas > 0 && (
              <div style={{ textAlign: 'right', flexShrink: 0 }} aria-label={`Asistencia ${pct} por ciento`}>
                <div className="num" style={{ fontSize: T.h2, fontWeight: 700, color: S.good, lineHeight: 1.1 }}>{pct}&nbsp;%</div>
                <div style={{ fontSize: T.caption, color: S.dim }}>asistencia</div>
              </div>
            )}
          </div>
          <div role="list" aria-label="Cifras del ciclo" style={{ display: 'flex', marginTop: SP[3], paddingTop: SP[3], borderTop: `1px solid ${S.line}` }}>
            <div role="listitem" aria-label={textoEntrenos} style={{ flex: 1, minWidth: 0 }}>
              <div className="num" style={{ fontSize: T.h2, fontWeight: 700, color: S.ink, lineHeight: 1.1 }}>
                {informe.sesiones}
                {informe.planificadas > 0 && informe.sesiones <= informe.planificadas && <span style={{ fontSize: T.bodyLg, color: S.dim }}> de {informe.planificadas}</span>}
              </div>
              <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>{informe.sesiones === 1 && informe.planificadas === 0 ? 'entreno' : 'entrenos'}</div>
            </div>
            <div role="listitem" aria-label={`${informe.series} series`} style={{ flex: 1, minWidth: 0 }}>
              <div className="num" style={{ fontSize: T.h2, fontWeight: 700, color: S.ink, lineHeight: 1.1 }}>{informe.series}</div>
              <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>series</div>
            </div>
            <div role="listitem" aria-label={`${informe.records} ${informe.records === 1 ? 'récord' : 'récords'}`} style={{ flex: 1, minWidth: 0 }}>
              <div className="num" style={{ fontSize: T.h2, fontWeight: 700, color: informe.records ? S.acc2 : S.ink, lineHeight: 1.1 }}>{informe.records}</div>
              <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>{informe.records ? <><span aria-hidden="true">🏆</span> </> : ''}{informe.records === 1 ? 'récord' : 'récords'}</div>
            </div>
          </div>
        </section>

        {/* Por semana: barras de alto proporcional a los entrenos hechos sobre los planificados */}
        <section aria-label="Por semana" style={caja}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: SP[2] }}>
            <h2 style={{ fontSize: T.title, fontWeight: 700, color: S.ink }}>Por semana</h2>
            <span style={{ fontSize: T.caption, color: S.dim, whiteSpace: 'nowrap' }}>
              {informe.planificadas ? 'hechos / planificados · series' : 'entrenos · series'}
            </span>
          </div>
          <div role="list" aria-label="Semanas del ciclo" style={{ display: 'flex', alignItems: 'stretch', marginTop: SP[3] }}>
            {informe.semanas.map((s) => {
              const futura = s.lunes > nowTs
              const enCurso = !futura && informe.semanaActual === s.n
              // La semana en curso cuenta para la asistencia sólo lo hecho; acá se muestra el plan entero.
              const planificadas = enCurso ? plan(s.lunes) : s.planificadas
              const cumplida = planificadas > 0 && s.sesiones >= planificadas
              // Sin plan, la barra es sobre la semana con más entrenos.
              const maxSesiones = Math.max(1, ...informe.semanas.map((x) => x.sesiones))
              const proporcion = planificadas > 0 ? Math.min(1, s.sesiones / planificadas) : s.sesiones / maxSesiones
              return (
                <div key={s.n} style={{ display: 'contents' }}>
                  {s.n === SEMANA_CAMBIO && <span aria-hidden="true" style={{ width: 1, background: S.line2, margin: `0 ${SP[1]}px` }} />}
                  <div
                    role="listitem"
                    aria-label={futura ? `Semana ${s.n}: todavía no empezó` : `Semana ${s.n}${enCurso ? ', en curso' : ''}: ${s.sesiones}${planificadas ? ` de ${planificadas}` : ''} entrenos, ${s.series} series${cumplida ? ', cumplida' : ''}`}
                    style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: futura ? 0.45 : 1 }}
                  >
                    <span style={{ fontSize: T.caption, fontWeight: 700, color: futura ? S.dim : S.ink }}>S{s.n}</span>
                    <span aria-hidden="true" style={{ height: ALTO_BARRA, display: 'flex', alignItems: 'flex-end' }}>
                      <span style={{
                        display: 'block', width: 22, borderRadius: 6,
                        height: Math.max(4, Math.round(proporcion * ALTO_BARRA)),
                        background: futura || s.sesiones === 0 ? S.surf2 : cumplida ? S.good : S.faint,
                      }} />
                    </span>
                    <span className="num" style={{ fontSize: T.bodyLg, fontWeight: 700, color: cumplida ? S.good : S.ink }}>
                      {futura ? '–' : planificadas ? `${s.sesiones}/${planificadas}` : s.sesiones}
                    </span>
                    <span className="num" style={{ fontSize: T.caption, color: S.dim, minHeight: 16 }}>{futura ? '' : s.series}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: SP[2], fontSize: T.caption, color: S.dim, marginTop: SP[3] }}>
            <span>Semanas 1-{SEMANA_CAMBIO - 1}</span>
            <span>Cambio de bloque · semanas {SEMANA_CAMBIO}-{SEMANAS_PROGRAMA}</span>
          </div>
        </section>

        {/* Ejercicios */}
        <section aria-label="Ejercicios" style={{ ...caja, paddingBottom: 6 }}>
          <h2 style={{ fontSize: T.title, fontWeight: 700, color: S.ink }}>Ejercicios</h2>
          {informe.ejercicios.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: SP[2], padding: `${SP[5]}px ${SP[3]}px ${SP[3]}px` }}>
              <span aria-hidden="true" style={{ width: ROW.compact, height: ROW.compact, borderRadius: R.md, background: S.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: T.h2 }}>🏋️</span>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: S.ink }}>Todavía no hay comparación</div>
              <p style={{ fontSize: T.caption, color: S.dim, lineHeight: 1.5 }}>
                {informe.semanaActual && informe.semanaActual < SEMANA_CAMBIO
                  ? `Aparece cuando hagas los ejercicios en las semanas ${SEMANA_CAMBIO} a ${SEMANAS_PROGRAMA}: la mejor serie del principio contra la del final.`
                  : 'Ningún ejercicio se hizo en los dos bloques del ciclo, así que no hay principio y final para comparar.'}
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: T.micro, color: S.dim, marginTop: 2, lineHeight: 1.5 }}>
                Mejor serie del principio contra la del final. En la semana {SEMANA_CAMBIO} cambian las reps: la comparación limpia es dentro de cada bloque.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: T.caption, color: S.dim, margin: '10px 0 6px' }}>
                {informe.medianaCambio != null && <span>Mediana <Cambio pct={informe.medianaCambio} fuerte /></span>}
                <span><b className="num" style={{ color: S.good }}>{informe.subieron}</b> subieron</span>
                <span><b className="num" style={{ color: S.mute }}>{informe.iguales}</b> {informe.iguales === 1 ? 'igual' : 'iguales'}</span>
                <span><b className="num" style={{ color: S.dim }}>{informe.bajaron}</b> {informe.bajaron === 1 ? 'bajó' : 'bajaron'}</span>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {informe.ejercicios.map((f) => <FilaCiclo key={f.exerciseId} fila={f} nombre={nombreDe(f.exerciseId)} />)}
              </ul>
            </>
          )}
        </section>

        {subieron.length > 0 && (
          <section aria-label="Lo que más subió" style={caja}>
            <h2 style={{ fontSize: T.body, fontWeight: 700, color: S.ink, marginBottom: 6 }}>Lo que más subió</h2>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {subieron.map((f, i) => (
                <li key={f.exerciseId} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '6px 0', fontSize: T.body }}>
                  <span className="num" style={{ color: S.mute, width: 14 }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0, color: S.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombreDe(f.exerciseId)}</span>
                  <Cambio pct={f.cambioPct} fuerte />
                </li>
              ))}
            </ol>
          </section>
        )}

        {candidatos.length > 0 && (
          <section aria-label="Lo que quedó igual" style={caja}>
            <h2 style={{ fontSize: T.body, fontWeight: 700, color: S.ink }}>Lo que quedó igual</h2>
            <p style={{ fontSize: T.micro, color: S.dim, marginTop: 2, lineHeight: 1.5 }}>
              Candidatos a cambiar: no subieron ni dentro de cada bloque. Probá otra variante del ejercicio, otro rango de reps o una semana de descarga.
            </p>
            <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0 }}>
              {candidatos.map((f) => (
                <li key={f.exerciseId} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '6px 0', fontSize: T.body, borderTop: `1px solid ${S.line}` }}>
                  <span style={{ flex: 1, minWidth: 0, color: S.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombreDe(f.exerciseId)}</span>
                  <span className="num" style={{ color: S.dim, fontSize: T.caption, whiteSpace: 'nowrap' }}>
                    {textoMarca(f.kind, f.antes)} → {textoMarca(f.kind, f.despues)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Dialog>
  )
}
