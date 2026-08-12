import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

import { ProgramCode } from '@prisma/client'

type Fixture = {
  trainerOwnerId: string
  trainerOtherId: string
  studentOwnerId: string
  studentOtherId: string
  categoryId: string
  exerciseId: string
  assignmentId: string
  assignmentExerciseId: string
}

type DbClient = typeof import('@/lib/db').db
type CreateManualAssignment = typeof import('@/modules/assignments').createManualAssignment

function test(name: string, fn: () => Promise<void>) {
  return fn()
    .then(() => {
      console.log(`✓ ${name}`)
    })
    .catch((error) => {
      console.error(`✗ ${name}`)
      throw error
    })
}

async function seedFixture(
  db: DbClient,
  createManualAssignment: CreateManualAssignment,
): Promise<Fixture> {
  const suffix = randomUUID().slice(0, 8)

  const program = await db.program.upsert({
    where: { code: ProgramCode.FP_TRAINING },
    update: {
      active: true,
    },
    create: {
      code: ProgramCode.FP_TRAINING,
      name: 'FP-Training',
      description: 'Programa base de entrenamiento.',
      active: true,
    },
  })

  const trainerOwner = await db.user.create({
    data: {
      email: `trainer-owner-${suffix}@example.com`,
      name: 'Trainer Owner',
      role: 'TRAINER',
      status: 'ACTIVE',
    },
  })

  const trainerOther = await db.user.create({
    data: {
      email: `trainer-other-${suffix}@example.com`,
      name: 'Trainer Other',
      role: 'TRAINER',
      status: 'ACTIVE',
    },
  })

  const studentOwner = await db.user.create({
    data: {
      email: `student-owner-${suffix}@example.com`,
      name: 'Student Owner',
      role: 'STUDENT',
      status: 'ACTIVE',
      studentProgramMemberships: {
        create: {
          programId: program.id,
        },
      },
    },
  })

  const studentOther = await db.user.create({
    data: {
      email: `student-other-${suffix}@example.com`,
      name: 'Student Other',
      role: 'STUDENT',
      status: 'ACTIVE',
      studentProgramMemberships: {
        create: {
          programId: program.id,
        },
      },
    },
  })

  const category = await db.exerciseCategory.create({
    data: {
      name: `Pecho ${suffix}`,
      createdById: trainerOwner.id,
    },
  })

  const exercise = await db.exercise.create({
    data: {
      name: `Press banca ${suffix}`,
      description: 'Fixture integration',
      primaryMetricType: 'STRENGTH',
      createdById: trainerOwner.id,
      categoryId: category.id,
    },
  })

  const assignment = await createManualAssignment({
    studentId: studentOwner.id,
    programId: program.id,
    scheduledAt: new Date().toISOString(),
    title: `Rutina integración ${suffix}`,
    notes: 'Fixture integration',
    trainerId: trainerOwner.id,
    sections: [
      {
        title: 'Bloque principal',
        exercises: [
          {
            exerciseId: exercise.id,
            metricType: 'STRENGTH',
            prescription: {
              series: 3,
              repetitions: 8,
              weight: 60,
            },
          },
        ],
      },
    ],
  })

  if (!assignment.ok) {
    throw new Error(`Fixture setup failed: ${assignment.message}`)
  }

  const createdAssignment = await db.assignedRoutine.findUnique({
    where: { id: assignment.assignmentId },
    include: {
      sections: {
        include: {
          exercises: true,
        },
      },
    },
  })

  const assignmentExerciseId = createdAssignment?.sections[0]?.exercises[0]?.id

  if (!assignmentExerciseId) {
    throw new Error('Fixture setup failed: assigned exercise not found')
  }

  return {
    trainerOwnerId: trainerOwner.id,
    trainerOtherId: trainerOther.id,
    studentOwnerId: studentOwner.id,
    studentOtherId: studentOther.id,
    categoryId: category.id,
    exerciseId: exercise.id,
    assignmentId: assignment.assignmentId,
    assignmentExerciseId,
  }
}

