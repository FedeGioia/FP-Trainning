export const templateSectionOptions = [
  { value: 'WARMUP', label: 'Warmup', hint: 'Calentamiento y movilidad.' },
  { value: 'PREPARATION', label: 'Preparation', hint: 'Aproximaciones o fuerza preparatoria.' },
  { value: 'MAIN', label: 'Main', hint: 'Trabajo principal del bloque.' },
  { value: 'ACCESSORY', label: 'Accessory', hint: 'Trabajo accesorio o complementario.' },
  { value: 'CIRCUIT', label: 'Circuit', hint: 'Circuitos por tiempo o rondas.' },
  { value: 'COMPLEMENT', label: 'Complement', hint: 'Bloque extra o adicional.' },
  { value: 'CUSTOM', label: 'Custom', hint: 'Sección especial fuera de catálogo.' },
] as const

export type TemplateSectionOption = (typeof templateSectionOptions)[number]['value']

export function getTemplateSectionLabel(value: string) {
  return templateSectionOptions.find((option) => option.value === value)?.label ?? value
}
