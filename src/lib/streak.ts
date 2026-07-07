const DEFAULT_TIME_ZONE = 'America/Argentina/Buenos_Aires'

function toDayKey(date: Date, timeZone = DEFAULT_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function previousDayKey(dayKey: string) {
  const [year, month, day] = dayKey.split('-').map(Number)
  const previous = new Date(Date.UTC(year, month - 1, day))
  previous.setUTCDate(previous.getUTCDate() - 1)

  return previous.toISOString().slice(0, 10)
}

export function calculateCurrentStreakFromDates(dates: Array<Date | string | number>, now = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const dayKeys = new Set(dates.map((date) => toDayKey(new Date(date), timeZone)))
  const todayKey = toDayKey(now, timeZone)
  const yesterdayKey = previousDayKey(todayKey)

  let cursor = dayKeys.has(todayKey) ? todayKey : dayKeys.has(yesterdayKey) ? yesterdayKey : null

  if (!cursor) {
    return 0
  }

  let streak = 0

  while (cursor && dayKeys.has(cursor)) {
    streak += 1
    cursor = previousDayKey(cursor)
  }

  return streak
}
