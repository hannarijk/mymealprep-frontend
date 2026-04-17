export function defaultPlanTitle(now = new Date()): string {
  const daysUntilNextMonday = ((8 - now.getDay()) % 7) || 7
  const nextMonday = new Date(now)
  nextMonday.setDate(now.getDate() + daysUntilNextMonday)
  return `Week of ${nextMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}
