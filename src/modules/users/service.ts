import { compare, hash } from 'bcryptjs'

import { db } from '@/lib/db'
import { programCodes as programCodeCatalog } from '@/lib/domain/program-codes'

import type {
  AdminUserSummary,
  ChangeStudentPasswordWithCurrentInput,
  ChangeStudentPasswordWithCurrentResult,
  ChangeStudentPasswordInput,
  ChangeStudentPasswordResult,
  CreateStudentInput,
  CreateStudentResult,
  ResetStudentPasswordInput,
  ResetStudentPasswordResult,
  StudentProfileSummary,
  ToggleUserStatusInput,
  ToggleUserStatusResult,
  UpdateStudentProfileInput,
  UpdateStudentProfileResult,
  StudentAssignmentSummary,
  StudentSummary,
  UserSummary,
} from './types'

export async function listStudents(searchQuery = ''): Promise<StudentSummary[]> {
  try {
    const query = searchQuery.trim()

    const students = await db.user.findMany({
      where: {
        role: 'STUDENT',
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                {
                  studentProgramMemberships: {
                    some: {
                      program: {
                        name: { contains: query, mode: 'insensitive' },
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        studentProgramMemberships: {
          include: { program: true },
        },
        _count: {
          select: { studentAssignedRoutines: true },
        },
      },
    })

    return students.map((student) => ({
      id: student.id,
      name: student.name ?? 'Sin nombre',
      email: student.email,
      role: 'student',
      programCodes: student.studentProgramMemberships.map((membership) => membership.program.code),
      assignedWorkoutCount: student._count.studentAssignedRoutines,
      expectedWorkoutsPerWeek: student.expectedWorkoutsPerWeek,
    }))
  } catch {
    return []
  }
}

export async function listStudentsForAssignments() {
  return listStudents()
}

export async function getStudentProfile(studentIdentifier?: string): Promise<StudentProfileSummary | null> {
  if (!studentIdentifier) {
    return null
  }

  try {
    const student = await db.user.findUnique({
      where: { id: studentIdentifier },
      include: {
        studentProgramMemberships: {
          include: { program: true },
        },
      },
    }) ?? await db.user.findUnique({
      where: { email: studentIdentifier },
      include: {
        studentProgramMemberships: {
          include: { program: true },
        },
      },
    })

    if (!student || student.role !== 'STUDENT') {
      return null
    }

    return {
      id: student.id,
      name: student.name ?? 'Sin nombre',
      email: student.email,
      programCodes: student.studentProgramMemberships.map((membership) => membership.program.code),
    }
  } catch {
    return null
  }
}

export async function listUsers(): Promise<AdminUserSummary[]> {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        studentProgramMemberships: {
          include: { program: true },
        },
      },
      take: 48,
    })

    return users.map((user) => ({
      id: user.id,
      name: user.name ?? 'Sin nombre',
      email: user.email,
      role: user.role.toLowerCase() as AdminUserSummary['role'],
      status: user.status,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
      programCodes: user.studentProgramMemberships.map((membership) => membership.program.code),
    }))
  } catch {
    return []
  }
}

function normalizeProgramCodes(selectedProgramCodes: string[]) {
  const allowed = new Set(programCodeCatalog.map((program) => program.code))
  const codes = [...new Set(selectedProgramCodes.filter((code) => allowed.has(code as never)))]

  const hasPremiumProgram = codes.some((code) => code !== 'FP_HOME')
  if (hasPremiumProgram && !codes.includes('FP_HOME')) {
    codes.push('FP_HOME')
  }

  return codes
}

