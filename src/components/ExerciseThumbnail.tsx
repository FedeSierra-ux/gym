import { useEffect, useState } from 'react'
import type { Exercise } from '../types'
import { muscleGroupConfig } from '../data/muscleGroups'
import { exerciseDetails } from '../data/exerciseDetails'
import { MuscleBodyMap } from './MuscleBodyMap'

interface Props {
  exercise: Exercise
  size?: number
  rounded?: string
  /** Skip the GIF and force wger.de static image lookup */
  forceStatic?: boolean
}

const LS = {
  get(key: string) {
    try { return localStorage.getItem(key) } catch { return null }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value) } catch { /* quota exceeded */ }
  },
}

async function resolveWgerId(exercise: Exercise): Promise<number | null> {
  const direct = exercise.wgerId ?? exerciseDetails[exercise.id]?.wgerId
  if (direct) return direct

  if (!exercise.nameEn) return null

  const searchKey = `wger-search-${exercise.id}`
  const cached = LS.get(searchKey)
  if (cached) {
    const data = JSON.parse(cached)
    return data.baseId ?? null
  }

  try {
    const res = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(exercise.nameEn)}&language=english&format=json`
    )
    const data = await res.json()
    const baseId: number | null = data.suggestions?.[0]?.data?.base_id ?? null
    LS.set(searchKey, JSON.stringify({ baseId }))
    return baseId
  } catch {
    return null
  }
}

async function resolveWgerImageUrl(exercise: Exercise): Promise<string | null> {
  const wgerId = await resolveWgerId(exercise)
  if (!wgerId) return null

  const key = `wger-${wgerId}`
  const cached = LS.get(key)
  if (cached) {
    const data = JSON.parse(cached)
    return data.imageUrl ?? null
  }

  try {
    const res = await fetch(`https://wger.de/api/v2/exerciseinfo/${wgerId}/?format=json`)
    const data = await res.json()
    const url: string | null = data.images?.[0]?.image ?? null
    LS.set(key, JSON.stringify({ imageUrl: url }))
    return url
  } catch {
    return null
  }
}

export function ExerciseThumbnail({ exercise, size = 44, rounded = 'rounded-xl', forceStatic = false }: Props) {
  const initialUrl = (!forceStatic && exercise.image) ? exercise.image : null
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl)
  const [failed, setFailed] = useState(false)
  const config = muscleGroupConfig[exercise.muscleGroup]

  useEffect(() => {
    if (imageUrl || failed) return
    resolveWgerImageUrl(exercise)
      .then(url => {
        if (url) setImageUrl(url)
        else setFailed(true)
      })
      .catch(() => setFailed(true))
  }, [exercise.id, forceStatic]) // eslint-disable-line react-hooks/exhaustive-deps

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
          onError={() => { setImageUrl(null); setFailed(true) }}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex-shrink-0 ${rounded} flex items-center justify-center`}
      style={{ width: size, height: size, backgroundColor: config.color + '18' }}
    >
      <MuscleBodyMap muscleGroup={exercise.muscleGroup} size={Math.round(size * 0.75)} />
    </div>
  )
}
