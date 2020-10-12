// @flow

import type { IComplexDelay, ILimit, ILimiter, ILimitStack, INormalizedDelays } from './interface'

export default class Limiter implements ILimiter {
  limits: ILimitStack

  constructor (delays: INormalizedDelays): ILimiter {
    // $FlowFixMe
    this.limits = delays.map((delay: IComplexDelay): ILimit => ({ ...delay, rest: delay.count, ttl: 0 }))

    return this
  }

  decrease (): void {
    this.limits.forEach(limit => {
      limit.rest += -1
    })
  }

  reset (): void {
    this.limits.forEach(this.constructor.refreshLimit)
  }

  resetTtl (): void {
    this.limits.forEach(this.constructor.refreshTtl)
  }

  isAllowed (): boolean {
    return !this.limits.find(({ rest }) => rest < 1)
  }

  getNextDelay (): number {
    let ttl = 0
    const limits = this.limits

    for (let i = 0; i < limits.length; i++) {
      const limit = limits[i]
      if (limit.rest < 1 && limit.ttl > ttl) {
        ttl = limit.ttl
      }
    }

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