export async function createStudent(input: CreateStudentInput): Promise<CreateStudentResult> {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const password = input.password.trim()
  const programCodes = normalizeProgramCodes(input.programCodes)

  if (!name) {
    return { ok: false, message: 'El nombre del alumno es obligatorio.' }
  }

  if (!email) {
    return { ok: false, message: 'El email del alumno es obligatorio.' }
  }

  if (password.length < 8) {
    return { ok: false, message: 'La contraseña del alumno debe tener al menos 8 caracteres.' }
  }

  if (programCodes.length === 0) {
    return { ok: false, message: 'Seleccioná al menos un programa.' }
  }

  try {
    const trainer = await db.user.findUnique({
      where: { id: input.trainerId },
    })

    if (!trainer || trainer.role !== 'TRAINER' || trainer.status !== 'ACTIVE') {
      return { ok: false, message: 'No encontramos un trainer activo para crear el alumno.' }
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
        passwordHash: await hash(password, 10),
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

export async function resetStudentPassword(input: ResetStudentPasswordInput): Promise<ResetStudentPasswordResult> {
  const password = input.password.trim()

  if (password.length < 8) {
    return { ok: false, message: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  try {
    const student = await db.user.findUnique({
      where: { id: input.studentId },
    })

    if (!student || student.role !== 'STUDENT') {
      return { ok: false, message: 'No se encontró un alumno con ese ID.' }
    }

    await db.user.update({
      where: { id: input.studentId },
      data: {
        passwordHash: await hash(password, 10),
        mustChangePassword: true,
      },
    })

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'No se pudo actualizar la contraseña del alumno.',
    }
  }
}

export async function changeStudentPassword(
  input: ChangeStudentPasswordInput,
): Promise<ChangeStudentPasswordResult> {
  const password = input.password.trim()

  if (password.length < 8) {
    return { ok: false, message: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  try {
    const student = await db.user.findUnique({
      where: { id: input.studentId },
    })

    if (!student || student.role !== 'STUDENT') {
      return { ok: false, message: 'No se encontró un alumno con ese ID.' }
    }

    await db.user.update({
      where: { id: input.studentId },
      data: {
        passwordHash: await hash(password, 10),
        mustChangePassword: false,
      },
    })

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'No se pudo actualizar la contraseña del alumno.',
    }
  }
}

export async function updateStudentProfile(input: UpdateStudentProfileInput): Promise<UpdateStudentProfileResult> {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const programCodes = input.programCodes ? normalizeProgramCodes(input.programCodes) : undefined
  const expectedWorkoutsPerWeek = input.expectedWorkoutsPerWeek

  if (!name) {
    return { ok: false, message: 'El nombre es obligatorio.' }
  }

  if (!email) {
    return { ok: false, message: 'El email es obligatorio.' }
  }

  if (programCodes && programCodes.length === 0) {
    return { ok: false, message: 'Seleccioná al menos un programa.' }
  }

  if (programCodes && !input.trainerId) {
    return { ok: false, message: 'No encontramos el trainer responsable de actualizar los programas.' }
  }

  if (
    expectedWorkoutsPerWeek !== undefined
    && (!Number.isInteger(expectedWorkoutsPerWeek) || expectedWorkoutsPerWeek < 0)
  ) {
    return { ok: false, message: 'Las rutinas esperadas por semana deben ser un número entero igual o mayor a cero.' }
  }

  try {
    const student = await db.user.findUnique({
      where: { id: input.studentId },
    })

    if (!student || student.role !== 'STUDENT') {
      return { ok: false, message: 'No se encontró el alumno.' }
    }

    const emailTaken = await db.user.findUnique({
      where: { email },
    })

    if (emailTaken && emailTaken.id !== student.id) {
      return { ok: false, message: 'Ya existe otra cuenta con ese email.' }
    }

    if (programCodes && input.trainerId) {
      const trainer = await db.user.findUnique({
        where: { id: input.trainerId },
      })

      if (!trainer || trainer.role !== 'TRAINER' || trainer.status !== 'ACTIVE') {
        return { ok: false, message: 'No encontramos un trainer activo para actualizar los programas.' }
      }

      const programs = await db.program.findMany({
        where: { code: { in: programCodes as never[] } },
      })

      if (programs.length !== programCodes.length) {
        return { ok: false, message: 'Uno o más programas elegidos no existen en la base.' }
      }

      const programIds = programs.map((program) => program.id)

      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: student.id },
          data: { name, email, expectedWorkoutsPerWeek },
        })

        await tx.studentProgramMembership.deleteMany({
          where: {
            studentId: student.id,
            programId: { notIn: programIds },
          },
        })

        await tx.studentProgramMembership.createMany({
          data: programIds.map((programId) => ({ studentId: student.id, programId })),
          skipDuplicates: true,
        })

        await tx.trainerStudentAssignment.updateMany({
          where: {
            trainerId: trainer.id,
            studentId: student.id,
            programId: { notIn: programIds },
            active: true,
          },
          data: { active: false, activeTo: new Date() },
        })

        await Promise.all(
          programIds.map((programId) => tx.trainerStudentAssignment.upsert({
            where: {
              trainerId_studentId_programId: {
                trainerId: trainer.id,
                studentId: student.id,
                programId,
              },
            },
            create: {
              trainerId: trainer.id,
              studentId: student.id,
              programId,
            },
            update: { active: true, activeTo: null },
          })),
        )
      })

      return { ok: true }
    }

    await db.user.update({
      where: { id: student.id },
      data: {
        name,
        email,
        expectedWorkoutsPerWeek,
      },
    })

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'No se pudo actualizar el perfil.',
    }
  }
}

