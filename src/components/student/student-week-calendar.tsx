import Link from 'next/link'

import { formatLocalDateKey, getWeekDaysFrom, isSameCalendarDay } from '@/lib/date'

type WorkoutDay = {
  id: string
  scheduledAt: string
  programCode: string
}

type StudentWeekCalendarProps = {
  selectedDate: Date
  hrefBase?: string
  queryParamName?: string
  workouts?: WorkoutDay[]
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.5 6.5 9 12l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9.5 6.5 5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function getWeekdayLabel(date: Date) {
  return date
    .toLocaleDateString('es-AR', { weekday: 'short' })
    .replace('.', '')
    .toUpperCase()
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function getWeekRangeLabel(days: Date[]) {
  const start = days[0]
  const end = days[days.length - 1]

  return `${start.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  })}`
}

function getMonthLabel(days: Date[]) {
  const start = days[0]
  const end = days[days.length - 1]
  const startMonth = start.toLocaleDateString('es-AR', { month: 'long' })
  const endMonth = end.toLocaleDateString('es-AR', { month: 'long' })

  return start.getMonth() === end.getMonth() ? startMonth : `${startMonth} · ${endMonth}`
}

export function getWorkoutDotByDate(workouts: WorkoutDay[], date: Date) {
  return workouts
    .filter((workout) => isSameCalendarDay(workout.scheduledAt, date))
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt) || left.id.localeCompare(right.id))[0] ?? null
}

export function StudentWeekCalendar({ selectedDate, hrefBase = '/student', queryParamName = 'date', workouts = [] }: StudentWeekCalendarProps) {
  const days = getWeekDaysFrom(selectedDate)
  const previousWeek = addDays(selectedDate, -7)
  const nextWeek = addDays(selectedDate, 7)

  return (
    <div className="student-calendar-shell stack" aria-label="Calendario semanal">
      <div className="student-week-calendar__header">
        <Link
          className="student-week-calendar__arrow"
          href={`${hrefBase}?${queryParamName}=${formatLocalDateKey(previousWeek)}`}
          aria-label="Semana anterior"
        >
          <ArrowLeftIcon className="student-week-calendar__arrow-icon" />
        </Link>

        <div className="student-week-calendar__period">
          <span>{getMonthLabel(days)}</span>
          <strong>{getWeekRangeLabel(days)}</strong>
        </div>

        <Link
          className="student-week-calendar__arrow"
          href={`${hrefBase}?${queryParamName}=${formatLocalDateKey(nextWeek)}`}
          aria-label="Semana siguiente"
        >
          <ArrowRightIcon className="student-week-calendar__arrow-icon" />
        </Link>
      </div>

      <div className="student-week-calendar" role="list" aria-label={`Semana del ${getWeekRangeLabel(days)}`}>
        {days.map((date) => {
          const active = isSameCalendarDay(date, selectedDate)
          const workout = getWorkoutDotByDate(workouts, date)

          return (
            <Link
              key={formatLocalDateKey(date)}
              className={`student-week-calendar__day${active ? ' is-active' : ''}${workout ? ' has-workout' : ''}`}
              href={`${hrefBase}?${queryParamName}=${formatLocalDateKey(date)}`}
              aria-current={active ? 'date' : undefined}
              aria-label={`${date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}${workout ? `, entrenamiento ${workout.programCode}` : ''}`}
              role="listitem"
            >
              <span className="student-week-calendar__weekday">{getWeekdayLabel(date)}</span>
              <strong className="student-week-calendar__day-number">{date.getDate()}</strong>
              {workout ? (
                <span
                  className={`student-week-calendar__workout-dot student-week-calendar__workout-dot--${workout.programCode.toLowerCase().replaceAll('_', '-')}`}
                  aria-label={`Entrenamiento de ${workout.programCode}`}
                />
              ) : null}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
