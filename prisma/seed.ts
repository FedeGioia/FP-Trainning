import {
  MediaKind,
  MetricType,
  MembershipStatus,
  Prisma,
  PrismaClient,
  ProgramCode,
  RoutineStatus,
  Role,
  SectionType,
  SubmissionStatus,
  UserStatus,
} from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const programSeeds = [
  {
    code: ProgramCode.FP_TRAINING,
    name: 'FP-Training',
    description: 'Programa principal de gimnasio y fuerza.',
  },
  {
    code: ProgramCode.FP_STRETCHING,
    name: 'FP-Stretching',
    description: 'Programa de movilidad y estiramientos.',
  },
  {
    code: ProgramCode.FP_RUNNING,
    name: 'FP-Running',
    description: 'Programa de running, cardio y resistencia.',
  },
  {
    code: ProgramCode.FP_HOME,
    name: 'FP-Home',
    description: 'Programa base de entrenamiento en casa.',
  },
] as const

const userSeeds = [
  { email: 'admin@fptraining.local', name: 'Admin Demo', role: Role.ADMIN, password: 'admin1234', expectedWorkoutsPerWeek: 0 },
  { email: 'trainer@fptraining.local', name: 'Trainer Demo', role: Role.TRAINER, password: 'trainer1234', expectedWorkoutsPerWeek: 0 },
  { email: 'student@fptraining.local', name: 'Student Demo', role: Role.STUDENT, password: 'student1234', expectedWorkoutsPerWeek: 3 },
  { email: 'student2@fptraining.local', name: 'Student Two', role: Role.STUDENT, password: 'student1234', expectedWorkoutsPerWeek: 2 },
  { email: 'student3@fptraining.local', name: 'Student Three', role: Role.STUDENT, password: 'student1234', expectedWorkoutsPerWeek: 2 },
  { email: 'student4@fptraining.local', name: 'Student Four', role: Role.STUDENT, password: 'student1234', expectedWorkoutsPerWeek: 4 },
] as const

const exerciseSeeds = [
  {
    name: 'Squat',
    description: 'Patrón base de fuerza para piernas.',
    primaryMetricType: MetricType.STRENGTH,
    media: [{ kind: MediaKind.VIDEO, url: 'https://example.com/videos/squat.mp4', thumbnailUrl: 'https://example.com/images/squat.jpg' }],
  },
  {
    name: 'Push-up',
    description: 'Empuje de tren superior con peso corporal.',
    primaryMetricType: MetricType.STRENGTH,
    media: [{ kind: MediaKind.VIDEO, url: 'https://example.com/videos/push-up.mp4', thumbnailUrl: 'https://example.com/images/push-up.jpg' }],
  },
  {
    name: 'Row',
    description: 'Tirón para espalda y postura.',
    primaryMetricType: MetricType.STRENGTH,
    media: [{ kind: MediaKind.VIDEO, url: 'https://example.com/videos/row.mp4', thumbnailUrl: 'https://example.com/images/row.jpg' }],
  },
  {
    name: 'Plank',
    description: 'Core isométrico para estabilidad.',
    primaryMetricType: MetricType.DURATION,
    media: [{ kind: MediaKind.VIDEO, url: 'https://example.com/videos/plank.mp4', thumbnailUrl: 'https://example.com/images/plank.jpg' }],
  },
  {
    name: 'Mobility Flow',
    description: 'Secuencia corta de movilidad general.',
    primaryMetricType: MetricType.DURATION,
    media: [{ kind: MediaKind.VIDEO, url: 'https://example.com/videos/mobility-flow.mp4', thumbnailUrl: 'https://example.com/images/mobility-flow.jpg' }],
  },
  {
    name: 'Run Intervals',
    description: 'Intervalos cortos de carrera para cardio.',
    primaryMetricType: MetricType.DISTANCE,
    media: [{ kind: MediaKind.VIDEO, url: 'https://example.com/videos/run-intervals.mp4', thumbnailUrl: 'https://example.com/images/run-intervals.jpg' }],
  },
  {
    name: 'Easy Run',
    description: 'Rodaje suave para acumular volumen.',
    primaryMetricType: MetricType.DISTANCE,
    media: [{ kind: MediaKind.VIDEO, url: 'https://example.com/videos/easy-run.mp4', thumbnailUrl: 'https://example.com/images/easy-run.jpg' }],
  },
  {
    name: 'Home Circuit',
    description: 'Circuito mixto para entrenamiento en casa.',
    primaryMetricType: MetricType.CUSTOM,
    media: [{ kind: MediaKind.VIDEO, url: 'https://example.com/videos/home-circuit.mp4', thumbnailUrl: 'https://example.com/images/home-circuit.jpg' }],
  },
] as const

