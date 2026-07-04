import { db } from '@/lib/db'
import { programCatalog } from '@/lib/constants/programs'
import { studentCatalogSeed } from '@/lib/constants/students'

import type {
  CreateStudentInput,
  CreateStudentResult,
  StudentAssignmentSummary,
  StudentSummary,
  UserSummary,
} from './types'

export async function listStudents(): Promise<StudentSummary[]> {
  try {
    const students = await db.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      include: {
        studentProgramMemberships: {
          include: { program: true },
        },
      },
      take: 24,
    })

    if (students.length === 0) {
      return studentCatalogSeed
    }

    return students.map((student) => ({
      id: student.id,
      name: student.name ?? 'Sin nombre',
      email: student.email,
      role: 'student',
      programCodes: student.studentProgramMemberships.map((membership) => membership.program.code),
    }))
  } catch {
    return studentCatalogSeed
  }
}

export async function listStudentsForAssignments() {
  return listStudents()
}

function normalizeProgramCodes(programCodes: string[]) {
  const allowed = new Set(programCatalog.map((program) => program.code))
  const codes = [...new Set(programCodes.filter((code) => allowed.has(code as never)))]

  const hasPremiumProgram = codes.some((code) => code !== 'FP_HOME')
  if (hasPremiumProgram && !codes.includes('FP_HOME')) {
    codes.push('FP_HOME')
  }

  return codes
}

export async function createStudent(input: CreateStudentInput): Promise<CreateStudentResult> {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const programCodes = normalizeProgramCodes(input.programCodes)

  if (!name) {
    return { ok: false, message: 'El nombre del alumno es obligatorio.' }
  }

  if (!email) {
    return { ok: false, message: 'El email del alumno es obligatorio.' }
  }

  if (programCodes.length === 0) {
    return { ok: false, message: 'Seleccioná al menos un programa.' }
  }

  try {
    const trainer = await db.user.findFirst({
      where: { role: 'TRAINER', status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    })

    if (!trainer) {
      return { ok: false, message: 'No hay trainer demo en la base. Corré el seed antes de crear alumnos.' }
    }

    const programs = await db.program.findMany({
      where: { code: { in: programCodes as never[] } },
    })

    if (programs.length === 0) {
      return { ok: false, message: 'Los programas elegidos no existen en la base todavía.' }
    }

    const student = await db.user.create({
      data: {
        name,
        email,
        role: 'STUDENT',
        studentProgramMemberships: {
          create: programs.map((program) => ({
            programId: program.id,
          })),
        },
      },
    })

    await db.trainerStudentAssignment.createMany({
      data: programs.map((program) => ({
        trainerId: trainer.id,
        studentId: student.id,
        programId: program.id,
      })),
      skipDuplicates: true,
    })

    return { ok: true, studentId: student.id }
  } catch {
    return {
      ok: false,
      message: 'No se pudo crear el alumno. Verificá PostgreSQL, migraciones y que el email no esté repetido.',
    }
  }
}

export async function listUsersPlaceholder(): Promise<UserSummary[]> {
  return []
}

export async function listStudentAssignmentsPlaceholder(): Promise<StudentAssignmentSummary[]> {
  return []
}
