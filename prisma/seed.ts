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

  for (const user of users) {
    const passwordHash = await hash(user.password, 10)

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        status: 'ACTIVE',
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
      },
    })
  }

  console.log(`Seed completo: ${programs.length} programas y ${users.length} usuarios demo sincronizados.`)
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
