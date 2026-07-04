export type ProgramCode = 'FP_TRAINING' | 'FP_STRETCHING' | 'FP_RUNNING' | 'FP_HOME'

export type ProgramSummary = {
  id: string
  code: ProgramCode
  name: string
  description?: string | null
  active: boolean
}
