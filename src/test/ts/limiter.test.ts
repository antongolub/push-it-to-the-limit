import { Limiter } from '../../main/ts/limiter'
import { expect, it, describe } from '@abstractest/core'

describe('limiter', () => {
  const delays = [{ period: 10, count: 5 }, { period: 50, count: 10 }]

  it('constructs proper instance', () => {
    const limiter = new Limiter(delays)

    expect(limiter).toBeInstanceOf(Limiter)
    expect(limiter.limits).toEqual(expect.any(Array))
  })

  describe('prototype', () => {
    it('`decrease` reduces available limit', () => {
      const limiter = new Limiter(delays)
      const limits = limiter.limits
      limiter.decrease()

      expect(limits[0].rest).toBe(4)
      expect(limits[1].rest).toBe(9)
    })

    it('handles injected limiter too', () => {
      const l1 = new Limiter([{ period: 10, count: 4 }])
      const l2 = new Limiter([{ period: 50, count: 5 }, l1])

      l2.decrease()

      expect(l1.limits[0]).toBe(l2.limits[1])
      expect(l1.limits[0].rest).toBe(3)
      expect(l2.limits[0].rest).toBe(4)
      expect(l2.limits[1].rest).toBe(3)
    })

    it('`reset` restores the limits', () => {
      const limiter = new Limiter(delays)
      const limits = limiter.limits
      limiter.decrease()
      limiter.reset()

      expect(limits[0].rest).toBe(5)
      expect(limits[1].rest).toBe(10)
    })

    it('`isAllowed` checks limits', () => {
      const limiter = new Limiter(delays)

      expect(limiter.isAllowed()).toBeTruthy()
      limiter.limits[0].rest = 0

      expect(limiter.isAllowed()).toBeFalsy()
    })

    it('`getNextDelay` returns the closest delay', () => {
      const limiter = new Limiter(delays)
      limiter.reset()

      expect(limiter.getNextDelay() < 0).toBeTruthy()

      limiter.limits[0].rest = 0
      const delay = limiter.getNextDelay()

      expect(delay > 0 && delay <= 10).toBeTruthy()
    })
  })
})
