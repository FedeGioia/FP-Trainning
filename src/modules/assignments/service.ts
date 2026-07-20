import { Prisma } from '@prisma/client'

import { db } from '@/lib/db'
import { calculateCurrentStreakFromDates } from '@/lib/streak'
import { canAccessAssignment } from './ownership'

import type {
  AddTrainerFeedbackInput,
  AddTrainerFeedbackResult,
  AssignmentDetail,
  AssignmentSummary,
  CreateAssignmentInput,
  CreateAssignmentResult,
  CreateManualAssignmentInput,
  CreateManualAssignmentResult,
  SaveAssignmentExerciseResultInput,
  SaveAssignmentExerciseResultResult,
  SubmitAssignmentResultInput,
  SubmitAssignmentResultResult,
  ValidationIssue,
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

function mapResultPayloadValue(payload: Prisma.JsonValue) {
  if (payload && typeof payload === 'object' && 'value' in payload) {
    return String(payload.value ?? '')
  }

  return ''
}

function parseOptionalNumber(value?: string) {
  const normalized = String(value ?? '').trim()

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function getStrengthPayload(payload: Prisma.JsonValue): { series: number | null; repetitions: number | null; weight: number | null } | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const rawSeries = 'series' in payload ? payload.series : undefined
  const rawRepetitions = 'repetitions' in payload ? payload.repetitions : undefined
  const rawWeight = 'weight' in payload ? payload.weight : undefined

  if (typeof rawSeries !== 'number' && typeof rawRepetitions !== 'number' && typeof rawWeight !== 'number') {
    return null
  }

  return {
    series: typeof rawSeries === 'number' ? rawSeries : null,
    repetitions: typeof rawRepetitions === 'number' ? rawRepetitions : null,
    weight: typeof rawWeight === 'number' ? rawWeight : null,
  }
}

function formatStrengthPayload(strength: { series: number | null; repetitions: number | null; weight: number | null } | null) {
  if (!strength) {
    return ''
  }

  const base = [strength.series, strength.repetitions].every((value) => value !== null)
    ? `${strength.series}x${strength.repetitions}`
    : ''

  const weightPart = strength.weight !== null ? ` @ ${strength.weight}kg` : ''
  return `${base}${weightPart}`.trim()
}

type NormalizedManualSection = {
  title: string
  exercises: Array<{
    exerciseId: string
    metricType: string
    prescription: Prisma.InputJsonValue
    restLabel: string | null
    methodLabel: string | null
    notes: string | null
  }>
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

    return assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      studentId: assignment.student.id,
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
    return []
  }
}

export async function listAssignmentsForStudent(studentId?: string): Promise<AssignmentSummary[]> {
  const assignments = await listAssignments()

  if (!studentId) {
    return []
  }

  return assignments.filter((assignment) => assignment.studentId === studentId)
}

