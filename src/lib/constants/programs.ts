export const programCatalog = [
  {
    code: 'FP_TRAINING',
    name: 'FP-Training',
    description: 'Gimnasio, fuerza y trabajo principal.',
  },
  {
    code: 'FP_STRETCHING',
    name: 'FP-Stretching',
    description: 'Movilidad, elongación y trabajo regenerativo.',
  },
  {
    code: 'FP_RUNNING',
    name: 'FP-Running',
    description: 'Running, cardio y bloques de distancia/tiempo.',
  },
  {
    code: 'FP_HOME',
    name: 'FP-Home',
    description: 'Entrenamientos en casa como base complementaria.',
  },
] as const

export type ProgramCatalogItem = (typeof programCatalog)[number]