type TemplateExerciseSeed = {
  exerciseName: string
  metricType: MetricType
  prescriptionPayload: Prisma.InputJsonObject
  restLabel?: string | null
  methodLabel?: string | null
  complementLabel?: string | null
  notes?: string | null
}

type TemplateSectionSeed = {
  title: string
  sectionType: SectionType
  notes?: string | null
  exercises: TemplateExerciseSeed[]
}

type SeededRoutineTemplate = Prisma.RoutineTemplateGetPayload<{
  include: {
    sections: {
      include: {
        exercises: true
      }
    }
  }
}>

const templateSeeds: Array<{
  name: string
  description: string
  programCode: ProgramCode
  sections: TemplateSectionSeed[]
}> = [
  {
    name: 'Full Body Strength',
    description: 'Plantilla de fuerza general con base de gimnasio.',
    programCode: ProgramCode.FP_TRAINING,
    sections: [
      {
        title: 'Warm-up',
        sectionType: SectionType.WARMUP,
        exercises: [
          {
            exerciseName: 'Mobility Flow',
            metricType: MetricType.DURATION,
            prescriptionPayload: { duration: 300 },
            restLabel: '30s',
            notes: 'Preparación articular y movilidad general.',
          },
          {
            exerciseName: 'Plank',
            metricType: MetricType.DURATION,
            prescriptionPayload: { duration: 45 },
            restLabel: '30s',
            notes: 'Activación del core antes del trabajo principal.',
          },
        ],
      },
      {
        title: 'Main Workout',
        sectionType: SectionType.MAIN,
        exercises: [
          {
            exerciseName: 'Squat',
            metricType: MetricType.STRENGTH,
            prescriptionPayload: { series: 4, repetitions: 10, weight: 50 },
            restLabel: '60s',
          },
          {
            exerciseName: 'Push-up',
            metricType: MetricType.STRENGTH,
            prescriptionPayload: { series: 3, repetitions: 15 },
            restLabel: '45s',
          },
          {
            exerciseName: 'Row',
            metricType: MetricType.STRENGTH,
            prescriptionPayload: { series: 3, repetitions: 12, weight: 30 },
            restLabel: '45s',
          },
        ],
      },
    ],
  },
  {
    name: 'Running Intervals',
    description: 'Trabajo cardiovascular por intervalos.',
    programCode: ProgramCode.FP_RUNNING,
    sections: [
      {
        title: 'Warm-up',
        sectionType: SectionType.WARMUP,
        exercises: [
          {
            exerciseName: 'Easy Run',
            metricType: MetricType.DISTANCE,
            prescriptionPayload: { distance: 1500 },
            restLabel: '60s',
          },
        ],
      },
      {
        title: 'Intervals',
        sectionType: SectionType.MAIN,
        exercises: [
          {
            exerciseName: 'Run Intervals',
            metricType: MetricType.DISTANCE,
            prescriptionPayload: { rounds: 6, distance: 400 },
            restLabel: '90s',
          },
          {
            exerciseName: 'Plank',
            metricType: MetricType.DURATION,
            prescriptionPayload: { duration: 30 },
            restLabel: '30s',
            notes: 'Bloque de estabilización entre series.',
          },
        ],
      },
    ],
  },
  {
    name: 'Mobility Reset',
    description: 'Plantilla de recuperación y movilidad.',
    programCode: ProgramCode.FP_STRETCHING,
    sections: [
      {
        title: 'Preparation',
        sectionType: SectionType.PREPARATION,
        exercises: [
          {
            exerciseName: 'Mobility Flow',
            metricType: MetricType.DURATION,
            prescriptionPayload: { duration: 420 },
            restLabel: '20s',
          },
        ],
      },
      {
        title: 'Main Session',
        sectionType: SectionType.CUSTOM,
        exercises: [
          {
            exerciseName: 'Home Circuit',
            metricType: MetricType.CUSTOM,
            prescriptionPayload: { rounds: 3, focus: 'mobility' },
            restLabel: '45s',
            methodLabel: 'Controlled tempo',
          },
          {
            exerciseName: 'Plank',
            metricType: MetricType.DURATION,
            prescriptionPayload: { duration: 60 },
            restLabel: '30s',
          },
        ],
      },
    ],
  },
  {
    name: 'Home Circuit',
    description: 'Circuito mixto para entrenar desde casa.',
    programCode: ProgramCode.FP_HOME,
    sections: [
      {
        title: 'Activation',
        sectionType: SectionType.WARMUP,
        exercises: [
          {
            exerciseName: 'Mobility Flow',
            metricType: MetricType.DURATION,
            prescriptionPayload: { duration: 240 },
            restLabel: '20s',
          },
        ],
      },
      {
        title: 'Circuit',
        sectionType: SectionType.CIRCUIT,
        exercises: [
          {
            exerciseName: 'Push-up',
            metricType: MetricType.STRENGTH,
            prescriptionPayload: { series: 4, repetitions: 12 },
            restLabel: '30s',
          },
          {
            exerciseName: 'Squat',
            metricType: MetricType.STRENGTH,
            prescriptionPayload: { series: 4, repetitions: 15 },
            restLabel: '30s',
          },
          {
            exerciseName: 'Home Circuit',
            metricType: MetricType.CUSTOM,
            prescriptionPayload: { rounds: 4, exercises: 3 },
            restLabel: '60s',
          },
        ],
      },
    ],
  },
] as const

