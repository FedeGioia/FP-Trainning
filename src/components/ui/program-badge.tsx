type ProgramBadgeProps = {
  code: string
  className?: string
}

const programBadgeClassMap: Record<string, string> = {
  FP_TRAINING: 'program-badge--fp-training',
  FP_HOME: 'program-badge--fp-home',
  FP_STRETCHING: 'program-badge--fp-stretching',
  FP_RUNNING: 'program-badge--fp-running',
}

const programLabelMap: Record<string, string> = {
  FP_TRAINING: 'Training',
  FP_HOME: 'Home',
  FP_STRETCHING: 'Stretching',
  FP_RUNNING: 'Running',
}

export function getProgramLabel(code: string) {
  return programLabelMap[code] ?? code
}

export function getProgramToneClass(code: string) {
  return programBadgeClassMap[code] ?? 'program-badge--default'
}

export function ProgramBadge({ code, className }: ProgramBadgeProps) {
  const variantClass = getProgramToneClass(code)
  const label = getProgramLabel(code)

  return <span className={`program-badge ${variantClass}${className ? ` ${className}` : ''}`}>{label}</span>
}
