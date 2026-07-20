import type { Routine, Workout } from '../types'

const now = Date.now()
const DAY = 86400000

export const seedRoutines: Routine[] = [
  {
    id: 'routine-push',
    name: 'Push Day',
    emoji: '💪',
    createdAt: now - DAY * 10,
    exercises: [
      { exerciseId: 'pecho-01', sets: 4, repsMin: 6, repsMax: 10, order: 0 },
      { exerciseId: 'pecho-02', sets: 3, repsMin: 8, repsMax: 12, order: 1 },
      { exerciseId: 'pecho-04', sets: 3, repsMin: 12, repsMax: 15, order: 2 },
      { exerciseId: 'hombros-01', sets: 4, repsMin: 6, repsMax: 10, order: 3 },
      { exerciseId: 'hombros-02', sets: 3, repsMin: 12, repsMax: 15, order: 4 },
      { exerciseId: 'triceps-01', sets: 3, repsMin: 12, repsMax: 15, order: 5 },
      { exerciseId: 'triceps-02', sets: 3, repsMin: 8, repsMax: 10, order: 6 },
    ],
  },
  {
    id: 'routine-pull',
    name: 'Pull Day',
    emoji: '🦅',
    createdAt: now - DAY * 9,
    exercises: [
      { exerciseId: 'espalda-01', sets: 4, repsMin: 5, repsMax: 8, order: 0 },
      { exerciseId: 'espalda-03', sets: 4, repsMin: 6, repsMax: 10, order: 1 },
      { exerciseId: 'espalda-06', sets: 3, repsMin: 10, repsMax: 12, order: 2 },
      { exerciseId: 'espalda-02', sets: 3, repsMin: 8, repsMax: 12, order: 3 },
      { exerciseId: 'biceps-01', sets: 3, repsMin: 10, repsMax: 12, order: 4 },
      { exerciseId: 'biceps-03', sets: 3, repsMin: 12, repsMax: 15, order: 5 },
    ],
  },
  {
    id: 'routine-legs',
    name: 'Leg Day',
    emoji: '🦵',
    createdAt: now - DAY * 8,
    exercises: [
      { exerciseId: 'piernas-01', sets: 4, repsMin: 6, repsMax: 10, order: 0 },
      { exerciseId: 'piernas-03', sets: 4, repsMin: 10, repsMax: 12, order: 1 },
      { exerciseId: 'piernas-06', sets: 3, repsMin: 8, repsMax: 12, order: 2 },
      { exerciseId: 'piernas-05', sets: 3, repsMin: 12, repsMax: 15, order: 3 },
      { exerciseId: 'gluteos-01', sets: 3, repsMin: 10, repsMax: 12, order: 4 },
      { exerciseId: 'piernas-11', sets: 4, repsMin: 15, repsMax: 20, order: 5 },
    ],
  },
  {
    id: 'routine-upper',
    name: 'Upper Body',
    emoji: '🔝',
    createdAt: now - DAY * 7,
    exercises: [
      { exerciseId: 'pecho-01', sets: 3, repsMin: 8, repsMax: 10, order: 0 },
      { exerciseId: 'espalda-02', sets: 3, repsMin: 8, repsMax: 10, order: 1 },
      { exerciseId: 'hombros-01', sets: 3, repsMin: 8, repsMax: 10, order: 2 },
      { exerciseId: 'espalda-06', sets: 3, repsMin: 10, repsMax: 12, order: 3 },
      { exerciseId: 'pecho-04', sets: 3, repsMin: 12, repsMax: 15, order: 4 },
      { exerciseId: 'biceps-01', sets: 3, repsMin: 10, repsMax: 12, order: 5 },
      { exerciseId: 'triceps-01', sets: 3, repsMin: 12, repsMax: 15, order: 6 },
      { exerciseId: 'hombros-02', sets: 3, repsMin: 12, repsMax: 15, order: 7 },
    ],
  },
]

