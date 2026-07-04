import type { TemplateSummary } from '@/modules/templates'

export const templateCatalogSeed: TemplateSummary[] = [
  {
    id: 'seed-template-training-empuje',
    name: 'Empuje base',
    description: 'Template inicial de tren superior con calentamiento y bloque principal.',
    programCode: 'FP_TRAINING',
    sections: [
      { id: 'seed-sec-1', title: 'Calentamiento', sectionType: 'WARMUP', order: 1 },
      { id: 'seed-sec-2', title: 'Bloque principal', sectionType: 'MAIN', order: 2 },
    ],
  },
  {
    id: 'seed-template-running-base',
    name: 'Running easy',
    description: 'Template simple de running con activación y bloque principal.',
    programCode: 'FP_RUNNING',
    sections: [
      { id: 'seed-sec-3', title: 'Activación', sectionType: 'WARMUP', order: 1 },
      { id: 'seed-sec-4', title: 'Trote suave', sectionType: 'MAIN', order: 2 },
    ],
  },
  {
    id: 'seed-template-home-circuit',
    name: 'Circuito home base',
    description: 'Template inicial de entrenamiento en casa con lógica de circuito.',
    programCode: 'FP_HOME',
    sections: [{ id: 'seed-sec-5', title: 'Circuito principal', sectionType: 'CIRCUIT', order: 1 }],
  },
]
