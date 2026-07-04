import { db } from '@/lib/db'
import { assignmentCatalogSeed, assignmentDetailSeed } from '@/lib/constants/assignments'

import type {
  AddTrainerFeedbackInput,
  AddTrainerFeedbackResult,
  AssignmentDetail,
  AssignmentSummary,
  CreateAssignmentInput,
  CreateAssignmentResult,
  SubmitAssignmentResultInput,
  SubmitAssignmentResultResult,
} from './types'

function mapSubmissionStatusToAssignmentStatus(status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED') {
  switch (status) {
    case 'IN_PROGRESS':
      return 'IN_PROGRESS' as const
    case 'SUBMITTED':
      return 'COMPLETED' as const
    default:
      return 'PLANNED' as const
  }
}

export async function listAssignments(): Promise<AssignmentSummary[]> {
  try {
    const assignments = await db.assignedRoutine.findMany({
      orderBy: { scheduledAt: 'asc' },
      include: {
        student: true,
        template: true,
        program: true,
        sections: true,
        submission: true,
      },
      take: 24,
    })

    if (assignments.length === 0) {
      return assignmentCatalogSeed
    }

    return assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      studentName: assignment.student.name ?? assignment.student.email,
      templateName: assignment.template?.name ?? null,
      programCode: assignment.program.code,
      scheduledAt: assignment.scheduledAt.toISOString(),
      status: assignment.submission
        ? mapSubmissionStatusToAssignmentStatus(assignment.submission.status)
        : assignment.status,
      sectionCount: assignment.sections.length,
    }))
  } catch {
    return assignmentCatalogSeed
  }
}

export async function listAssignmentsForStudent(studentName?: string): Promise<AssignmentSummary[]> {
  const assignments = await listAssignments()

  if (!studentName) {
    return assignments.slice(0, 4)
  }

  const filtered = assignments.filter((assignment) => assignment.studentName.toLowerCase().includes(studentName.toLowerCase()))
  return filtered.length > 0 ? filtered : assignments.slice(0, 2)
}

export async function getAssignmentDetailById(id: string): Promise<AssignmentDetail | null> {
  try {
    const assignment = await db.assignedRoutine.findUnique({
      where: { id },
      include: {
        student: true,
        template: true,
        program: true,
        sections: {
          orderBy: { sectionOrder: 'asc' },
          include: {
            exercises: {
              orderBy: { exerciseOrder: 'asc' },
              include: { exercise: true },
            },
          },
        },
        submission: {
          include: {
            resultEntries: true,
          },
        },
      },
    })

    if (!assignment) {
      throw new Error('assignment-not-found')
    }

    return {
      id: assignment.id,
      title: assignment.title,
      studentName: assignment.student.name ?? assignment.student.email,
      templateName: assignment.template?.name ?? null,
      programCode: assignment.program.code,
      scheduledAt: assignment.scheduledAt.toISOString(),
      status: assignment.submission
        ? mapSubmissionStatusToAssignmentStatus(assignment.submission.status)
        : assignment.status,
      sectionCount: assignment.sections.length,
      notes: assignment.notes,
      studentNotes: assignment.submission?.studentNotes ?? null,
      sections: assignment.sections.map((section) => ({
        id: section.id,
        title: section.title,
        sectionType: section.sectionType,
        order: section.sectionOrder,
        exercises: section.exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.exercise.name,
          metricType: exercise.metricType,
        })),
      })),
    }
  } catch {
    return assignmentDetailSeed.find((assignment) => assignment.id === id) ?? assignmentDetailSeed[0] ?? null
  }
}

export async function submitAssignmentResults(input: SubmitAssignmentResultInput): Promise<SubmitAssignmentResultResult> {
  if (!input.assignmentId) {
    return { ok: false, message: 'No encontramos la asignación a actualizar.' }
  }

  if (!['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED'].includes(input.status)) {
    return { ok: false, message: 'El estado enviado no es válido.' }
  }

  try {
    const assignment = await db.assignedRoutine.findUnique({
      where: { id: input.assignmentId },
      include: {
        submission: true,
        sections: {
          include: {
            exercises: true,
          },
        },
      },
    })

    if (!assignment || !assignment.submission) {
      return { ok: false, message: 'La asignación no existe o no tiene submission inicial.' }
    }

    const exercises = assignment.sections.flatMap((section) => section.exercises)
    const resultRows = input.exerciseResults
      .map((result) => ({
        exercise: exercises.find((exercise) => exercise.id === result.assignedExerciseId),
        value: result.value.trim(),
      }))
      .filter((result) => result.exercise && result.value)

    await db.$transaction(async (tx) => {
      await tx.workoutResultEntry.deleteMany({
        where: { submissionId: assignment.submission!.id },
      })

      if (resultRows.length > 0) {
        await tx.workoutResultEntry.createMany({
          data: resultRows.map((row) => ({
            submissionId: assignment.submission!.id,
            assignedRoutineExerciseId: row.exercise!.id,
            resultType: row.exercise!.metricType,
            resultPayload: { value: row.value },
          })),
        })
      }

      await tx.workoutSubmission.update({
        where: { id: assignment.submission!.id },
        data: {
          status: input.status,
          studentNotes: input.studentNotes?.trim() || null,
          submittedAt: input.status === 'SUBMITTED' ? new Date() : null,
        },
      })

      await tx.assignedRoutine.update({
        where: { id: assignment.id },
        data: {
          status: mapSubmissionStatusToAssignmentStatus(input.status),
        },
      })
    })

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'No se pudieron guardar tus resultados. Verificá que la base esté arriba y con migraciones aplicadas.',
    }
  }
}

