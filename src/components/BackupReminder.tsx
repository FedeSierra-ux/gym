import { useState } from 'react'
import { useStore } from '../store/useStore'
import { S } from '../theme'

/** Cada cuánto se recuerda hacer una copia. */
const DIAS_ENTRE_AVISOS = 30
/** Antes de este piso no vale la pena molestar: no hay casi nada que perder. */
const ENTRENOS_MINIMOS = 5

/**
 * Recordatorio de backup.
 *
 * Todo el historial vive en el localStorage de un solo teléfono: si se cambia
 * de equipo, se reinstala o el sistema limpia los datos del sitio, se pierde
 * todo y no hay vuelta atrás. Exportar funciona, pero hay que acordarse, y
 * nadie se acuerda. Este aviso aparece en Inicio cuando pasó un mes.
 */
export function BackupReminder() {
  const { workouts, lastBackupAt, setActiveTab } = useStore()
  const [nowTs] = useState(() => Date.now())
  const [oculto, setOculto] = useState(false)

  const terminados = workouts.filter((w) => w.finishedAt)
  if (oculto || terminados.length < ENTRENOS_MINIMOS) return null

  // Sin backup nunca, se cuenta desde el primer entreno.
  const desde = lastBackupAt ?? Math.min(...terminados.map((w) => w.startedAt))
  const dias = Math.floor((nowTs - desde) / 86400000)
  if (dias < DIAS_ENTRE_AVISOS) return null

  return (
    <div style={{ padding: '20px 22px 0' }}>
      <div
        style={{
          background: 'rgba(242,169,59,0.08)',
          border: '1px solid rgba(242,169,59,0.24)',
          borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }} aria-hidden="true">💾</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: S.acc2 }}>
            {lastBackupAt ? 'Hace un mes que no hacés copia' : 'Todavía no hiciste ninguna copia'}
          </p>
          <p style={{ fontSize: 11, color: S.dim, marginTop: 2, lineHeight: 1.4 }}>
            {terminados.length} entrenos guardados sólo en este teléfono.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('perfil')}
          style={{
            flexShrink: 0, minHeight: 40, padding: '0 14px', borderRadius: 12,
            background: 'rgba(242,169,59,0.16)', border: `1px solid rgba(242,169,59,0.4)`,
            color: S.acc2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Exportar
        </button>
        <button
          onClick={() => setOculto(true)}
          aria-label="Ocultar el recordatorio"
          style={{
            flexShrink: 0, width: 32, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', color: S.dim, fontSize: 16, cursor: 'pointer',
          }}
        >×</button>
      </div>
    </div>
  )
}
