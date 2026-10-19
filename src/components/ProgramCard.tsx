import { useEffect, useState, type ReactNode } from 'react'
import { useHoy } from '../utils/useHoy'
import { useStore } from '../store/useStore'
import { tieneVariante, VARIANTE_LABEL } from '../utils/routineVariant'
import { finDeCiclo, SEMANAS_PROGRAMA, SEMANA_CAMBIO, semanaActual } from '../utils/program'
import { R, S, T, ROW, SP } from '../theme'

const fechaCorta = (ts: number) => new Date(ts).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

const caja = { background: S.surf, borderRadius: R.lg, border: `1px solid ${S.line2}`, padding: `${SP[3]}px ${SP[4]}px ${SP[4]}px` } as const
const titulo = { fontSize: T.title, fontWeight: 700, color: S.ink } as const
const envoltorio = { padding: `${SP[3]}px 22px 0` } as const

/**
 * El bloque Semana de Inicio: en qué semana del plan estás, con la barra de
 * seis segmentos, y adentro (`children`) los días de la semana y la línea de
 * cifras. En la semana 4 las rutinas pasan solas a Semanas 4-6; pasada la 6
 * pregunta si arrancás de nuevo. Sin plan, el bloque es sólo la semana.
 */
export function ProgramCard({ children }: { children?: ReactNode }) {
  const { routines, programa, fijarSemanaPrograma, sincronizarPrograma, terminarPrograma, abrirInforme } = useStore()
  const nowTs = useHoy()
  const [eligiendo, setEligiendo] = useState(false)

  useEffect(() => { sincronizarPrograma() }, [sincronizarPrograma])

  const sinPlan = !routines.some(tieneVariante) || programa?.terminado

  // El domingo la tarjeta ya habla de la semana que arranca mañana: es el día
  // en que uno se organiza, y la semana que se elige ese día es la que viene.
  const arrancaManana = programa != null && new Date(nowTs).getDay() === 0
  // La misma regla del domingo que el store (`semanaActual`): el domingo ya se habla de la semana que arranca mañana.
  const semana = !sinPlan && programa ? semanaActual(programa, nowTs) : null
  const terminado = semana != null && semana > SEMANAS_PROGRAMA

  const chips = (
    <div role="group" aria-label="Semana del plan" style={{ display: 'grid', gridTemplateColumns: `repeat(${SEMANAS_PROGRAMA}, 1fr)`, gap: 6, marginTop: SP[3] }}>
      {Array.from({ length: SEMANAS_PROGRAMA }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => { fijarSemanaPrograma(n); setEligiendo(false) }}
          aria-pressed={semana === n}
          className="num"
          style={{
            minHeight: ROW.compact, borderRadius: R.md, cursor: 'pointer', fontSize: T.bodyLg, fontWeight: 700,
            background: semana === n ? 'rgba(232,99,74,0.15)' : S.surf2,
            border: `1px solid ${semana === n ? 'rgba(232,99,74,0.4)' : S.line2}`,
            color: semana === n ? S.acc : S.ink,
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )

  // Sólo la semana, sin plan: el mismo bloque con el título "Esta semana".
  const soloSemana = (
    <div style={envoltorio}>
      <section aria-label="Esta semana" style={caja}>
        <div style={titulo}>Esta semana</div>
        {children}
      </section>
    </div>
  )

  if (sinPlan) return soloSemana

  if (semana == null) {
    return (
      <>
        <div style={envoltorio}>
          <section aria-label="Semana del plan" style={caja}>
            <div style={{ fontSize: T.body, fontWeight: 700, color: S.ink }}>¿En qué semana del plan estás?</div>
            <div style={{ fontSize: T.caption, color: S.dim, marginTop: 2 }}>
              Con eso, en la semana {SEMANA_CAMBIO} las rutinas pasan solas a {VARIANTE_LABEL.alt}.
            </div>
            {chips}
          </section>
        </div>
        {soloSemana}
      </>
    )
  }

  if (terminado) {
    return (
      <>
        <div style={envoltorio}>
          <section aria-label="Plan terminado" style={caja}>
            <div style={{ fontSize: T.body, fontWeight: 700, color: S.ink }}>Terminaste las {SEMANAS_PROGRAMA} semanas del plan</div>
            <button
              className="btn-secondary"
              onClick={() => abrirInforme({ tipo: 'ciclo', inicio: programa!.inicio, fin: finDeCiclo(programa!.inicio) })}
              style={{ width: '100%', marginTop: SP[3], fontSize: T.bodyLg }}
            >
              Ver el informe
            </button>
            <div style={{ fontSize: T.caption, color: S.dim, marginTop: SP[3] }}>¿Arrancás de nuevo desde la semana 1?</div>
            <div style={{ display: 'flex', gap: SP[2], marginTop: SP[3] }}>
              <button
                onClick={() => fijarSemanaPrograma(1)}
                style={{ flex: 1, minHeight: ROW.compact, borderRadius: R.md, border: 'none', background: S.acc, color: S.onAcc, fontWeight: 700, fontSize: T.bodyLg, cursor: 'pointer' }}
              >
                Arrancar de nuevo
              </button>
              <button
                onClick={terminarPrograma}
                style={{ flex: 1, minHeight: ROW.compact, borderRadius: R.md, border: `1px solid ${S.line2}`, background: S.surf2, color: S.ink, fontWeight: 600, fontSize: T.bodyLg, cursor: 'pointer' }}
              >
                Terminar el plan
              </button>
            </div>
          </section>
        </div>
        {soloSemana}
      </>
    )
  }

  const inicio = new Date(programa!.inicio)
  const cambio = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + (SEMANA_CAMBIO - 1) * 7).getTime()
  const fin = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + SEMANAS_PROGRAMA * 7 - 1).getTime()
  const enAlt = semana >= SEMANA_CAMBIO
  const bloque = VARIANTE_LABEL.alt.replace('Semanas ', '')

  return (
    <div style={envoltorio}>
      <section aria-label={`Semana ${semana} de ${SEMANAS_PROGRAMA} del plan`} style={caja}>
        <button
          onClick={() => setEligiendo((v) => !v)}
          aria-expanded={eligiendo}
          aria-label={`Semana ${semana} de ${SEMANAS_PROGRAMA}. Tocá para corregir la semana`}
          style={{ display: 'block', width: '100%', minHeight: ROW.compact, background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: 'inherit' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: SP[3] }}>
            <span style={{ ...titulo, whiteSpace: 'nowrap' }}>
              Semana <span className="num">{semana}</span> de <span className="num">{SEMANAS_PROGRAMA}</span>
            </span>
            {arrancaManana && <span style={{ fontSize: T.caption, color: S.dim, whiteSpace: 'nowrap' }}>desde mañana</span>}
          </div>
          <div aria-hidden="true" style={{ display: 'flex', gap: 5, marginTop: SP[2] }}>
            {Array.from({ length: SEMANAS_PROGRAMA }, (_, i) => (
              <span key={i} style={{
                flex: 1, height: 6, borderRadius: 3,
                background: i + 1 < semana ? S.acc : i + 1 === semana ? S.accDim : S.surf2,
                opacity: i + 1 === semana ? 0.65 : 1,
                marginLeft: i === SEMANA_CAMBIO - 1 ? 4 : 0,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: SP[2], fontSize: T.micro, color: S.dim, marginTop: 6 }}>
            <span>{enAlt ? VARIANTE_LABEL.alt : VARIANTE_LABEL.base}</span>
            <span>{enAlt ? `termina el ${fechaCorta(fin)}` : `bloque ${bloque} desde el ${fechaCorta(cambio)}`}</span>
          </div>
        </button>
        {eligiendo && (
          <div style={{ paddingBottom: SP[2] }}>
            <div style={{ fontSize: T.caption, color: S.dim, marginTop: SP[2] }}>¿En qué semana estás?</div>
            {chips}
          </div>
        )}
        {children}
      </section>
    </div>
  )
}