export async function addTrainerFeedback(input: AddTrainerFeedbackInput): Promise<AddTrainerFeedbackResult> {
  const comment = input.comment.trim()

  if (!input.assignmentId) {
    return { ok: false, message: 'No encontramos la asignación.' }
  }

  if (!comment) {
    return { ok: false, message: 'El comentario del trainer es obligatorio.' }
  }

  try {
    const assignment = await db.assignedRoutine.findUnique({
      where: { id: input.assignmentId },
      include: { submission: true },
    })

    if (!assignment?.submission) {
      return { ok: false, message: 'La asignación no tiene submission para comentar.' }
    }

    const trainer = await db.user.findFirst({
      where: { role: 'TRAINER', status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    })

    if (!trainer) {
      return { ok: false, message: 'No hay trainer disponible para guardar feedback.' }
    }

    await db.trainerFeedback.create({
      data: {
        trainerId: trainer.id,
        submissionId: assignment.submission.id,
        comment,
      },
    })

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'No se pudo guardar el feedback. Verificá que la base esté arriba y con migraciones aplicadas.',
    }
  }
}

export async function createAssignment(input: CreateAssignmentInput): Promise<CreateAssignmentResult> {
  const scheduledAt = new Date(input.scheduledAt)

  if (!input.studentId) {
    return { ok: false, message: 'Tenés que elegir un alumno.' }
  }

  if (!input.templateId) {
    return { ok: false, message: 'Tenés que elegir una plantilla.' }
  }

  if (Number.isNaN(scheduledAt.getTime())) {
    return { ok: false, message: 'La fecha y hora elegidas no son válidas.' }
  }

  try {
    const trainer = await db.user.findFirst({
      where: { role: 'TRAINER', status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    })

    if (!trainer) {
      return { ok: false, message: 'No hay trainer demo en la base. Corré el seed primero.' }
    }

    const student = await db.user.findUnique({
      where: { id: input.studentId },
      include: { studentProgramMemberships: true },
    })

    if (!student || student.role !== 'STUDENT') {
      return { ok: false, message: 'El alumno elegido no existe.' }
    }

    const template = await db.routineTemplate.findUnique({
      where: { id: input.templateId },
      include: {
        program: true,
        sections: {
          orderBy: { sectionOrder: 'asc' },
          include: {
            exercises: {
              orderBy: { exerciseOrder: 'asc' },
            },
          },
        },
      },
    })

    if (!template) {
      return { ok: false, message: 'La plantilla elegida no existe.' }
    }

    const studentHasProgram = student.studentProgramMemberships.some((membership) => membership.programId === template.programId)

    if (!studentHasProgram) {
      return {
        ok: false,
        message: 'El alumno no pertenece al programa de la plantilla elegida.',
      }
    }

    const assignment = await db.assignedRoutine.create({
      data: {
        studentId: student.id,
        trainerId: trainer.id,
        programId: template.programId,
        templateId: template.id,
        title: input.title?.trim() || `${template.name} — ${student.name ?? student.email}`,
        scheduledAt,
        notes: input.notes?.trim() || null,
        sections: {
          create: template.sections.map((section) => ({
            sourceTemplateSectionId: section.id,
            title: section.title,
            sectionType: section.sectionType,
            sectionOrder: section.sectionOrder,
            notes: section.notes,
            exercises: {
              create: section.exercises.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                sourceTemplateExerciseId: exercise.id,
                exerciseOrder: exercise.exerciseOrder,
                metricType: exercise.metricType,
                prescriptionSnapshot: exercise.prescriptionPayload,
                restLabel: exercise.restLabel,
                methodLabel: exercise.methodLabel,
                complementLabel: exercise.complementLabel,
                notes: exercise.notes,
              })),
            },
          })),
        },
        submission: {
          create: {
            studentId: student.id,
          },
        },
      },
    })

    return { ok: true, assignmentId: assignment.id }
  } catch {
    return {
      ok: false,
      message: 'No se pudo crear la asignación. Verificá PostgreSQL, migraciones y seed.',
    }
  }
}
