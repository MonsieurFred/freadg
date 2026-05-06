const APP_TIME_ZONE = 'Europe/Brussels'

export function getWeekStartDate(referenceDate = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(referenceDate)

  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const dayOfMonth = Number(parts.find((part) => part.type === 'day')?.value)

  const localDateAtNoonUtc = new Date(Date.UTC(year, month - 1, dayOfMonth, 12))
  const dayOfWeek = localDateAtNoonUtc.getUTCDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  localDateAtNoonUtc.setUTCDate(localDateAtNoonUtc.getUTCDate() + diff)

  const mondayYear = localDateAtNoonUtc.getUTCFullYear()
  const mondayMonth = String(localDateAtNoonUtc.getUTCMonth() + 1).padStart(2, '0')
  const mondayDay = String(localDateAtNoonUtc.getUTCDate()).padStart(2, '0')

  return `${mondayYear}-${mondayMonth}-${mondayDay}`
}
