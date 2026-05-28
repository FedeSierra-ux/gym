import { useEffect, useState } from 'react'
import type { Exercise } from '../types'
import { muscleGroupConfig } from '../data/muscleGroups'
import { exerciseDetails } from '../data/exerciseDetails'

interface Props {
  exercise: Exercise
  size?: number
  rounded?: string
}

async function resolveWgerId(exercise: Exercise): Promise<number | null> {
  const direct = exercise.wgerId ?? exerciseDetails[exercise.id]?.wgerId
  if (direct) return direct

  if (!exercise.nameEn) return null

  const searchKey = `wger-search-${exercise.id}`
  try {
    const cached = sessionStorage.getItem(searchKey)
    if (cached) {
      const data = JSON.parse(cached)
      return data.baseId ?? null
    }
  } catch {}

  try {
    const res = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(exercise.nameEn)}&language=english&format=json`
    )
    const data = await res.json()
    const baseId: number | null = data.suggestions?.[0]?.data?.base_id ?? null
    sessionStorage.setItem(searchKey, JSON.stringify({ baseId }))
    return baseId
  } catch {
    return null
  }
}

async function resolveImageUrl(exercise: Exercise): Promise<string | null> {
  const wgerId = await resolveWgerId(exercise)
  if (!wgerId) return null

  const key = `wger-${wgerId}`
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) {
      const data = JSON.parse(cached)
      return data.imageUrl ?? null
    }
  } catch {}

  try {
    const res = await fetch(`https://wger.de/api/v2/exerciseinfo/${wgerId}/?format=json`)
    const data = await res.json()
    const url: string | null = data.images?.[0]?.image ?? null
    sessionStorage.setItem(key, JSON.stringify({ imageUrl: url }))
    return url
  } catch {
    return null
  }
}

export function ExerciseThumbnail({ exercise, size = 44, rounded = 'rounded-xl' }: Props) {
  const wgerId = exercise.wgerId ?? exerciseDetails[exercise.id]?.wgerId

  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    if (wgerId) {
      try {
        const cached = sessionStorage.getItem(`wger-${wgerId}`)
        if (cached) {
          const data = JSON.parse(cached)
          return data.imageUrl ?? null
        }
      } catch {}
    } else if (exercise.nameEn) {
      try {
        const searchCached = sessionStorage.getItem(`wger-search-${exercise.id}`)
        if (searchCached) {
          const { baseId } = JSON.parse(searchCached)
          if (baseId) {
            const imgCached = sessionStorage.getItem(`wger-${baseId}`)
            if (imgCached) {
              const data = JSON.parse(imgCached)
              return data.imageUrl ?? null
            }
          }
        }
      } catch {}
    }
    return null
  })

  const [failed, setFailed] = useState(false)
  const config = muscleGroupConfig[exercise.muscleGroup]

  useEffect(() => {
    if (imageUrl || failed) return
    resolveImageUrl(exercise)
      .then(url => {
        if (url) setImageUrl(url)
        else setFailed(true)
      })
      .catch(() => setFailed(true))
  }, [exercise.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (imageUrl && !failed) {
    return (
      <div
        className={`flex-shrink-0 ${rounded} overflow-hidden border border-white/5`}
        style={{ width: size, height: size, background: 'rgba(255,255,255,0.06)' }}
      >
        <img
          src={imageUrl}
          alt={exercise.nameEs}
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
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