export async function getStudentWorkoutStreak(studentId?: string): Promise<number> {
  if (!studentId) {
    return 0
  }

  try {
    const submissions = await db.workoutSubmission.findMany({
      where: {
        studentId,
        status: 'SUBMITTED',
        submittedAt: { not: null },
      },
      select: {
        submittedAt: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    })

    return calculateCurrentStreakFromDates(
      submissions.map((submission) => submission.submittedAt ?? new Date()),
    )
  } catch {
    return 0
  }
}

export async function getAssignmentDetailById(
  id: string,
  access?: { studentId?: string; trainerId?: string },
): Promise<AssignmentDetail | null> {
  try {
    const assignment = await db.assignedRoutine.findUnique({
      where: { id },
      include: {
        student: true,
        trainer: true,
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

    if (!canAccessAssignment({ studentId: assignment.student.id, trainerId: assignment.trainer.id }, access)) {
      throw new Error('assignment-not-found')
    }

    const resultEntriesByExerciseId = new Map(
      (assignment.submission?.resultEntries ?? []).map((entry) => [entry.assignedRoutineExerciseId, entry]),
    )

    const totalExerciseCount = assignment.sections.reduce((total, section) => total + section.exercises.length, 0)
    const completedExerciseCount = assignment.sections.reduce(
      (total, section) =>
        total + section.exercises.filter((exercise) => resultEntriesByExerciseId.has(exercise.id)).length,
      0,
    )

    return {
      id: assignment.id,
      studentId: assignment.student.id,
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
      completedExerciseCount,
      totalExerciseCount,
      sections: assignment.sections.map((section) => ({
        id: section.id,
        title: section.title,
        sectionType: section.sectionType,
        order: section.sectionOrder,
        exercises: section.exercises.map((exercise) => {
          const resultEntry = resultEntriesByExerciseId.get(exercise.id)
          const expectedStrength = getStrengthPayload(exercise.prescriptionSnapshot)
          const currentStrength = resultEntry ? getStrengthPayload(resultEntry.resultPayload) : null

          return {
            id: exercise.id,
            name: exercise.exercise.name,
            metricType: exercise.metricType,
            status: resultEntry ? 'COMPLETED' : 'PENDING',
            currentValue: currentStrength ? formatStrengthPayload(currentStrength) : resultEntry ? mapResultPayloadValue(resultEntry.resultPayload) : null,
            expectedValue: expectedStrength ? formatStrengthPayload(expectedStrength) : mapResultPayloadValue(exercise.prescriptionSnapshot),
            expectedStrength,
            currentStrength,
            restLabel: exercise.restLabel,
            methodLabel: exercise.methodLabel,
            notes: exercise.notes,
          }
        }),
      })),
    }
  } catch {
    return null
  }
}

export async function saveAssignmentExerciseResult(
  input: SaveAssignmentExerciseResultInput,
): Promise<SaveAssignmentExerciseResultResult> {
  const value = input.value.trim()
  const strengthSeries = parseOptionalNumber(input.strengthSeries)
  const strengthRepetitions = parseOptionalNumber(input.strengthRepetitions)
  const strengthWeight = parseOptionalNumber(input.strengthWeight)

  if (!input.assignmentId || !input.assignedExerciseId) {
    return { ok: false, message: 'No encontramos el bloque o ejercicio a actualizar.' }
  }

  try {
    const assignment = await db.assignedRoutine.findUnique({
      where: { id: input.assignmentId },
      include: {
        student: true,
        trainer: true,
        submission: true,
        sections: {
          include: {
            exercises: true,
          },
        },
      },
    })

    if (!assignment?.submission) {
      throw new Error('assignment-not-found');
    }

    if (!canAccessAssignment({ studentId: assignment.student.id, trainerId: assignment.trainer.id }, { studentId: input.studentId })) {
      throw new Error('assignment-not-found')
    }

    const exercises = assignment.sections.flatMap((section) => section.exercises)
    const targetExercise = exercises.find((exercise) => exercise.id === input.assignedExerciseId)

    if (!targetExercise) {
      return { ok: false, message: 'El ejercicio elegido no existe dentro de este bloque.' }
    }

    const isStrength = targetExercise.metricType === 'STRENGTH'

    if (isStrength) {
      if (Number.isNaN(strengthSeries) || Number.isNaN(strengthRepetitions) || Number.isNaN(strengthWeight)) {
        return { ok: false, message: 'Series, repeticiones y peso tienen que ser números válidos.' }
      }

      if (strengthSeries === null || strengthRepetitions === null || strengthWeight === null) {
        return { ok: false, message: 'Tenés que completar series, repeticiones y peso para guardar este ejercicio.' }
      }
    } else if (!value) {
      return { ok: false, message: 'Tenés que cargar un resultado antes de guardar.' }
    }

    await db.$transaction(async (tx) => {
      const existingEntry = await tx.workoutResultEntry.findFirst({
        where: {
          submissionId: assignment.submission!.id,
          assignedRoutineExerciseId: targetExercise.id,
        },
      })

      if (existingEntry) {
        await tx.workoutResultEntry.update({
          where: { id: existingEntry.id },
          data: {
            resultPayload: isStrength
              ? {
                  series: strengthSeries,
                  repetitions: strengthRepetitions,
                  weight: strengthWeight,
                }
              : { value },
          },
        })
      } else {
        await tx.workoutResultEntry.create({
          data: {
            submissionId: assignment.submission!.id,
            assignedRoutineExerciseId: targetExercise.id,
            resultType: targetExercise.metricType,
            resultPayload: isStrength
              ? {
                  series: strengthSeries,
                  repetitions: strengthRepetitions,
                  weight: strengthWeight,
                }
              : { value },
          },
        })
      }

      const savedResultsCount = await tx.workoutResultEntry.count({
        where: { submissionId: assignment.submission!.id },
      })

      const nextSubmissionStatus = savedResultsCount >= exercises.length ? 'SUBMITTED' : 'IN_PROGRESS'

      await tx.workoutSubmission.update({
        where: { id: assignment.submission!.id },
        data: {
          status: nextSubmissionStatus,
          submittedAt: nextSubmissionStatus === 'SUBMITTED' ? new Date() : null,
        },
      })

      await tx.assignedRoutine.update({
        where: { id: assignment.id },
        data: {
          status: mapSubmissionStatusToAssignmentStatus(nextSubmissionStatus),
        },
      })
    })

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'No se pudo guardar este ejercicio. Verificá la base y volvé a intentar.',
    }
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
        student: true,
        trainer: true,
        submission: true,
        sections: {
          include: {
            exercises: true,
          },
        },
      },
    })

    if (!assignment || !assignment.submission) {
      throw new Error('assignment-not-found');
    }

    if (!canAccessAssignment({ studentId: assignment.student.id, trainerId: assignment.trainer.id }, { studentId: input.studentId })) {
      throw new Error('assignment-not-found')
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
      include: {
        trainer: true,
        submission: true,
      },
    })

    if (!assignment?.submission) {
      return { ok: false, message: 'La asignación no tiene submission para comentar.' }
    }

    if (assignment.trainer.id !== input.trainerId) {
      return { ok: false, message: 'No podés comentar una asignación de otro trainer.' }
    }

    const trainer = await db.user.findUnique({
      where: { id: input.trainerId },
    })

    if (!trainer || trainer.role !== 'TRAINER' || trainer.status !== 'ACTIVE') {
      return { ok: false, message: 'No encontramos un trainer activo para guardar feedback.' }
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

export async function createManualAssignment(input: CreateManualAssignmentInput): Promise<CreateManualAssignmentResult> {
  const scheduledAt = new Date(input.scheduledAt)

  if (!input.studentId) {
    return { ok: false, message: 'Tenés que elegir un alumno.', issues: [{ path: 'studentId', message: 'Tenés que elegir un alumno.', kind: 'required' }] }
  }

  if (!input.programId) {
    return { ok: false, message: 'Tenés que elegir un programa.', issues: [{ path: 'programId', message: 'Tenés que elegir un programa.', kind: 'required' }] }
  }

  if (Number.isNaN(scheduledAt.getTime())) {
    return { ok: false, message: 'La fecha y hora elegidas no son válidas.', issues: [{ path: 'scheduledAt', message: 'La fecha y hora elegidas no son válidas.', kind: 'invalid' }] }
  }

  const issues: ValidationIssue[] = []
  const normalizedSections: Array<NormalizedManualSection | null> = input.sections.map((section, sectionIndex) => {
    const title = section.title.trim()
    const hasContent = title.length > 0 || section.exercises.some((exercise) => {
      const genericValue = String(exercise.prescription.value ?? '').trim()
      return [
        exercise.exerciseId,
        exercise.metricType,
        genericValue,
        exercise.prescription.series,
        exercise.prescription.repetitions,
        exercise.prescription.weight,
        exercise.restLabel,
        exercise.methodLabel,
        exercise.notes,
      ].some((value) => String(value ?? '').trim().length > 0)
    })

    if (!hasContent) {
      return null
    }

    if (!title) {
      issues.push({ path: `sections.${sectionIndex}.title`, message: `La sección ${sectionIndex + 1} necesita un título.`, kind: 'required' })
      return null
    }

    const normalizedExercises: NormalizedManualSection['exercises'] = []

    for (const [exerciseIndex, exercise] of section.exercises.entries()) {
      const exerciseId = exercise.exerciseId.trim()
      const metricType = exercise.metricType.trim()
      const restLabel = exercise.restLabel?.trim() || null
      const methodLabel = exercise.methodLabel?.trim() || null
      const notes = exercise.notes?.trim() || null
      const genericValue = String(exercise.prescription.value ?? '').trim()
      const series = exercise.prescription.series ?? null
      const repetitions = exercise.prescription.repetitions ?? null
      const weight = exercise.prescription.weight ?? null

      const hasExerciseContent = [exerciseId, metricType, genericValue, series, repetitions, weight, restLabel, methodLabel, notes]
        .some((value) => String(value ?? '').trim().length > 0)

      if (!hasExerciseContent) {
        continue
      }

      if (!exerciseId) {
        issues.push({ path: `sections.${sectionIndex}.exercises.${exerciseIndex}.exerciseId`, message: 'Tenés que elegir un ejercicio.', kind: 'required' })
        continue
      }

      if (!['STRENGTH', 'DURATION', 'DISTANCE', 'CUSTOM'].includes(metricType)) {
        issues.push({ path: `sections.${sectionIndex}.exercises.${exerciseIndex}.metricType`, message: 'Elegí una métrica válida.', kind: 'invalid' })
        continue
      }

      if (metricType === 'STRENGTH') {
        const strengthFields = [
          ['series', 'strengthSeries', series],
          ['repeticiones', 'strengthRepetitions', repetitions],
          ['peso', 'strengthWeight', weight],
        ] as const
        for (const [label, field, value] of strengthFields) {
          if (value === null) {
            issues.push({ path: `sections.${sectionIndex}.exercises.${exerciseIndex}.${field}`, message: `El ${label} es obligatorio.`, kind: 'required' })
          }
        }
        if (series === null || repetitions === null || weight === null) {
          continue
        }

        normalizedExercises.push({
          exerciseId,
          metricType,
          prescription: { series, repetitions, weight },
          restLabel,
          methodLabel,
          notes,
        })
      } else {
        if (!genericValue) {
          issues.push({ path: `sections.${sectionIndex}.exercises.${exerciseIndex}.prescriptionValue`, message: 'La prescripción es obligatoria.', kind: 'required' })
          continue
        }

        normalizedExercises.push({
          exerciseId,
          metricType,
          prescription: { value: genericValue },
          restLabel,
          methodLabel,
          notes,
        })
      }
    }

    if (normalizedExercises.length === 0) {
      if (!issues.some((issue) => issue.path.startsWith(`sections.${sectionIndex}.`))) {
        issues.push({ path: `sections.${sectionIndex}.title`, message: `La sección ${sectionIndex + 1} debe tener al menos un ejercicio válido.`, kind: 'required' })
      }
      return null
    }

    return {
      title,
      exercises: normalizedExercises,
    }
  })

  if (issues.length > 0) {
    return { ok: false, message: issues[0].message, issues }
  }

  const sectionsToCreate = normalizedSections.filter((section): section is NormalizedManualSection => Boolean(section))

  if (sectionsToCreate.length === 0) {
    return { ok: false, message: 'La rutina debe tener al menos una sección con ejercicios válidos.', issues: [{ path: 'sections', message: 'La rutina debe tener al menos una sección con ejercicios válidos.', kind: 'required' }] }
  }

  try {
    const trainer = await db.user.findUnique({
      where: { id: input.trainerId },
    })

    if (!trainer || trainer.role !== 'TRAINER' || trainer.status !== 'ACTIVE') {
      return { ok: false, message: 'No encontramos un trainer activo para crear la rutina.' }
    }

    const student = await db.user.findUnique({
      where: { id: input.studentId },
      include: { studentProgramMemberships: true },
    })

    if (!student || student.role !== 'STUDENT') {
      return { ok: false, message: 'El alumno elegido no existe.' }
    }

    const program = await db.program.findUnique({
      where: { id: input.programId },
    })

    if (!program) {
      return { ok: false, message: 'El programa elegido no existe.' }
    }

    const studentHasProgram = student.studentProgramMemberships.some(
      (membership) => membership.programId === program.id
    )

    if (!studentHasProgram) {
      return {
        ok: false,
        message: 'El alumno no pertenece al programa elegido.',
      }
    }

    const assignment = await db.assignedRoutine.create({
      data: {
        studentId: student.id,
        trainerId: trainer.id,
        programId: program.id,
        title: input.title?.trim() || `Rutina manual — ${student.name ?? student.email}`,
        scheduledAt,
        notes: input.notes?.trim() || null,
        sections: {
          create: sectionsToCreate.map((section, sectionIndex) => ({
            title: section.title,
            sectionType: 'CUSTOM',
            sectionOrder: sectionIndex + 1,
            exercises: {
              create: section.exercises.map((exercise, exerciseIndex) => ({
                exerciseOrder: exerciseIndex + 1,
                metricType: exercise.metricType as never,
                prescriptionSnapshot: exercise.prescription,
                restLabel: exercise.restLabel,
                methodLabel: exercise.methodLabel,
                notes: exercise.notes,
                exercise: {
                  connect: { id: exercise.exerciseId },
                },
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
      message: 'No se pudo crear la rutina manual. Verificá PostgreSQL, migraciones y seed.',
    }
  }
}

export async function createAssignment(input: CreateAssignmentInput): Promise<CreateAssignmentResult> {
  const scheduledAt = new Date(input.scheduledAt)

  if (!input.studentId) {
    return { ok: false, message: 'Tenés que elegir un alumno.', issues: [{ path: 'studentId', message: 'Tenés que elegir un alumno.', kind: 'required' }] }
  }

  if (!input.templateId) {
    return { ok: false, message: 'Tenés que elegir una plantilla.', issues: [{ path: 'templateId', message: 'Tenés que elegir una plantilla.', kind: 'required' }] }
  }

  if (Number.isNaN(scheduledAt.getTime())) {
    return { ok: false, message: 'La fecha y hora elegidas no son válidas.', issues: [{ path: 'scheduledAt', message: 'La fecha y hora elegidas no son válidas.', kind: 'invalid' }] }
  }

  try {
    const trainer = await db.user.findUnique({
      where: { id: input.trainerId },
    })

    if (!trainer || trainer.role !== 'TRAINER' || trainer.status !== 'ACTIVE') {
      return { ok: false, message: 'No encontramos un trainer activo para crear la asignación.' }
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
            title: section.title,
            sectionType: section.sectionType,
            sectionOrder: section.sectionOrder,
            notes: section.notes,
            sourceTemplate: section.id
              ? {
                  connect: { id: section.id },
                }
              : undefined,
            exercises: {
              create: section.exercises.map((exercise) => ({
                exerciseOrder: exercise.exerciseOrder,
                metricType: exercise.metricType,
                prescriptionSnapshot:
                  exercise.prescriptionPayload === null
                    ? Prisma.JsonNull
                    : (exercise.prescriptionPayload as Prisma.InputJsonValue),
                restLabel: exercise.restLabel,
                methodLabel: exercise.methodLabel,
                complementLabel: exercise.complementLabel,
                notes: exercise.notes,
                exercise: {
                  connect: { id: exercise.exerciseId },
                },
                sourceTemplate: exercise.id
                  ? {
                      connect: { id: exercise.id },
                    }
                  : undefined,
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
