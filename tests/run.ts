import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FeatureCard } from '@/components/ui/feature-card'
import { ProgramCard } from '@/components/ui/program-card'
import { canAccessAssignment } from '@/modules/assignments/ownership'
import { calculateCurrentStreakFromDates } from '@/lib/streak'
import { isSameCalendarDay } from '@/lib/date'
import { getWeekDaysFrom, formatLocalDateKey } from '@/lib/date'

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    throw error
  }
}

test('FeatureCard renders a fallback for null description', () => {
  const html = renderToStaticMarkup(createElement(FeatureCard, { title: 'Card', description: null }))
  assert.match(html, /Sin descripción/i)
})

test('ProgramCard renders a fallback for null description', () => {
  const html = renderToStaticMarkup(
    createElement(ProgramCard, {
      program: {
        id: 'p1',
        code: 'FP_TRAINING',
        name: 'FP-Training',
        description: null,
        active: true,
      },
    }),
  )
  assert.match(html, /Sin descripción todavía\./i)
})

test('isSameCalendarDay matches equal calendar days and rejects different ones', () => {
  assert.equal(isSameCalendarDay(new Date(2026, 6, 5, 10, 0, 0), new Date(2026, 6, 5, 23, 59, 59)), true)
  assert.equal(isSameCalendarDay(new Date(2026, 6, 5, 23, 59, 59), new Date(2026, 6, 6, 0, 0, 0)), false)
})

test('canAccessAssignment enforces ownership for student and trainer', () => {
  const owners = { studentId: 'student-1', trainerId: 'trainer-1' }

  assert.equal(canAccessAssignment(owners, { studentId: 'student-1' }), true)
  assert.equal(canAccessAssignment(owners, { studentId: 'student-2' }), false)
  assert.equal(canAccessAssignment(owners, { trainerId: 'trainer-1' }), true)
  assert.equal(canAccessAssignment(owners, { trainerId: 'trainer-2' }), false)
})

test('calculateCurrentStreakFromDates counts consecutive completed workout days', () => {
  const now = new Date('2026-07-06T12:00:00Z')

  assert.equal(
    calculateCurrentStreakFromDates(
      [
        '2026-07-06T08:00:00Z',
        '2026-07-05T19:00:00Z',
        '2026-07-04T07:00:00Z',
        '2026-07-02T07:00:00Z',
      ],
      now,
      'UTC',
    ),
    3,
  )
})

test('getWeekDaysFrom returns a Sunday-to-Saturday range', () => {
  const week = getWeekDaysFrom(new Date('2026-07-08T12:00:00Z'))

  assert.equal(week.length, 7)
  assert.equal(formatLocalDateKey(week[0]), '2026-07-05')
  assert.equal(formatLocalDateKey(week[6]), '2026-07-11')
})

console.log('All tests passed')