export const seedWorkouts: Workout[] = [
  {
    id: 'workout-1',
    routineId: 'routine-push',
    startedAt: now - DAY * 2,
    finishedAt: now - DAY * 2 + 3900000,
    durationMin: 65,
    kcal: 420,
    exercises: [
      {
        exerciseId: 'pecho-01',
        sets: [
          { kg: 80, reps: 8, completedAt: now - DAY * 2 + 300000 },
          { kg: 82.5, reps: 7, completedAt: now - DAY * 2 + 600000 },
          { kg: 85, reps: 6, completedAt: now - DAY * 2 + 900000 },
          { kg: 80, reps: 8, completedAt: now - DAY * 2 + 1200000 },
        ],
      },
      {
        exerciseId: 'pecho-02',
        sets: [
          { kg: 30, reps: 12, completedAt: now - DAY * 2 + 1500000 },
          { kg: 32, reps: 10, completedAt: now - DAY * 2 + 1800000 },
          { kg: 32, reps: 10, completedAt: now - DAY * 2 + 2100000 },
        ],
      },
      {
        exerciseId: 'hombros-01',
        sets: [
          { kg: 60, reps: 8, completedAt: now - DAY * 2 + 2400000 },
          { kg: 62.5, reps: 7, completedAt: now - DAY * 2 + 2700000 },
          { kg: 60, reps: 8, completedAt: now - DAY * 2 + 3000000 },
          { kg: 60, reps: 8, completedAt: now - DAY * 2 + 3300000 },
        ],
      },
    ],
  },
  {
    id: 'workout-2',
    routineId: 'routine-pull',
    startedAt: now - DAY * 4,
    finishedAt: now - DAY * 4 + 4200000,
    durationMin: 70,
    kcal: 480,
    exercises: [
      {
        exerciseId: 'espalda-01',
        sets: [
          { kg: 100, reps: 6, completedAt: now - DAY * 4 + 300000 },
          { kg: 110, reps: 5, completedAt: now - DAY * 4 + 700000 },
          { kg: 120, reps: 4, completedAt: now - DAY * 4 + 1100000 },
          { kg: 110, reps: 5, completedAt: now - DAY * 4 + 1500000 },
        ],
      },
      {
        exerciseId: 'espalda-03',
        sets: [
          { kg: 10, reps: 10, completedAt: now - DAY * 4 + 1800000 },
          { kg: 15, reps: 8, completedAt: now - DAY * 4 + 2100000 },
          { kg: 15, reps: 7, completedAt: now - DAY * 4 + 2400000 },
          { kg: 10, reps: 10, completedAt: now - DAY * 4 + 2700000 },
        ],
      },
      {
        exerciseId: 'biceps-01',
        sets: [
          { kg: 40, reps: 12, completedAt: now - DAY * 4 + 3000000 },
          { kg: 42, reps: 10, completedAt: now - DAY * 4 + 3300000 },
          { kg: 42, reps: 10, completedAt: now - DAY * 4 + 3600000 },
        ],
      },
    ],
  },
  {
    id: 'workout-3',
    routineId: 'routine-legs',
    startedAt: now - DAY * 6,
    finishedAt: now - DAY * 6 + 4500000,
    durationMin: 75,
    kcal: 520,
    exercises: [
      {
        exerciseId: 'piernas-01',
        sets: [
          { kg: 90, reps: 8, completedAt: now - DAY * 6 + 300000 },
          { kg: 100, reps: 6, completedAt: now - DAY * 6 + 700000 },
          { kg: 105, reps: 5, completedAt: now - DAY * 6 + 1100000 },
          { kg: 100, reps: 6, completedAt: now - DAY * 6 + 1500000 },
        ],
      },
      {
        exerciseId: 'piernas-03',
        sets: [
          { kg: 120, reps: 12, completedAt: now - DAY * 6 + 1800000 },
          { kg: 130, reps: 10, completedAt: now - DAY * 6 + 2100000 },
          { kg: 130, reps: 10, completedAt: now - DAY * 6 + 2400000 },
          { kg: 120, reps: 12, completedAt: now - DAY * 6 + 2700000 },
        ],
      },
      {
        exerciseId: 'piernas-06',
        sets: [
          { kg: 70, reps: 10, completedAt: now - DAY * 6 + 3000000 },
          { kg: 75, reps: 8, completedAt: now - DAY * 6 + 3300000 },
          { kg: 75, reps: 8, completedAt: now - DAY * 6 + 3600000 },
        ],
      },
    ],
  },
]
