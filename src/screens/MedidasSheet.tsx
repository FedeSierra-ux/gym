import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Dialog } from '../components/Dialog'
import { Sparkline } from '../components/Sparkline'
import { toDateInputValue, fromDateInputValue } from '../utils/dates'
import { decimalInputProps, parseDecimal, clampDecimalInput } from '../utils/numberInput'
import { useHoy } from '../utils/useHoy'
import { R, S, T, tappable, deltaColor, ROW, SP } from '../theme'
import { formatMedida, formatNum } from '../utils/format'
import type { BodyMeasure, MedidaKey } from '../types'

/** Qué se puede anotar, con su unidad y su tope razonable. */
const CAMPOS: { key: MedidaKey; label: string; unidad: string; max: number }[] = [
  { key: 'weightKg', label: 'Peso', unidad: 'kg', max: 300 },
  { key: 'cintura', label: 'Cintura', unidad: 'cm', max: 250 },
  { key: 'pecho', label: 'Pecho', unidad: 'cm', max: 250 },
  { key: 'brazo', label: 'Brazo', unidad: 'cm', max: 100 },
  { key: 'pierna', label: 'Pierna', unidad: 'cm', max: 150 },
  { key: 'cadera', label: 'Cadera', unidad: 'cm', max: 250 },
]

type Borrador = Partial<Record<MedidaKey, string>> & { fecha: string }

const fechaCorta = (ts: number) => new Date(ts).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

/**
 * Peso corporal y circunferencias.
 *
 * Es la curva más simple y la que más se mira, y era lo único que la app no
 * seguía teniendo ya calendario, gráficos y récords. Además le da sentido a los
 * ejercicios a peso corporal: si subís de peso y hacés las mismas dominadas,
 * estás más fuerte.
 */
