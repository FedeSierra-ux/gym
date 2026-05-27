import { useEffect, useState } from 'react'
import type { Exercise } from '../types'
import { muscleGroupConfig } from '../data/muscleGroups'
import { exerciseDetails } from '../data/exerciseDetails'

interface Props {
  exercise: Exercise
  size?: number
  rounded?: string
}

export function ExerciseThumbnail({ exercise, size = 44, rounded = 'rounded-xl' }: Props) {
  const wgerId = exercise.wgerId ?? exerciseDetails[exercise.id]?.wgerId
  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    if (!wgerId) return null
    try {
      const cached = sessionStorage.getItem(`wger-${wgerId}`)
      if (cached) {
        const data = JSON.parse(cached)
        return data.imageUrl ?? null
      }
    } catch {}
    return null
  })
  const [error, setError] = useState(false)
  const config = muscleGroupConfig[exercise.muscleGroup]

  useEffect(() => {
    if (!wgerId || imageUrl || error) return
    const key = `wger-${wgerId}`
    const cached = sessionStorage.getItem(key)
    if (cached) {
      try {
        const data = JSON.parse(cached)
        if (data.imageUrl) setImageUrl(data.imageUrl)
        else setError(true)
      } catch { setError(true) }
      return
    }
    fetch(`https://wger.de/api/v2/exerciseinfo/${wgerId}/?format=json`)
      .then(r => r.json())
      .then(data => {
        const url = data.images?.[0]?.image ?? null
        sessionStorage.setItem(key, JSON.stringify({ imageUrl: url }))
        if (url) setImageUrl(url)
        else setError(true)
      })
      .catch(() => setError(true))
  }, [wgerId, imageUrl, error])

  if (wgerId && imageUrl && !error) {
    return (
      <div
        className={`flex-shrink-0 ${rounded} overflow-hidden border border-white/5`}
        style={{ width: size, height: size, background: 'rgba(255,255,255,0.06)' }}
      >
        <img
          src={imageUrl}
          alt={exercise.nameEs}
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex-shrink-0 ${rounded} flex items-center justify-center`}
      style={{ width: size, height: size, backgroundColor: config.color + '18' }}
      dangerouslySetInnerHTML={{
        __html: exercise.icon.replace('viewBox', `width="${size}" height="${size}" viewBox`)
      }}
    />
  )
}