export async function changeStudentPasswordWithCurrent(
  input: ChangeStudentPasswordWithCurrentInput,
): Promise<ChangeStudentPasswordWithCurrentResult> {
  const currentPassword = input.currentPassword.trim()
  const newPassword = input.newPassword.trim()

  if (!currentPassword) {
    return { ok: false, message: 'La contraseña actual es obligatoria.' }
  }

  if (newPassword.length < 8) {
    return { ok: false, message: 'La nueva contraseña debe tener al menos 8 caracteres.' }
  }

  try {
    const student = await db.user.findUnique({
      where: { id: input.studentId },
    })

    if (!student || student.role !== 'STUDENT' || !student.passwordHash) {
      return { ok: false, message: 'No se encontró el alumno.' }
    }

    const currentPasswordValid = await compare(currentPassword, student.passwordHash ?? '')

    if (!currentPasswordValid) {
      return { ok: false, message: 'La contraseña actual no es correcta.' }
    }

    await db.user.update({
      where: { id: student.id },
      data: {
        passwordHash: await hash(newPassword, 10),
        mustChangePassword: false,
      },
    })

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'No se pudo actualizar la contraseña.',
    }
  }
}

export async function toggleUserStatus(input: ToggleUserStatusInput): Promise<ToggleUserStatusResult> {
  try {
    const actor = await db.user.findUnique({
      where: { id: input.actorId },
    })

    if (!actor || actor.role !== 'ADMIN' || actor.status !== 'ACTIVE') {
      return { ok: false, message: 'No encontramos un admin activo para cambiar el estado.' }
    }

    const target = await db.user.findUnique({
      where: { id: input.userId },
    })

    if (!target) {
      return { ok: false, message: 'No se encontró el usuario a modificar.' }
    }

    if (target.id === actor.id) {
      return { ok: false, message: 'No podés desactivarte a vos mismo.' }
    }

    const nextStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    if (target.role === 'ADMIN' && nextStatus === 'INACTIVE') {
      const activeAdmins = await db.user.count({
        where: {
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })

      if (activeAdmins <= 1) {
        return { ok: false, message: 'No podés desactivar el último admin activo.' }
      }
    }

    await db.user.update({
      where: { id: target.id },
      data: { status: nextStatus },
    })

    return { ok: true, nextStatus }
  } catch {
    return {
      ok: false,
      message: 'No se pudo actualizar el estado del usuario.',
    }
  }
}

export async function listUsersPlaceholder(): Promise<UserSummary[]> {
  return []
}

export async function listStudentAssignmentsPlaceholder(): Promise<StudentAssignmentSummary[]> {
  return []
}