export function MedidasSheet({ onClose }: { onClose: () => void }) {
  const { measures, addMeasure, deleteMeasure, addUndoToast, addToast } = useStore()
  const nowTs = useHoy()
  const hoy = toDateInputValue(nowTs)
  const [cargando, setCargando] = useState(false)
  const [borrador, setBorrador] = useState<Borrador>({ fecha: hoy })
  const [verCampo, setVerCampo] = useState<MedidaKey>('weightKg')

  const ordenadas = useMemo(() => [...measures].sort((a, b) => a.date - b.date), [measures])
  const serie = useMemo(
    () => ordenadas.filter((m) => typeof m[verCampo] === 'number').map((m) => ({ date: m.date, value: m[verCampo] as number })),
    [ordenadas, verCampo]
  )

  const campo = CAMPOS.find((c) => c.key === verCampo)!
  const ultimo = serie[serie.length - 1]
  const primero = serie[0]
  const delta = ultimo && primero ? Math.round((ultimo.value - primero.value) * 10) / 10 : 0

  const setValor = (key: MedidaKey, valor: string, max: number) =>
    setBorrador((b) => ({ ...b, [key]: clampDecimalInput(valor, max) }))

  const guardar = () => {
    // Sin fecha no se guarda "hoy" en silencio: se avisa y se espera la fecha.
    const fecha = fromDateInputValue(borrador.fecha)
    if (fecha == null) {
      addToast('Elegí la fecha de la medición', 'info')
      return
    }
    if (fecha > nowTs) {
      addToast('La fecha no puede ser futura', 'info')
      return
    }
    const nueva: Omit<BodyMeasure, 'id'> = { date: fecha }
    let algo = false
    for (const c of CAMPOS) {
      const v = parseDecimal(borrador[c.key] ?? '')
      if (!isNaN(v) && v > 0) { nueva[c.key] = v; algo = true }
    }
    if (!algo) {
      addToast('Anotá al menos un valor', 'info')
      return
    }
    addMeasure(nueva)
    setBorrador({ fecha: hoy })
    setCargando(false)
  }

  const borrar = (m: BodyMeasure) => {
    deleteMeasure(m.id)
    addUndoToast(`Se borró la medición del ${fechaCorta(m.date)}`, () => addMeasure(m))
  }

  // Qué columnas tiene el historial, para el encabezado ("peso · cintura").
  const conDatos = CAMPOS.filter((c) => measures.some((m) => typeof m[c.key] === 'number'))

  return (
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <Dialog
        label="Peso y medidas"
        onClose={onClose}
        className="w-full rounded-t-3xl px-4 pt-4 flex flex-col sheet-enter"
        style={{ background: S.surf, borderTop: `1px solid ${S.line2}`, height: '88vh', paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 40, height: 4, background: S.surf2, borderRadius: 2, margin: `0 auto ${SP[3]}px`, flexShrink: 0 }} />

        <div className="flex items-center justify-between gap-3 flex-shrink-0" style={{ marginBottom: SP[3] }}>
          <h3 style={{ fontWeight: 700, color: S.ink, fontSize: T.h2 }}>Peso y medidas</h3>
          <button
            onClick={onClose} aria-label="Cerrar"
            style={{ ...tappable, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.dim, fontSize: T.h2, background: 'none', border: 'none', cursor: 'pointer' }}
          >×</button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3">
          {/* Curva del campo elegido */}
          <div style={{ background: S.surf2, borderRadius: R.lg, padding: `${SP[4]}px ${SP[4]}px ${SP[3]}px`, border: `1px solid ${S.line}` }}>
            <div className="flex items-start justify-between gap-3" style={{ marginBottom: SP[3] }}>
              <div>
                <div style={{ lineHeight: 1 }}>
                  <span className="num" style={{ fontSize: T.display, fontWeight: 700, letterSpacing: '-0.02em', color: S.ink }}>
                    {ultimo ? formatNum(ultimo.value, 1) : '—'}
                  </span>
                  <span style={{ fontSize: T.bodyLg, color: S.dim }}> {campo.unidad}</span>
                </div>
                <div style={{ fontSize: T.caption, color: S.dim, marginTop: SP[1] }}>
                  {ultimo
                    ? `${campo.label} · ${fechaCorta(ultimo.date)}`
                    : `Todavía no anotaste ${campo.label.toLowerCase()}`}
                </div>
              </div>
              {serie.length > 1 && delta !== 0 && (
                // Neutro: bajar de peso no es un error ni subir una mejora.
                <div style={{ textAlign: 'right', flexShrink: 0 }} aria-label={`${delta > 0 ? 'Subió' : 'Bajó'} ${formatMedida(Math.abs(delta), campo.unidad)} desde el inicio`}>
                  <div className="num" style={{ fontSize: T.bodyLg, fontWeight: 700, color: deltaColor(delta, 'neutral'), whiteSpace: 'nowrap' }}>
                    <span aria-hidden="true">{delta > 0 ? '↑' : '↓'}</span> {formatMedida(Math.abs(delta), campo.unidad)}
                  </div>
                  <div style={{ fontSize: T.caption, color: S.dim }}>desde el inicio</div>
                </div>
              )}
            </div>
            {serie.length > 1 ? (
              <div style={{ height: 56 }}>
                <Sparkline values={serie.map((p) => p.value)} color={S.info} height={56} />
              </div>
            ) : (
              <p style={{ fontSize: T.micro, color: S.mute, padding: `${SP[3]}px 0` }}>
                Con dos mediciones ya se dibuja la curva.
              </p>
            )}
          </div>

          {/* Qué medida se mira */}
          {/* flexShrink 0: dentro de la columna con scroll la fila se achicaba a 2 px. */}
          <div className="flex gap-2" style={{ overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2, flexShrink: 0 }}>
            {CAMPOS.map((c) => {
              const activo = verCampo === c.key
              const tiene = measures.some((m) => typeof m[c.key] === 'number')
              return (
                <button
                  key={c.key}
                  onClick={() => setVerCampo(c.key)}
                  aria-pressed={activo}
                  style={{
                    padding: `0 ${SP[4]}px`, borderRadius: 999, flexShrink: 0, minHeight: ROW.compact, whiteSpace: 'nowrap',
                    fontSize: T.body, fontWeight: 600, cursor: 'pointer',
                    background: activo ? S.acc : S.surf2,
                    border: `1px solid ${activo ? S.acc : S.line2}`,
                    color: activo ? S.onAcc : tiene ? S.dim : S.mute,
                  }}
                >{c.label}</button>
              )
            })}
          </div>

          {/* Anotar una medición */}
          {cargando ? (
            <div style={{ background: S.surf2, borderRadius: R.lg, padding: SP[4], border: `1px solid ${S.line2}` }}>
              <label htmlFor="medida-fecha" style={{ fontSize: T.micro, color: S.dim, fontWeight: 600 }}>Fecha</label>
              <input
                id="medida-fecha"
                type="date" value={borrador.fecha} max={hoy}
                onChange={(e) => setBorrador((b) => ({ ...b, fecha: e.target.value }))}
                style={{ width: '100%', marginTop: SP[1], marginBottom: SP[3], minHeight: ROW.compact, background: S.surf, border: `1px solid ${S.line2}`, borderRadius: R.md, padding: `0 ${SP[3]}px`, fontSize: 16, color: S.ink }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SP[3] }}>
                {CAMPOS.map((c) => (
                  <div key={c.key}>
                    <label htmlFor={`medida-${c.key}`} style={{ fontSize: T.micro, color: S.dim, fontWeight: 600 }}>{c.label} ({c.unidad})</label>
                    <input
                      {...decimalInputProps}
                      id={`medida-${c.key}`}
                      value={borrador[c.key] ?? ''}
                      onChange={(e) => setValor(c.key, e.target.value, c.max)}
                      placeholder="—"
                      style={{ width: '100%', minWidth: 0, marginTop: SP[1], minHeight: ROW.compact, background: S.surf, border: `1px solid ${S.line2}`, borderRadius: R.md, padding: `0 ${SP[3]}px`, fontSize: 16, color: S.ink, textAlign: 'center' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2" style={{ marginTop: SP[4] }}>
                <button
                  onClick={() => { setCargando(false); setBorrador({ fecha: hoy }) }}
                  style={{ flex: 1, minHeight: ROW.compact, borderRadius: R.md, background: 'none', border: `1px solid ${S.line2}`, color: S.dim, fontSize: T.bodyLg, fontWeight: 600, cursor: 'pointer' }}
                >Cancelar</button>
                <button
                  onClick={guardar}
                  style={{ flex: 1.4, minHeight: ROW.compact, borderRadius: R.md, background: S.acc, border: 'none', color: S.onAcc, fontSize: T.bodyLg, fontWeight: 700, cursor: 'pointer' }}
                >Guardar</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCargando(true)}
              style={{ width: '100%', minHeight: ROW.regular, borderRadius: R.md, background: S.acc, border: 'none', color: S.onAcc, fontSize: T.title, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
            >
              + Anotar una medición
            </button>
          )}

          {/* Historial: una fila por medición, todas con el mismo formato que la cifra de arriba */}
          {ordenadas.length > 0 && (
            <div style={{ paddingBottom: SP[3] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: SP[2], margin: `${SP[1]}px 0` }}>
                <h4 className="eyebrow">Historial</h4>
                <span style={{ fontSize: T.caption, color: S.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conDatos.map((c) => c.label.toLowerCase()).join(' · ')}
                </span>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {[...ordenadas].reverse().map((m) => (
                  <li
                    key={m.id}
                    style={{ display: 'flex', alignItems: 'center', gap: SP[3], minHeight: ROW.regular, padding: `${SP[1]}px 0`, borderBottom: `1px solid ${S.line}` }}
                  >
                    <span style={{ fontSize: T.bodyLg, fontWeight: 600, color: S.ink, width: 72, flexShrink: 0 }}>{fechaCorta(m.date)}</span>
                    <span className="num" style={{ flex: 1, minWidth: 0, fontSize: T.body, color: S.ink, lineHeight: 1.4 }}>
                      {CAMPOS.filter((c) => typeof m[c.key] === 'number').map((c, i) => (
                        <span key={c.key} style={{ whiteSpace: 'nowrap' }}>
                          {i > 0 && <span style={{ color: S.dim }}> · </span>}
                          <span style={{ color: S.dim }}>{c.label} </span>{formatMedida(m[c.key] as number, c.unidad)}
                        </span>
                      ))}
                    </span>
                    <button
                      onClick={() => borrar(m)}
                      aria-label={`Borrar la medición del ${fechaCorta(m.date)}`}
                      style={{ ...tappable, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: S.dim, fontSize: T.bodyLg, cursor: 'pointer' }}
                    ><span aria-hidden="true">🗑</span></button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  )
}