type RoutineResultSeed = {
  sectionOrder: number
  exerciseOrder: number
  resultType: MetricType
  resultPayload: Prisma.InputJsonObject
  notes?: string | null
}

type RoutineFeedbackSeed = {
  comment: string
}

type RoutineSubmissionSeed = {
  status: SubmissionStatus
  studentNotes?: string | null
  resultEntries: RoutineResultSeed[]
  feedbacks: RoutineFeedbackSeed[]
}

const routineSeeds: Array<{
  title: string
  programCode: ProgramCode
  scheduledOffsetDays: number
  scheduledHour: number
  studentEmail: string
  templateName: string
  status: RoutineStatus
  notes?: string | null
  submission?: RoutineSubmissionSeed
}> = [
  {
    title: 'Lunes - Full Body Strength',
    programCode: ProgramCode.FP_TRAINING,
    scheduledOffsetDays: 0,
    scheduledHour: 18,
    studentEmail: 'student@fptraining.local',
    templateName: 'Full Body Strength',
    status: RoutineStatus.IN_PROGRESS,
    notes: 'Sesión activa para demo del student principal.',
    submission: {
      status: SubmissionStatus.IN_PROGRESS,
      studentNotes: 'Voy por la mitad.',
      resultEntries: [
        {
          sectionOrder: 2,
          exerciseOrder: 1,
          resultType: MetricType.STRENGTH,
          resultPayload: { series: 2, repetitions: 10, weight: 50 },
          notes: 'Primer bloque completado.',
        },
      ],
      feedbacks: [{ comment: 'Buen arranque, mantené la técnica.' }],
    },
  },
  {
    title: 'Martes - Running Intervals',
    programCode: ProgramCode.FP_RUNNING,
    scheduledOffsetDays: 1,
    scheduledHour: 19,
    studentEmail: 'student2@fptraining.local',
    templateName: 'Running Intervals',
    status: RoutineStatus.PLANNED,
  },
  {
    title: 'Miércoles - Mobility Reset',
    programCode: ProgramCode.FP_STRETCHING,
    scheduledOffsetDays: 2,
    scheduledHour: 17,
    studentEmail: 'student3@fptraining.local',
    templateName: 'Mobility Reset',
    status: RoutineStatus.COMPLETED,
    submission: {
      status: SubmissionStatus.SUBMITTED,
      studentNotes: 'Me dejó más suelto para correr.',
      resultEntries: [
        {
          sectionOrder: 1,
          exerciseOrder: 1,
          resultType: MetricType.DURATION,
          resultPayload: { duration: 420 },
        },
        {
          sectionOrder: 2,
          exerciseOrder: 1,
          resultType: MetricType.CUSTOM,
          resultPayload: { rounds: 3, focus: 'mobility' },
        },
      ],
      feedbacks: [{ comment: 'Excelente para recuperación.' }],
    },
  },
  {
    title: 'Jueves - Home Circuit',
    programCode: ProgramCode.FP_HOME,
    scheduledOffsetDays: 3,
    scheduledHour: 20,
    studentEmail: 'student4@fptraining.local',
    templateName: 'Home Circuit',
    status: RoutineStatus.PARTIAL,
    submission: {
      status: SubmissionStatus.SUBMITTED,
      studentNotes: 'Hice solo la mitad por tiempo.',
      resultEntries: [
        {
          sectionOrder: 2,
          exerciseOrder: 1,
          resultType: MetricType.STRENGTH,
          resultPayload: { series: 4, repetitions: 12 },
        },
      ],
      feedbacks: [{ comment: 'Bien, pero completá el circuito entero.' }],
    },
  },
  {
    title: 'Viernes - Full Body Strength',
    programCode: ProgramCode.FP_TRAINING,
    scheduledOffsetDays: 4,
    scheduledHour: 18,
    studentEmail: 'student4@fptraining.local',
    templateName: 'Full Body Strength',
    status: RoutineStatus.PLANNED,
  },
  {
    title: 'Sábado - Running Intervals',
    programCode: ProgramCode.FP_RUNNING,
    scheduledOffsetDays: 5,
    scheduledHour: 9,
    studentEmail: 'student@fptraining.local',
    templateName: 'Running Intervals',
    status: RoutineStatus.COMPLETED,
    submission: {
      status: SubmissionStatus.SUBMITTED,
      studentNotes: 'Gran salida matutina.',
      resultEntries: [
        {
          sectionOrder: 1,
          exerciseOrder: 1,
          resultType: MetricType.DISTANCE,
          resultPayload: { distance: 1500 },
        },
        {
          sectionOrder: 2,
          exerciseOrder: 1,
          resultType: MetricType.DISTANCE,
          resultPayload: { rounds: 6, distance: 400 },
        },
      ],
      feedbacks: [{ comment: 'Muy bien sostenido el ritmo.' }],
    },
  },
] as const

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function buildScheduledAt(offsetDays: number, hour: number) {
  const date = startOfToday()
  date.setDate(date.getDate() + offsetDays)
  date.setHours(hour, 0, 0, 0)
  return date
}

