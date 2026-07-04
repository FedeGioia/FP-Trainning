import type { AssignmentDetail, AssignmentSummary } from '@/modules/assignments'

export const assignmentCatalogSeed: AssignmentSummary[] = [
  {
    id: 'seed-assignment-1',
    title: 'Empuje base — Martín',
    studentName: 'Martín Canónico',
    templateName: 'Empuje base',
    programCode: 'FP_TRAINING',
    scheduledAt: '2026-07-04T08:00:00.000Z',
    status: 'PLANNED',
    sectionCount: 2,
  },
  {
    id: 'seed-assignment-2',
    title: 'Circuito home — Mica',
    studentName: 'Mica Murrone',
    templateName: 'Circuito home base',
    programCode: 'FP_HOME',
    scheduledAt: '2026-07-04T18:00:00.000Z',
    status: 'PLANNED',
    sectionCount: 1,
  },
]

export const assignmentDetailSeed: AssignmentDetail[] = [
  {
    id: 'seed-assignment-1',
    title: 'Empuje base — Martín',
    studentName: 'Martín Canónico',
    templateName: 'Empuje base',
    programCode: 'FP_TRAINING',
    scheduledAt: '2026-07-04T08:00:00.000Z',
    status: 'PLANNED',
    sectionCount: 2,
    notes: 'Priorizá técnica prolija y registrá peso real por serie.',
    studentNotes: null,
    sections: [
      {
        id: 'seed-assignment-1-sec-1',
        title: 'Calentamiento',
        sectionType: 'WARMUP',
        order: 1,
        exercises: [
          { id: 'seed-ae-1', name: '5 min de cinta', metricType: 'DURATION' },
          { id: 'seed-ae-2', name: 'Movilidad de hombro', metricType: 'CUSTOM' },
          { id: 'seed-ae-3', name: 'Movilidad de columna', metricType: 'CUSTOM' },
        ],
      },
      {
        id: 'seed-assignment-1-sec-2',
        title: 'Bloque principal',
        sectionType: 'MAIN',
        order: 2,
        exercises: [
          { id: 'seed-ae-4', name: 'Press banca — 3x6', metricType: 'STRENGTH' },
          { id: 'seed-ae-5', name: 'Press inclinado — 3x8', metricType: 'STRENGTH' },
          { id: 'seed-ae-6', name: 'Cruce de poleas — 3x10', metricType: 'STRENGTH' },
        ],
      },
    ],
  },
  {
    id: 'seed-assignment-2',
    title: 'Circuito home — Mica',
    studentName: 'Mica Murrone',
    templateName: 'Circuito home base',
    programCode: 'FP_HOME',
    scheduledAt: '2026-07-04T18:00:00.000Z',
    status: 'PLANNED',
    sectionCount: 1,
    notes: 'Mantené buen ritmo y completá sensaciones al final.',
    studentNotes: null,
    sections: [
      {
        id: 'seed-assignment-2-sec-1',
        title: 'Circuito principal',
        sectionType: 'CIRCUIT',
        order: 1,
        exercises: [
          { id: 'seed-ae-7', name: 'Jumping jacks', metricType: 'DURATION' },
          { id: 'seed-ae-8', name: 'Sentadilla libre', metricType: 'STRENGTH' },
          { id: 'seed-ae-9', name: 'Plancha frontal', metricType: 'DURATION' },
          { id: 'seed-ae-10', name: 'Mountain climbers', metricType: 'DURATION' },
        ],
      },
    ],
  },
]
