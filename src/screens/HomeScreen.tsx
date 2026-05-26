import { useStore } from '../store/useStore'
import { CircularRing } from '../components/CircularRing'
import { muscleGroupConfig } from '../data/muscleGroups'

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function HomeScreen() {
  const { userName, workouts, routines, exercises, prs, startWorkout, setActiveTab } = useStore()

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const sortedWorkouts = [...workouts]
    .filter((w) => w.finishedAt)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  const lastWorkout = sortedWorkouts[0]
  const lastRoutine = lastWorkout ? routines.find((r) => r.id === lastWorkout.routineId) : null

  const lastRoutineEx = lastRoutine?.exercises.length ?? 1
  const lastWorkoutEx = lastWorkout?.exercises.length ?? 0
  const completionPct = Math.round((lastWorkoutEx / Math.max(lastRoutineEx, 1)) * 100)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const monthWorkouts = workouts.filter((w) => w.startedAt >= startOfMonth && w.finishedAt)
  const monthHours = monthWorkouts.reduce((acc, w) => acc + (w.durationMin ?? 0), 0) / 60
  const monthPrs = prs.filter((p) => p.date >= startOfMonth).length

  const lastRoutineIds = sortedWorkouts.slice(0, 3).map((w) => w.routineId)
  const suggestedRoutine =
    routines.find((r) => !lastRoutineIds.includes(r.id)) ?? routines[0]

  const suggestedExercises = suggestedRoutine?.exercises.slice(0, 3).map((re) => {
    const ex = exercises.find((e) => e.id === re.exerciseId)
    return ex
  }).filter(Boolean) ?? []

  const totalDuration = suggestedRoutine?.exercises.reduce((acc, re) => {
    const ex = exercises.find((e) => e.id === re.exerciseId)
    void ex
    return acc + re.sets * 2.5
  }, 0) ?? 0

  return (
    <div className="flex-1 scroll-area px-4 pb-4">
      <div className="pt-12 pb-6">
        <p className="text-gray-400 text-sm">{formatDate(Date.now())}</p>
        <h1 className="text-2xl font-bold text-white mt-1">
          {greeting}, <span className="text-primary">{userName}</span> 👋
        </h1>
      </div>

      {lastWorkout && lastRoutine ? (
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Último entreno</p>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {lastRoutine.emoji} {lastRoutine.name}
              </h2>
            </div>
            <CircularRing value={completionPct} size={56} color="#00d4ff">
              <span className="text-xs font-bold text-info">{completionPct}%</span>
            </CircularRing>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-info text-base">⏱</span>
              <div>
                <p className="text-sm font-semibold text-white">{formatDuration(lastWorkout.durationMin ?? 0)}</p>
                <p className="text-[10px] text-gray-500">Duración</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔥</span>
              <div>
                <p className="text-sm font-semibold text-white">{lastWorkout.kcal} kcal</p>
                <p className="text-[10px] text-gray-500">Calorías</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">💪</span>
              <div>
                <p className="text-sm font-semibold text-white">{lastWorkoutEx} ejercicios</p>
                <p className="text-[10px] text-gray-500">Completados</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-6 mb-4 text-center">
          <p className="text-gray-400 text-sm">No hay entrenos registrados aún</p>
          <p className="text-gray-600 text-xs mt-1">¡Comienza tu primer entrenamiento!</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-bold text-primary">{monthWorkouts.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Entrenos</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-bold text-info">{monthHours.toFixed(1)}h</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Horas totales</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-bold text-gold">{monthPrs}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Nuevos PRs</p>
        </div>
      </div>

      {suggestedRoutine && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Rutina sugerida</p>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {suggestedRoutine.emoji} {suggestedRoutine.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{suggestedRoutine.exercises.length} ejercicios</p>
              <p className="text-[10px] text-gray-500">~{Math.round(totalDuration)} min</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {suggestedExercises.map((ex) => {
              if (!ex) return null
              const config = muscleGroupConfig[ex.muscleGroup]
              return (
                <div key={ex.id} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-sm text-gray-300">{ex.nameEs}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded ml-auto"
                    style={{ color: config.color, backgroundColor: config.color + '20' }}
                  >
                    {config.label}
                  </span>
                </div>
              )
            })}
            {suggestedRoutine.exercises.length > 3 && (
              <p className="text-xs text-gray-600 pl-3.5">
                +{suggestedRoutine.exercises.length - 3} ejercicios más
              </p>
            )}
          </div>

          <button
            onClick={() => {
              startWorkout(suggestedRoutine.id)
            }}
            className="w-full bg-primary text-black font-bold py-3 rounded-xl text-sm hover:bg-primary/90 active:scale-95 transition-transform"
          >
            ▶ Iniciar Rutina
          </button>
        </div>
      )}

      {routines.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No tienes rutinas guardadas.</p>
          <button
            onClick={() => setActiveTab('rutinas')}
            className="mt-3 text-primary text-sm underline"
          >
            Ir a Rutinas
          </button>
        </div>
      )}
    </div>
  )
}