function toInputJsonValue(value: Prisma.JsonValue): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
  return value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue
}

async function resetDemoData() {
  await prisma.trainerFeedback.deleteMany({})
  await prisma.workoutResultEntry.deleteMany({})
  await prisma.workoutSubmission.deleteMany({})
  await prisma.assignedRoutineExercise.deleteMany({})
  await prisma.assignedRoutineSection.deleteMany({})
  await prisma.assignedRoutine.deleteMany({})
  await prisma.routineTemplateExercise.deleteMany({})
  await prisma.routineTemplateSection.deleteMany({})
  await prisma.routineTemplate.deleteMany({})
  await prisma.exerciseMedia.deleteMany({})
  await prisma.exercise.deleteMany({})
  await prisma.exerciseCategory.deleteMany({})
  await prisma.trainerStudentAssignment.deleteMany({})
  await prisma.studentProgramMembership.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.program.deleteMany({})
}

async function main() {
  await resetDemoData()

  const createdPrograms = new Map<string, Awaited<ReturnType<typeof prisma.program.create>>>()
  for (const program of programSeeds) {
    const created = await prisma.program.create({
      data: {
        code: program.code,
        name: program.name,
        description: program.description,
        active: true,
      },
    })
    createdPrograms.set(program.code, created)
  }

  const createdUsers = new Map<string, Awaited<ReturnType<typeof prisma.user.create>>>()
  for (const user of userSeeds) {
    const passwordHash = await hash(user.password, 10)
    const created = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
        status: UserStatus.ACTIVE,
        mustChangePassword: false,
        expectedWorkoutsPerWeek: user.expectedWorkoutsPerWeek,
      },
    })
    createdUsers.set(user.email, created)
  }

  for (const student of [
    { email: 'student@fptraining.local', programs: [ProgramCode.FP_TRAINING, ProgramCode.FP_HOME] },
    { email: 'student2@fptraining.local', programs: [ProgramCode.FP_RUNNING, ProgramCode.FP_HOME] },
    { email: 'student3@fptraining.local', programs: [ProgramCode.FP_STRETCHING, ProgramCode.FP_HOME] },
    { email: 'student4@fptraining.local', programs: [ProgramCode.FP_TRAINING, ProgramCode.FP_RUNNING, ProgramCode.FP_STRETCHING, ProgramCode.FP_HOME] },
  ] as const) {
    const studentUser = createdUsers.get(student.email)
    const trainerUser = createdUsers.get('trainer@fptraining.local')

    if (!studentUser || !trainerUser) continue

    const membershipData = student.programs.map((programCode) => ({
      studentId: studentUser.id,
      programId: createdPrograms.get(programCode)!.id,
      status: MembershipStatus.ACTIVE,
    }))

    const assignmentData = student.programs.map((programCode) => ({
      trainerId: trainerUser.id,
      studentId: studentUser.id,
      programId: createdPrograms.get(programCode)!.id,
      active: true,
    }))

    await prisma.studentProgramMembership.createMany({ data: membershipData, skipDuplicates: true })
    await prisma.trainerStudentAssignment.createMany({ data: assignmentData, skipDuplicates: true })
  }

  const createdExercises = new Map<string, Awaited<ReturnType<typeof prisma.exercise.create>>>()
  const trainer = createdUsers.get('trainer@fptraining.local')
  const categories = new Map<string, Awaited<ReturnType<typeof prisma.exerciseCategory.create>>>()

  if (!trainer) throw new Error('No se encontró el entrenador de demo para crear las categorías.')

  const uncategorized = await prisma.exerciseCategory.create({ data: { name: 'Sin categoría', createdById: trainer.id } })
  const strength = await prisma.exerciseCategory.create({ data: { name: 'Fuerza', createdById: trainer.id } })
  const upperBody = await prisma.exerciseCategory.create({ data: { name: 'Tren superior', parentId: strength.id, createdById: trainer.id } })
  const lowerBody = await prisma.exerciseCategory.create({ data: { name: 'Tren inferior', parentId: strength.id, createdById: trainer.id } })
  const conditioning = await prisma.exerciseCategory.create({ data: { name: 'Acondicionamiento', createdById: trainer.id } })
  categories.set('upper-body', upperBody)
  categories.set('lower-body', lowerBody)
  categories.set('conditioning', conditioning)
  categories.set('uncategorized', uncategorized)

  for (const exerciseSeed of exerciseSeeds) {
    const created = await prisma.exercise.create({
      data: {
        name: exerciseSeed.name,
        description: exerciseSeed.description,
        primaryMetricType: exerciseSeed.primaryMetricType,
        active: true,
        createdById: trainer?.id ?? null,
        categoryId: exerciseSeed.name === 'Squat'
          ? categories.get('lower-body')!.id
          : exerciseSeed.name === 'Push-up' || exerciseSeed.name === 'Row'
            ? categories.get('upper-body')!.id
            : exerciseSeed.name.includes('Run')
              ? categories.get('conditioning')!.id
              : categories.get('uncategorized')!.id,
        media: {
          create: exerciseSeed.media.map((media) => ({
            kind: media.kind,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
          })),
        },
      },
    })
    createdExercises.set(exerciseSeed.name, created)
  }

  const createdTemplates = new Map<string, SeededRoutineTemplate>()

  for (const templateSeed of templateSeeds) {
    const program = createdPrograms.get(templateSeed.programCode)
    if (!program || !trainer) continue

    const createdTemplate = await prisma.routineTemplate.create({
      data: {
        name: templateSeed.name,
        description: templateSeed.description,
        programId: program.id,
        createdById: trainer.id,
        active: true,
        sections: {
          create: templateSeed.sections.map((section, sectionIndex) => ({
            title: section.title,
            sectionType: section.sectionType,
            sectionOrder: sectionIndex + 1,
            notes: section.notes ?? null,
            exercises: {
              create: section.exercises.map((exerciseSeed, exerciseIndex) => ({
                exercise: { connect: { id: createdExercises.get(exerciseSeed.exerciseName)!.id } },
                exerciseOrder: exerciseIndex + 1,
                metricType: exerciseSeed.metricType,
                prescriptionPayload: exerciseSeed.prescriptionPayload,
                restLabel: exerciseSeed.restLabel ?? null,
                methodLabel: exerciseSeed.methodLabel ?? null,
                complementLabel: exerciseSeed.complementLabel ?? null,
                notes: exerciseSeed.notes ?? null,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            exercises: true,
          },
        },
      },
    })

    createdTemplates.set(templateSeed.name, createdTemplate)
  }

  for (const routineSeed of routineSeeds) {
    const student = createdUsers.get(routineSeed.studentEmail)
    const trainerUser = createdUsers.get('trainer@fptraining.local')
    const program = createdPrograms.get(routineSeed.programCode)
    const template = createdTemplates.get(routineSeed.templateName)

    if (!student || !trainerUser || !program || !template) continue

    const createdRoutine = await prisma.assignedRoutine.create({
      data: {
        title: routineSeed.title,
        scheduledAt: buildScheduledAt(routineSeed.scheduledOffsetDays, routineSeed.scheduledHour),
        status: routineSeed.status,
        notes: routineSeed.notes ?? null,
        studentId: student.id,
        trainerId: trainerUser.id,
        programId: program.id,
        templateId: template.id,
        sections: {
          create: template.sections.map((section) => ({
            title: section.title,
            sectionType: section.sectionType,
            sectionOrder: section.sectionOrder,
            notes: section.notes ?? null,
            sourceTemplate: { connect: { id: section.id } },
            exercises: {
              create: section.exercises.map((templateExercise) => ({
                exercise: { connect: { id: templateExercise.exerciseId } },
                sourceTemplate: { connect: { id: templateExercise.id } },
                exerciseOrder: templateExercise.exerciseOrder,
                metricType: templateExercise.metricType,
                prescriptionSnapshot: toInputJsonValue(templateExercise.prescriptionPayload),
                restLabel: templateExercise.restLabel,
                methodLabel: templateExercise.methodLabel,
                complementLabel: templateExercise.complementLabel,
                notes: templateExercise.notes,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            exercises: true,
          },
        },
      },
    })

    if (!routineSeed.submission) continue

    const exerciseLookup = new Map<string, string>()
    for (const section of createdRoutine.sections) {
      for (const exercise of section.exercises) {
        exerciseLookup.set(`${section.sectionOrder}-${exercise.exerciseOrder}`, exercise.id)
      }
    }

    await prisma.workoutSubmission.create({
      data: {
        assignedRoutineId: createdRoutine.id,
        studentId: student.id,
        status: routineSeed.submission.status,
        studentNotes: routineSeed.submission.studentNotes ?? null,
        submittedAt: routineSeed.submission.status === SubmissionStatus.NOT_STARTED ? null : new Date(),
        resultEntries: {
          create: routineSeed.submission.resultEntries.map((result) => ({
            assignedExercise: { connect: { id: exerciseLookup.get(`${result.sectionOrder}-${result.exerciseOrder}`)! } },
            resultType: result.resultType,
            resultPayload: result.resultPayload,
            notes: result.notes ?? null,
          })),
        },
        feedbacks: {
          create: routineSeed.submission.feedbacks.map((feedback) => ({
            trainer: { connect: { id: trainerUser.id } },
            comment: feedback.comment,
          })),
        },
      },
    })
  }

  console.log(
    `Seed demo completo: ${programSeeds.length} programas, ${userSeeds.length} usuarios, ${exerciseSeeds.length} ejercicios, ${templateSeeds.length} plantillas y ${routineSeeds.length} rutinas.`,
  )
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
