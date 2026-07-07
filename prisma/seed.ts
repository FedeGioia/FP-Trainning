import { PrismaClient, ProgramCode } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const programs = [
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
]

const users = [
  {
    email: 'admin@fptraining.local',
    name: 'Admin Demo',
    role: 'ADMIN' as const,
    password: 'admin1234',
  },
  {
    email: 'trainer@fptraining.local',
    name: 'Trainer Demo',
    role: 'TRAINER' as const,
    password: 'trainer1234',
  },
  {
    email: 'student@fptraining.local',
    name: 'Student Demo',
    role: 'STUDENT' as const,
    password: 'student1234',
  },
]

async function main() {
  for (const program of programs) {
    await prisma.program.upsert({
      where: { code: program.code },
      update: {
        name: program.name,
        description: program.description,
        active: true,
      },
      create: program,
    })
  }

  const seededPrograms = await prisma.program.findMany({
    where: { code: { in: programs.map((program) => program.code) } },
  })

  for (const user of users) {
    const passwordHash = await hash(user.password, 10)

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        status: 'ACTIVE',
        mustChangePassword: false,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
        status: 'ACTIVE',
        mustChangePassword: false,
      },
    })
  }

  const trainer = await prisma.user.findUnique({
    where: { email: 'trainer@fptraining.local' },
  })

  const student = await prisma.user.findUnique({
    where: { email: 'student@fptraining.local' },
  })

  if (trainer && student) {
    await prisma.studentProgramMembership.createMany({
      data: seededPrograms.map((program) => ({
        studentId: student.id,
        programId: program.id,
      })),
      skipDuplicates: true,
    })

    await prisma.trainerStudentAssignment.createMany({
      data: seededPrograms.map((program) => ({
        trainerId: trainer.id,
        studentId: student.id,
        programId: program.id,
      })),
      skipDuplicates: true,
    })
  }

  const demoExercise =
    (await prisma.exercise.findFirst({ where: { name: 'Demo Exercise' } })) ??
    (await prisma.exercise.create({
      data: {
        name: 'Demo Exercise',
        primaryMetricType: 'STRENGTH',
        description: 'Ejercicio de demostración para asignaciones manuales.',
        createdById: trainer?.id ?? null,
      },
    }))

  const demoTemplateExists = await prisma.routineTemplate.findFirst({
    where: { name: 'Demo Template', programId: seededPrograms.find((program) => program.code === ProgramCode.FP_TRAINING)?.id ?? '' },
  })

  if (!demoTemplateExists && trainer) {
    const demoProgram = seededPrograms.find((program) => program.code === ProgramCode.FP_TRAINING)

    if (demoProgram) {
      await prisma.routineTemplate.create({
        data: {
          name: 'Demo Template',
          description: 'Plantilla mínima para probar el flujo de asignación.',
          programId: demoProgram.id,
          createdById: trainer.id,
          sections: {
            create: [
              {
                title: 'Demo Section',
                sectionType: 'CUSTOM',
                sectionOrder: 1,
                exercises: {
                  create: [
                    {
                      exerciseId: demoExercise.id,
                      exerciseOrder: 1,
                      metricType: 'STRENGTH',
                      prescriptionPayload: { series: 3, repetitions: 10, weight: 20 },
                      restLabel: '60s',
                      methodLabel: null,
                      notes: 'Plantilla de demostración',
                    },
                  ],
                },
              },
            ],
          },
        },
      })
    }
  }

  // Create weekly assignments for the demo student
  if (trainer && student && demoTemplateExists) {
    // Clean up existing demo assignments first
    await prisma.assignedRoutine.deleteMany({
      where: {
        studentId: student.id,
        title: { contains: '-' } // Demo assignment pattern
      }
    })

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const daysOfWeek = [
      { dayOffset: 0, hour: 18, minute: 0, programCode: 'FP_RUNNING', label: 'Running' },
      { dayOffset: 1, hour: 19, minute: 0, programCode: 'FP_TRAINING', label: 'Training' },
      { dayOffset: 2, hour: 17, minute: 30, programCode: 'FP_STRETCHING', label: 'Stretching' },
      { dayOffset: 2, hour: 20, minute: 0, programCode: 'FP_HOME', label: 'Home' },
    ]

    const seededProgramMap = new Map(seededPrograms.map(program => [program.code, program]))

    for (const { dayOffset, hour, minute, programCode, label } of daysOfWeek) {
      const program = seededProgramMap.get(programCode)
      if (!program) continue

      const scheduledAt = new Date(today)
      scheduledAt.setDate(today.getDate() + dayOffset)
      scheduledAt.setHours(hour, minute, 0, 0)

      await prisma.assignedRoutine.create({
        data: {
          title: `${label} - ${scheduledAt.toLocaleDateString('es-AR', { weekday: 'long' })}`,
          scheduledAt,
          status: 'PLANNED',
          studentId: student.id,
          trainerId: trainer.id,
          programId: program.id,
          templateId: demoTemplateExists.id,
        }
      })
    }
  }

  console.log(`Seed completo: ${programs.length} programas, ${users.length} usuarios y demo de asignaciones sincronizada.`)
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
