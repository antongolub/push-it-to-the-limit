import type { IComplexDelay, ILimit, ILimiter, ILimitStack } from './interface'

export class Limiter implements ILimiter {
  limits: ILimitStack

  constructor (items: Array<Limiter | IComplexDelay>) {
    this.limits = items.reduce<ILimitStack>((acc, cur) => {
      if (cur instanceof Limiter) {
        return acc.concat(cur.limits)
      }
      return [...acc, { ...cur, rest: cur.count, ttl: 0 }]
    }, [])
    return this
  }

  decrease (): void {
    this.limits.forEach(limit => {
      limit.rest += -1
    })
  }

  reset (): void {
    this.limits.forEach(Limiter.refreshLimit)
  }

  resetTtl (): void {
    this.limits.forEach(Limiter.refreshTtl)
  }

  isAllowed (): boolean {
    return !this.limits.find(({ rest }) => rest < 1)
  }

  getNextDelay (): number {
    const ttl = this.limits.reduce(
      (acc, { rest, ttl }) => rest < 1 && ttl > acc ? ttl : acc,
      0
    )
    return ttl - Date.now()
  }

  getNextQueueSize (): number {
    this.reset()
    return Math.min(...this.limits.map(({ rest }) => rest))
  }

  static refreshLimit (limit: ILimit): ILimit {
    if (limit.ttl === undefined || limit.ttl < Date.now()) {
      limit.rest = limit.count
      limit.ttl = Date.now() + limit.period
    }

    return limit
  }

  static refreshTtl (limit: ILimit) {
    limit.ttl = Date.now() + limit.period
  }
}
