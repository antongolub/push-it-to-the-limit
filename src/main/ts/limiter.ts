import type { IComplexDelay, ILimit, ILimiter, ILimitStack } from './interface'

export class Limiter implements ILimiter {
  limits: ILimitStack

  constructor (items: Array<Limiter | IComplexDelay>) {
    this.limits = items.reduce<ILimitStack>((acc, item) => {
      if (item instanceof Limiter) {
        return acc.concat(item.limits)
      }
      return [...acc, { ...item, rest: item.count, ttl: 0 }]
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
    return !this.limits.some(({ rest }) => rest < 1)
  }

  getNextDelay (): number {
    let ttl = 0
    const limits = this.limits

    for (const limit of limits) {
      if (limit.rest < 1 && limit.ttl > ttl) {
        ttl = limit.ttl
      }
    }

    return ttl - Date.now()
  }

  getNextQueueSize (): number {
    return Math.min(...this.limits.map(({ rest }) => rest))
  }

  static refreshLimit (limit: ILimit): ILimit {
    if (limit.ttl === undefined || limit.ttl < Date.now()) {
      limit.rest = limit.count
      limit.ttl = Date.now() + limit.period
    }

    return limit
  }

  static refreshTtl (limit: ILimit): void {
    limit.ttl = Date.now() + limit.period
  }
}
