import type { MuscleGroup } from '../types'

interface Props {
  muscleGroup: MuscleGroup
  size?: number
  className?: string
}

const muscleColors: Record<MuscleGroup, string> = {
  pecho: '#00ff88',
  espalda: '#00d4ff',
  hombros: '#ff9500',
  biceps: '#ff4488',
  triceps: '#aa44ff',
  piernas: '#ffdd00',
  gluteos: '#ff7744',
  core: '#44ffdd',
  cardio: '#88aaff',
}

const frontGroups: MuscleGroup[] = ['pecho', 'hombros', 'biceps', 'core', 'piernas', 'cardio']

export function MuscleBodyMap({ muscleGroup, size = 80, className }: Props) {
  const color = muscleColors[muscleGroup]
  const isFront = frontGroups.includes(muscleGroup)
  const width = size
  const height = Math.round(size * 1.95)
  const glowId = `glow-${muscleGroup}-${size}`

  const inactive = { fill: '#1e1e2c', stroke: '#2a2a3e', opacity: 0.7 }
  const active = { fill: color, opacity: 0.9 }

  function ActiveRegion({ children }: { children: React.ReactNode }) {
    return (
      <g filter={`url(#${glowId})`} fill={color} opacity={0.9}>
        {children}
      </g>
    )
  }

  function InactiveRegion({ children }: { children: React.ReactNode }) {
    return (
      <g fill={inactive.fill} stroke={inactive.stroke} opacity={inactive.opacity}>
        {children}
      </g>
    )
  }

  const is = (g: MuscleGroup) => muscleGroup === g

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 195"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Body silhouette base */}
      {/* Head */}
      <ellipse cx="50" cy="11" rx="10" ry="11" fill="#16161f" stroke="#2a2a3e" strokeWidth="1" />
      {/* Neck */}
      <rect x="46" y="22" width="8" height="8" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Left arm */}
      <path d="M26,32 L18,38 L12,60 L14,78 L22,76 L20,58 L28,42 Z" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Right arm */}
      <path d="M74,32 L82,38 L88,60 L86,78 L78,76 L80,58 L72,42 Z" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Torso */}
      <path d="M28,30 L72,30 L64,96 L36,96 Z" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Hips */}
      <path d="M36,96 L30,110 L70,110 L64,96 Z" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Left thigh */}
      <rect x="30" y="110" width="17" height="47" rx="4" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Right thigh */}
      <rect x="53" y="110" width="17" height="47" rx="4" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Left lower leg */}
      <rect x="30" y="159" width="16" height="29" rx="3" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Right lower leg */}
      <rect x="54" y="159" width="16" height="29" rx="3" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Left foot */}
      <rect x="28" y="186" width="18" height="7" rx="2" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />
      {/* Right foot */}
      <rect x="54" y="186" width="18" height="7" rx="2" fill="#16161f" stroke="#2a2a3e" strokeWidth="0.5" />

      {isFront ? (
        <>
          {/* FRONT VIEW muscle regions */}

          {/* Deltoides izquierdo */}
          {is('hombros') ? (
            <ActiveRegion>
              <ellipse cx="26" cy="35" rx="10" ry="7" />
              <ellipse cx="74" cy="35" rx="10" ry="7" />
            </ActiveRegion>
          ) : (
            <InactiveRegion>
              <ellipse cx="26" cy="35" rx="10" ry="7" />
              <ellipse cx="74" cy="35" rx="10" ry="7" />
            </InactiveRegion>
          )}

          {/* Pectorales */}
          {is('pecho') ? (
            <ActiveRegion>
              <ellipse cx="40" cy="50" rx="10" ry="11" />
              <ellipse cx="60" cy="50" rx="10" ry="11" />
            </ActiveRegion>
          ) : (
            <InactiveRegion>
              <ellipse cx="40" cy="50" rx="10" ry="11" />
              <ellipse cx="60" cy="50" rx="10" ry="11" />
            </InactiveRegion>
          )}

          {/* Bíceps */}
          {is('biceps') ? (
            <ActiveRegion>
              <ellipse cx="18" cy="57" rx="5" ry="11" />
              <ellipse cx="82" cy="57" rx="5" ry="11" />
            </ActiveRegion>
          ) : (
            <InactiveRegion>
              <ellipse cx="18" cy="57" rx="5" ry="11" />
              <ellipse cx="82" cy="57" rx="5" ry="11" />
            </InactiveRegion>
          )}

          {/* Abs (6-pack) + oblicuos */}
          {is('core') ? (
            <ActiveRegion>
              <rect x="40" y="66" width="8" height="7" rx="1.5" />
              <rect x="52" y="66" width="8" height="7" rx="1.5" />
              <rect x="40" y="75" width="8" height="7" rx="1.5" />
              <rect x="52" y="75" width="8" height="7" rx="1.5" />
              <rect x="40" y="84" width="8" height="7" rx="1.5" />
              <rect x="52" y="84" width="8" height="7" rx="1.5" />
              {/* Oblicuos */}
              <path d="M36,66 Q33,72 34,88 L38,88 Q37,75 39,66 Z" />
              <path d="M64,66 Q67,72 66,88 L62,88 Q63,75 61,66 Z" />
            </ActiveRegion>
          ) : (
            <InactiveRegion>
              <rect x="40" y="66" width="8" height="7" rx="1.5" />
              <rect x="52" y="66" width="8" height="7" rx="1.5" />
              <rect x="40" y="75" width="8" height="7" rx="1.5" />
              <rect x="52" y="75" width="8" height="7" rx="1.5" />
              <rect x="40" y="84" width="8" height="7" rx="1.5" />
              <rect x="52" y="84" width="8" height="7" rx="1.5" />
              <path d="M36,66 Q33,72 34,88 L38,88 Q37,75 39,66 Z" />
              <path d="M64,66 Q67,72 66,88 L62,88 Q63,75 61,66 Z" />
            </InactiveRegion>
          )}

          {/* Cuádriceps */}
          {is('piernas') ? (
            <ActiveRegion>
              <ellipse cx="37" cy="133" rx="9" ry="22" />
              <ellipse cx="63" cy="133" rx="9" ry="22" />
              {/* Pantorrillas (más tenues) */}
              <ellipse cx="36" cy="175" rx="6" ry="9" opacity={0.6} />
              <ellipse cx="64" cy="175" rx="6" ry="9" opacity={0.6} />
            </ActiveRegion>
          ) : (
            <InactiveRegion>
              <ellipse cx="37" cy="133" rx="9" ry="22" />
              <ellipse cx="63" cy="133" rx="9" ry="22" />
              <ellipse cx="36" cy="175" rx="6" ry="9" />
              <ellipse cx="64" cy="175" rx="6" ry="9" />
            </InactiveRegion>
          )}

          {/* Cardio: corazón estilizado */}
          {is('cardio') && (
            <ActiveRegion>
              <path d="M50,78 C50,78 38,68 38,60 C38,55 42,52 46,54 C48,55 50,57 50,57 C50,57 52,55 54,54 C58,52 62,55 62,60 C62,68 50,78 50,78 Z" />
            </ActiveRegion>
          )}
        </>
      ) : (
        <>
          {/* BACK VIEW muscle regions */}

          {/* Trapecios */}
          {is('espalda') ? (
            <ActiveRegion>
              <path d="M46,22 L54,22 L66,50 L34,50 Z" />
              {/* Dorsales */}
              <path d="M28,34 L26,72 L38,78 L34,50 Z" />
              <path d="M72,34 L74,72 L62,78 L66,50 Z" />
              {/* Lumbar (más tenue) */}
              <rect x="38" y="80" width="24" height="14" rx="2" opacity={0.6} />
            </ActiveRegion>
          ) : (
            <InactiveRegion>
              <path d="M46,22 L54,22 L66,50 L34,50 Z" />
              <path d="M28,34 L26,72 L38,78 L34,50 Z" />
              <path d="M72,34 L74,72 L62,78 L66,50 Z" />
              <rect x="38" y="80" width="24" height="14" rx="2" />
            </InactiveRegion>
          )}

          {/* Deltoides posterior */}
          {is('hombros') ? (
            <ActiveRegion>
              <ellipse cx="26" cy="35" rx="10" ry="7" />
              <ellipse cx="74" cy="35" rx="10" ry="7" />
            </ActiveRegion>
          ) : (
            <InactiveRegion>
              <ellipse cx="26" cy="35" rx="10" ry="7" />
              <ellipse cx="74" cy="35" rx="10" ry="7" />
            </InactiveRegion>
          )}

          {/* Tríceps */}
          {is('triceps') ? (
            <ActiveRegion>
              <ellipse cx="17" cy="60" rx="5" ry="13" />
              <ellipse cx="83" cy="60" rx="5" ry="13" />
            </ActiveRegion>
          ) : (
            <InactiveRegion>
              <ellipse cx="17" cy="60" rx="5" ry="13" />
              <ellipse cx="83" cy="60" rx="5" ry="13" />
            </InactiveRegion>
          )}

          {/* Glúteos + isquiotibiales */}
          {is('gluteos') ? (
            <ActiveRegion>
              <ellipse cx="40" cy="108" rx="9" ry="9" />
              <ellipse cx="60" cy="108" rx="9" ry="9" />
              {/* Isquiotibiales (más tenues) */}
              <ellipse cx="37" cy="138" rx="8" ry="20" opacity={0.6} />
              <ellipse cx="63" cy="138" rx="8" ry="20" opacity={0.6} />
            </ActiveRegion>
          ) : (
            <InactiveRegion>
              <ellipse cx="40" cy="108" rx="9" ry="9" />
              <ellipse cx="60" cy="108" rx="9" ry="9" />
              <ellipse cx="37" cy="138" rx="8" ry="20" />
              <ellipse cx="63" cy="138" rx="8" ry="20" />
            </InactiveRegion>
          )}
        </>
      )}
    </svg>
  )
}
