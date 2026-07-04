import type { StudentSummary } from '@/modules/users'

export const studentCatalogSeed: StudentSummary[] = [
  {
    id: 'seed-student-martin',
    name: 'Martín Canónico',
    email: 'martin@example.com',
    role: 'student',
    programCodes: ['FP_TRAINING', 'FP_HOME'],
  },
  {
    id: 'seed-student-mica',
    name: 'Mica Murrone',
    email: 'mica@example.com',
    role: 'student',
    programCodes: ['FP_HOME', 'FP_RUNNING'],
  },
]
