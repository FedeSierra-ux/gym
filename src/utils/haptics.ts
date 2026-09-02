/**
 * Vibración. iOS no implementa `navigator.vibrate` en ningún navegador, así que
 * en iPhone esto no hace nada: el aviso táctil del final del descanso depende
 * del sonido, que sí funciona si el AudioContext se despertó a tiempo.
 */
export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

/**
 * Un único AudioContext para toda la app.
 *
 * Safari arranca todo AudioContext en estado `suspended` y sólo lo deja
 * arrancar desde el manejador de un gesto del usuario. El pitido del final del
 * descanso sale de un temporizador, que no es un gesto: creando el contexto ahí
 * nunca sonaba en iPhone. Ahora el contexto se crea y se despierta cuando el
 * usuario confirma una serie, y para cuando el descanso termina ya está listo.
 */
let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  const AudioCtx = (window.AudioContext ?? (window as unknown as Record<string, unknown>).webkitAudioContext) as
    | typeof AudioContext
    | undefined
  if (!AudioCtx) return null
  try {
    ctx = new AudioCtx()
  } catch {
    return null
  }
  return ctx
}

/**
 * Despierta el audio desde un gesto del usuario. Llamalo en el toque que
 * confirma una serie: sin esto, en iOS el pitido del descanso no suena.
 */
export function primeAudio(): void {
  const c = getContext()
  if (!c) return
  if (c.state === 'suspended') void c.resume().catch(() => {})
}

export function playBeep(freq = 880, duration = 200) {
  try {
    const c = getContext()
    if (!c) return
    // Si el contexto sigue suspendido (nunca hubo un gesto), pedimos que
    // arranque igual: en Android alcanza, en iOS ya se despertó al confirmar.
    if (c.state === 'suspended') void c.resume().catch(() => {})
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.25, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration / 1000)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration / 1000 + 0.05)
  } catch {
    // Audio API no disponible
  }
}
