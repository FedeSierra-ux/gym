import { useEffect, useState } from 'react'
import { frameUrl } from '../data/exerciseFrames'

interface Props {
  slug: string
  size: number
  alt: string
  /** Alterna entre la posición inicial y la final para mostrar el movimiento. */
  animate?: boolean
}

/**
 * Ilustración local del ejercicio (Workout Guide, CC BY-SA 4.0). Son dos PNG
 * transparentes: el frame 1 es la posición de inicio y el 3 la de final, así
 * que alternarlos alcanza para leer el movimiento sin depender de un GIF
 * remoto. Todo sale de public/exercise-frames, o sea que funciona offline.
 */
export function ExerciseFrames({ slug, size, alt, animate = false }: Props) {
  const [showEnd, setShowEnd] = useState(false)
  // Al cambiar de ejercicio volvemos a la pose inicial (ajuste de estado en
  // render, que es la forma recomendada de reaccionar a un cambio de prop).
  const [renderedSlug, setRenderedSlug] = useState(slug)
  if (renderedSlug !== slug) {
    setRenderedSlug(slug)
    setShowEnd(false)
  }

  useEffect(() => {
    if (!animate) return
    // Sin animación en los dispositivos donde el usuario pidió menos movimiento.
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const id = setInterval(() => setShowEnd(v => !v), 1100)
    return () => clearInterval(id)
  }, [animate, slug])

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <img
        src={frameUrl(slug, 1)}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'contain', opacity: showEnd ? 0 : 1, transition: 'opacity 0.25s ease',
        }}
      />
      {animate && (
        <img
          src={frameUrl(slug, 3)}
          alt=""
          aria-hidden
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain', opacity: showEnd ? 1 : 0, transition: 'opacity 0.25s ease',
          }}
        />
      )}
    </div>
  )
}
