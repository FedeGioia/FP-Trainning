import { ProgramCode } from '@prisma/client'

import { db } from '@/lib/db'

import type { TrainerStudentDetail, TrainerStudentRosterRow, WeeklyAdherence } from './types'
import type { TrainerDashboardData, TrainerDashboardTraining } from './types'

export type WeekRange = {
  start: Date
  end: Date
}

export function getCurrentWeekRange(now = new Date()): WeekRange {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())

  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return { start, end }
}

function isProgramCode(value: string): value is ProgramCode {
  return Object.values(ProgramCode).includes(value as ProgramCode)
}

function mapWeeklyAdherence(
  expectedWorkoutsPerWeek: number,
  weekStart: Date,
  routines: Array<{ submission: { status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' } | null }>,
): WeeklyAdherence {
  const scheduledCount = routines.length
  const completedCount = routines.filter((routine) => routine.submission?.status === 'SUBMITTED').length
  const goalTarget = expectedWorkoutsPerWeek > 0 ? expectedWorkoutsPerWeek : null

  return {
    weekStart: weekStart.toISOString(),
    scheduledCount,
    completedCount,
    pendingCount: scheduledCount - completedCount,
    goalTarget,
    goalCompletionRate: goalTarget === null ? null : completedCount / goalTarget,
  }
}

function mapRosterRow(
  student: {
    id: string
    name: string | null
    email: string
    expectedWorkoutsPerWeek: number
    studentAssignments: Array<{ program: { code: string } }>
    studentAssignedRoutines: Array<{ submission: { status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' } | null }>
    _count: { studentAssignedRoutines: number }
  },
  weekStart: Date,
): TrainerStudentRosterRow {
  return {
    id: student.id,
    name: student.name ?? 'Sin nombre',
    email: student.email,
    programCodes: student.studentAssignments.map((assignment) => assignment.program.code),
    expectedWorkoutsPerWeek: student.expectedWorkoutsPerWeek,
    assignmentHistoryCount: student._count.studentAssignedRoutines,
    weekly: mapWeeklyAdherence(student.expectedWorkoutsPerWeek, weekStart, student.studentAssignedRoutines),
  }
}

export async function listTrainerStudentRoster(
  trainerId: string,
  searchQuery = '',
  programCode = '',
  now = new Date(),
): Promise<TrainerStudentRosterRow[]> {
  try {
    const query = searchQuery.trim()
    const selectedProgram = programCode.trim()
    const week = getCurrentWeekRange(now)

    let selectedProgramCode: ProgramCode | undefined
    if (selectedProgram) {
      if (!isProgramCode(selectedProgram)) {
        return []
      }

      selectedProgramCode = selectedProgram
    }

    const students = await db.user.findMany({
      where: {
        role: 'STUDENT',
        studentAssignments: {
          some: {
            trainerId,
            active: true,
            ...(selectedProgramCode ? { program: { code: selectedProgramCode } } : {}),
          },
        },
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                {
                  studentAssignments: {
                    some: {
                      trainerId,
                      active: true,
                      program: { name: { contains: query, mode: 'insensitive' } },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        studentAssignments: {
          where: { trainerId, active: true },
          include: { program: true },
        },
        studentAssignedRoutines: {
          where: {
            trainerId,
            scheduledAt: { gte: week.start, lt: week.end },
          },
          select: {
            submission: {
              select: { status: true },
            },
          },
        },
        _count: {
          select: {
            studentAssignedRoutines: { where: { trainerId } },
          },
        },
      },
    })

    return students.map((student) => mapRosterRow(student, week.start))
  } catch {
    return []
  }
}

export async function getTrainerStudentDetail(
  trainerId: string,
  studentId: string,
  now = new Date(),
): Promise<TrainerStudentDetail | null> {
  try {
    const week = getCurrentWeekRange(now)
    const student = await db.user.findFirst({
      where: {
        id: studentId,
        role: 'STUDENT',
        studentAssignments: {
          some: { trainerId, active: true },
        },
      },
      include: {
        studentAssignments: {
          where: { trainerId, active: true },
          include: { program: true },
        },
        studentAssignedRoutines: {
          where: {
            trainerId,
            scheduledAt: { gte: week.start, lt: week.end },
          },
          select: {
            submission: {
              select: { status: true },
            },
          },
        },
        _count: {
          select: {
            studentAssignedRoutines: { where: { trainerId } },
          },
        },
      },
    })

    return student ? mapRosterRow(student, week.start) : null
  } catch {
    return null
  }
}

function getDashboardAssignmentStatus(
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'CANCELLED',
  submission: { status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' } | null,
): TrainerDashboardTraining['status'] {
  if (status === 'CANCELLED') return 'CANCELLED'
  if (submission?.status === 'SUBMITTED') return 'COMPLETED'
  if (submission?.status === 'IN_PROGRESS') return 'IN_PROGRESS'
  return 'PLANNED'
}

/**
 * Aggregates the trainer's active roster and its routines. Unlike the generic
 * assignment listing, every query is scoped to the requesting trainer and no
 * assignment list is capped.
 */
export async function getTrainerDashboardData(trainerId: string, now = new Date()): Promise<TrainerDashboardData> {
  try {
    const week = getCurrentWeekRange(now)
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)
    const inactiveSince = new Date(now)
    inactiveSince.setDate(inactiveSince.getDate() - 7)

    const students = await db.user.findMany({
      where: {
        role: 'STUDENT',
        studentAssignments: { some: { trainerId, active: true } },
      },
      orderBy: { name: 'asc' },
      include: {
        studentAssignedRoutines: {
          where: {
            trainerId,
            scheduledAt: { gte: week.start, lt: week.end },
          },
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true,
            submission: { select: { status: true } },
          },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    })

    const studentIds = students.map((student) => student.id)
    const completedSubmissions = studentIds.length === 0
      ? []
      : await db.workoutSubmission.findMany({
          where: {
            studentId: { in: studentIds },
            status: 'SUBMITTED',
            submittedAt: { not: null },
            assignedRoutine: { trainerId },
          },
          select: { studentId: true, submittedAt: true },
          orderBy: { submittedAt: 'desc' },
        })

    const latestCompletionByStudent = new Map<string, Date>()
    for (const submission of completedSubmissions) {
      if (submission.submittedAt && !latestCompletionByStudent.has(submission.studentId)) {
        latestCompletionByStudent.set(submission.studentId, submission.submittedAt)
      }
    }

    const weeklyTrainings = students.flatMap((student) => student.studentAssignedRoutines.map((routine) => ({
      id: routine.id,
      title: routine.title,
      studentId: student.id,
      studentName: student.name ?? student.email,
      scheduledAt: routine.scheduledAt.toISOString(),
      status: getDashboardAssignmentStatus(routine.status, routine.submission),
    })))
    const activeWeeklyTrainings = weeklyTrainings.filter((training) => training.status !== 'CANCELLED')
    const todayTrainings = activeWeeklyTrainings.filter((training) => {
      const scheduledAt = new Date(training.scheduledAt)
      return scheduledAt >= todayStart && scheduledAt < tomorrowStart
    })
    const attention = students.flatMap((student) => {
      const reasons: TrainerDashboardData['attention'][number]['reasons'] = []
      const latestCompletion = latestCompletionByStudent.get(student.id)

      if (!latestCompletion || latestCompletion <= inactiveSince) {
        reasons.push({
          type: 'INACTIVE',
          label: latestCompletion
            ? `${Math.floor((todayStart.getTime() - latestCompletion.getTime()) / 86_400_000)} días sin completar entrenamientos`
            : 'Sin entrenamientos completados',
        })
      }

      if (!activeWeeklyTrainings.some((training) => training.studentId === student.id)) {
        reasons.push({ type: 'NO_WEEKLY_ROUTINE', label: 'Sin rutinas cargadas esta semana' })
      }

      return reasons.length > 0 ? [{ id: student.id, name: student.name ?? student.email, reasons }] : []
    })

    return {
      studentCount: students.length,
      todayTrainings,
      week: {
        total: activeWeeklyTrainings.length,
        completed: activeWeeklyTrainings.filter((training) => training.status === 'COMPLETED').length,
        pending: activeWeeklyTrainings.filter((training) => training.status === 'PLANNED' || training.status === 'IN_PROGRESS').length,
        overdue: activeWeeklyTrainings.filter((training) => training.status === 'PLANNED' && new Date(training.scheduledAt) < todayStart).length,
      },
      attention,
    }
  } catch {
    return {
      studentCount: 0,
      todayTrainings: [],
      week: { total: 0, completed: 0, pending: 0, overdue: 0 },
      attention: [],
    }
  }
}
