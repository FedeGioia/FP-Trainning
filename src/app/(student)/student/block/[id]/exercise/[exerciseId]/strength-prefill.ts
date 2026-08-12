type StrengthValues = {
  series: number | null
  repetitions: number | null
  weight: number | null
}

export function getStrengthResultPrefill(
  currentStrength: StrengthValues | null | undefined,
  expectedStrength: StrengthValues | null | undefined,
  field: keyof StrengthValues,
) {
  return currentStrength?.[field] ?? expectedStrength?.[field] ?? ''
}