async function cleanupFixture(db: DbClient, fixture: Fixture) {
  await db.trainerFeedback.deleteMany({
    where: {
      trainerId: {
        in: [fixture.trainerOwnerId, fixture.trainerOtherId],
      },
    },
  })

  await db.assignedRoutine.deleteMany({
    where: { id: fixture.assignmentId },
  })

  await db.exercise.deleteMany({
    where: { id: fixture.exerciseId },
  })

  await db.exerciseCategory.deleteMany({
    where: { id: fixture.categoryId },
  })

  await db.studentProgramMembership.deleteMany({
    where: {
      studentId: {
        in: [fixture.studentOwnerId, fixture.studentOtherId],
      },
    },
  })

  await db.user.deleteMany({
    where: {
      id: {
        in: [fixture.trainerOwnerId, fixture.trainerOtherId, fixture.studentOwnerId, fixture.studentOtherId],
      },
    },
  })
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('Set DATABASE_URL or DATABASE_URL_TEST before running integration tests.')
  }

  Object.assign(process.env, {
    DATABASE_URL: databaseUrl,
    NODE_ENV: 'test',
  })

  const { db } = await import('@/lib/db')
  const {
    addTrainerFeedback,
    createManualAssignment,
    getAssignmentDetailById,
    listAssignmentsForStudent,
    saveAssignmentExerciseResult,
    submitAssignmentResults,
  } = await import('@/modules/assignments')
  const { createTemplate, listTemplates } = await import('@/modules/templates')

  const fixture = await seedFixture(db, createManualAssignment)
  let createdTemplateId: string | null = null

  try {
    await test('listAssignmentsForStudent only returns the owner assignment', async () => {
      const ownerAssignments = await listAssignmentsForStudent(fixture.studentOwnerId)
      const otherAssignments = await listAssignmentsForStudent(fixture.studentOtherId)

      assert.equal(ownerAssignments.length, 1)
      assert.equal(ownerAssignments[0]?.id, fixture.assignmentId)
      assert.equal(otherAssignments.length, 0)
    })

    await test('createManualAssignment accepts blank and partial strength prescriptions', async () => {
      const result = await createManualAssignment({
        studentId: fixture.studentOwnerId,
        programId: (await db.assignedRoutine.findUniqueOrThrow({ where: { id: fixture.assignmentId } })).programId,
        scheduledAt: new Date().toISOString(),
        trainerId: fixture.trainerOwnerId,
        sections: [{
          title: 'Carga a completar',
          exercises: [
            { exerciseId: fixture.exerciseId, prescription: {} },
            { exerciseId: fixture.exerciseId, prescription: { repetitions: 8 } },
          ],
        }],
      })

      assert.equal(result.ok, true)
      if (!result.ok) return

      try {
        const assignment = await db.assignedRoutine.findUniqueOrThrow({
          where: { id: result.assignmentId },
          include: { sections: { include: { exercises: { orderBy: { exerciseOrder: 'asc' } } } } },
        })
        const exercises = assignment.sections[0]?.exercises ?? []

        assert.deepEqual(exercises[0]?.prescriptionSnapshot, { series: null, repetitions: null, weight: null })
        assert.deepEqual(exercises[1]?.prescriptionSnapshot, { series: null, repetitions: 8, weight: null })
      } finally {
        await db.assignedRoutine.delete({ where: { id: result.assignmentId } })
      }
    })

    await test('getAssignmentDetailById rejects wrong student ownership', async () => {
      const assignment = await getAssignmentDetailById(fixture.assignmentId, { studentId: fixture.studentOtherId })
      assert.equal(assignment, null)
    })

    await test('addTrainerFeedback rejects another trainer', async () => {
      const result = await addTrainerFeedback({
        assignmentId: fixture.assignmentId,
        trainerId: fixture.trainerOtherId,
        comment: 'No debería pasar',
      })

      assert.equal(result.ok, false)
      if (!result.ok) {
        assert.match(result.message, /otro trainer/i)
      }
    })

    await test('addTrainerFeedback saves feedback for the owning trainer', async () => {
      const result = await addTrainerFeedback({
        assignmentId: fixture.assignmentId,
        trainerId: fixture.trainerOwnerId,
        comment: 'Buen control técnico',
      })

      assert.equal(result.ok, true)

      const feedback = await db.trainerFeedback.findFirst({
        where: {
          trainerId: fixture.trainerOwnerId,
          submissionId: {
            not: null,
          },
        },
      })

      assert.equal(Boolean(feedback), true)
      assert.equal(feedback?.comment, 'Buen control técnico')
    })

    await test('saveAssignmentExerciseResult rejects another student', async () => {
      const result = await saveAssignmentExerciseResult({
        assignmentId: fixture.assignmentId,
        assignedExerciseId: fixture.assignmentExerciseId,
        value: '3x8 @ 60kg',
        studentId: fixture.studentOtherId,
      })

      assert.equal(result.ok, false)
    })

    await test('saveAssignmentExerciseResult atomically replaces ordered strength set results', async () => {
      const result = await saveAssignmentExerciseResult({
        assignmentId: fixture.assignmentId,
        assignedExerciseId: fixture.assignmentExerciseId,
        value: '',
        studentId: fixture.studentOwnerId,
        strengthSets: [
          { repetitions: '8', weight: '60' },
          { repetitions: '6', weight: '65.5' },
        ],
      })

      assert.equal(result.ok, true)

      const entry = await db.workoutResultEntry.findFirstOrThrow({
        where: { assignedRoutineExerciseId: fixture.assignmentExerciseId },
        include: { strengthSetResults: { orderBy: { setOrder: 'asc' } } },
      })
      assert.deepEqual(entry.strengthSetResults.map((set) => [set.setOrder, set.repetitions, set.weight]), [
        [1, 8, 60],
        [2, 6, 65.5],
      ])

      const assignment = await getAssignmentDetailById(fixture.assignmentId, { studentId: fixture.studentOwnerId })
      const exercise = assignment?.sections[0]?.exercises[0]
      assert.deepEqual(exercise?.currentStrengthSets, [
        { repetitions: 8, weight: 60 },
        { repetitions: 6, weight: 65.5 },
      ])
      assert.equal(exercise?.status, 'COMPLETED')
    })

    await test('submitAssignmentResults saves a completed student submission', async () => {
      const result = await submitAssignmentResults({
        assignmentId: fixture.assignmentId,
        studentId: fixture.studentOwnerId,
        studentNotes: 'Se sintió bien',
        status: 'SUBMITTED',
        exerciseResults: [
          {
            assignedExerciseId: fixture.assignmentExerciseId,
            value: '3x8 @ 60kg',
          },
        ],
      })

      assert.equal(result.ok, true)

      const assignment = await getAssignmentDetailById(fixture.assignmentId, { studentId: fixture.studentOwnerId })

      assert.equal(assignment?.status, 'COMPLETED')
      assert.equal(assignment?.studentNotes, 'Se sintió bien')
      assert.equal(assignment?.completedExerciseCount, 1)
    })

    await test('createTemplate saves a real template with owned trainer and exercise', async () => {
      const result = await createTemplate({
        name: `Plantilla integración ${fixture.exerciseId.slice(0, 6)}`,
        description: 'Template de prueba real',
        programCode: 'FP_TRAINING',
        createdById: fixture.trainerOwnerId,
        sections: [
          {
            title: 'Bloque principal',
            type: 'MAIN',
            exercises: [
              {
                exerciseId: fixture.exerciseId,
                metricType: 'STRENGTH',
                prescriptionValue: '',
                strengthSeries: '3',
                strengthRepetitions: '8',
                strengthWeight: '60',
                restLabel: '90s',
                methodLabel: 'Lineal',
                notes: 'Integración',
              },
            ],
          },
        ],
      })

      assert.equal(result.ok, true)

      if (!result.ok) {
        return
      }

      createdTemplateId = result.templateId

      const templates = await listTemplates()
      const created = templates.find((template) => template.id === result.templateId)

      assert.equal(Boolean(created), true)
      assert.equal(created?.sections.length, 1)
      assert.equal(created?.sections[0]?.exercises.length, 1)
    })
  } finally {
    if (createdTemplateId) {
      await db.routineTemplate.delete({ where: { id: createdTemplateId } })
    }

    await cleanupFixture(db, fixture)
    await db.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
