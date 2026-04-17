import { describe, it, expect } from 'vitest'
import { defaultPlanTitle } from '@/utils/planUtils'

const date = (y: number, m: number, d: number) => new Date(y, m - 1, d)

describe('defaultPlanTitle', () => {
  it('returns next Monday from a Thursday', () => {
    // Thu Apr 16 2026 → next Mon Apr 20
    expect(defaultPlanTitle(date(2026, 4, 16))).toBe('Week of Apr 20')
  })

  it('returns next Monday from a Sunday', () => {
    // Sun Apr 19 2026 → next Mon Apr 20
    expect(defaultPlanTitle(date(2026, 4, 19))).toBe('Week of Apr 20')
  })

  it('returns NEXT Monday when today is Monday, not today', () => {
    // Mon Apr 20 2026 → next Mon Apr 27 (not Apr 20)
    expect(defaultPlanTitle(date(2026, 4, 20))).toBe('Week of Apr 27')
  })

  it('returns next Monday from a Saturday', () => {
    // Sat Apr 18 2026 → next Mon Apr 20
    expect(defaultPlanTitle(date(2026, 4, 18))).toBe('Week of Apr 20')
  })

  it('handles month boundary correctly', () => {
    // Thu Apr 30 2026 → next Mon May 4
    expect(defaultPlanTitle(date(2026, 4, 30))).toBe('Week of May 4')
  })
})
