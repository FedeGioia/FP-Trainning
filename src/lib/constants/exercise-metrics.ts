import type { ExerciseMetricType } from '@/modules/exercises'

export const exerciseMetricOptions: Array<{ value: ExerciseMetricType; label: string; hint: string }> = [
  {
    value: 'STRENGTH',
    label: 'Strength',
    hint: 'Fuerza con repeticiones, peso o ambos.',
  },
  {
    value: 'DURATION',
    label: 'Duration',
    hint: 'Ejercicios medidos por tiempo.',
  },
  {
    value: 'DISTANCE',
    label: 'Distance',
    hint: 'Running o trabajo por distancia.',
  },
  {
    value: 'CUSTOM',
    label: 'Custom',
    hint: 'Casos especiales controlados.',
  },
]

export function getMetricTypeLabel(metricType: ExerciseMetricType) {
  return exerciseMetricOptions.find((option) => option.value === metricType)?.label ?? metricType
}
