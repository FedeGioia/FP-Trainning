import type { ExerciseSummary } from '@/modules/exercises'

export const exerciseCatalogSeed: ExerciseSummary[] = [
  {
    id: 'seed-press-banca',
    name: 'Press banca',
    description: 'Ejercicio principal de empuje para fuerza de tren superior.',
    primaryMetricType: 'STRENGTH',
    hasVideo: true,
  },
  {
    id: 'seed-sentadilla-hack',
    name: 'Sentadilla hack',
    description: 'Trabajo principal de tren inferior con series, reps y peso.',
    primaryMetricType: 'STRENGTH',
    hasVideo: false,
  },
  {
    id: 'seed-plancha',
    name: 'Plancha frontal',
    description: 'Ejercicio isométrico medido por duración.',
    primaryMetricType: 'DURATION',
    hasVideo: true,
  },
  {
    id: 'seed-running-easy',
    name: 'Trote suave',
    description: 'Bloque de running medido por distancia o tiempo.',
    primaryMetricType: 'DISTANCE',
    hasVideo: false,
  },
  {
    id: 'seed-circuito-home',
    name: 'Circuito home 4x15/20',
    description: 'Circuito en casa con lógica de trabajo y descanso.',
    primaryMetricType: 'CUSTOM',
    hasVideo: false,
  },
]
