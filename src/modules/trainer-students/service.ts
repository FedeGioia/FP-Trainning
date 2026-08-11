import { db } from '@/lib/db'

import type { TrainerStudentDetail, TrainerStudentRosterRow, WeeklyAdherence } from './types'

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
  now = new Date(),
): Promise<TrainerStudentRosterRow[]> {
  try {
    const query = searchQuery.trim()
    const week = getCurrentWeekRange(now)

    const students = await db.user.findMany({
      where: {
        role: 'STUDENT',
        studentAssignments: {
          some: { trainerId, active: true },
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
