// @flow

import type {IAny, ITarget, ILimit, ILimitStack, ICallStack} from './interface'
import {assertFn, complete, failOnCancel} from './common'

export default function ratelimit (fn: ITarget, limit: ILimit | ILimitStack, context?: IAny): Function {
  assertFn(fn)

  const limits: ILimitStack = [].concat(limit)
  const calls: ICallStack = []

  return (...args: IAny[]): Promise<IAny> => new Promise((resolve, reject) => {
    calls.push({
      complete: complete.bind(null, resolve, fn, args, context),
      fail: failOnCancel.bind(null, reject)
    })
    processCalls(calls, limits)
  })
}

export function processCalls (calls: ICallStack, limits: ILimitStack): void {
  refreshLimits(limits)
  invokeToTheLimit(calls, limits)
  processTimeouts(calls, limits)
}

export function invokeToTheLimit (calls: ICallStack, limits: ILimitStack): void {
  while (calls.length > 0 && isAllowed(limits)) {
    decreaseLimits(limits)

    calls.shift().complete()
  }
}

export function isAllowed (limits: ILimitStack): boolean {
  return !limits.find(({rest}) => rest < 1)
}

export function decreaseLimits (limits: ILimitStack): void {
  return limits.forEach(limit => {
    limit.rest += -1
  })
}

export function refreshLimit (limit: ILimit): void {
  if (limit.ttl === undefined || limit.ttl < Date.now()) {
    limit.rest = limit.count
    limit.ttl = Date.now() + limit.period
  }
}

export function refreshTimeouts (calls: ICallStack, limits: ILimitStack): TimeoutID {
  const ttl = getReasonableTtl(limits)

  return setTimeout(() => processCalls(calls, limits), ttl - Date.now())
}

export function getReasonableTtl (limits: ILimitStack): number {
  let ttl = 0

  for (let i = 0; i < limits.length; i++) {
    let limit = limits[i]
    if (limit.rest < 1 && limit.ttl > ttl) {
      ttl = limit.ttl
    }
  }

  return ttl
}

export function processTimeouts (calls: ICallStack, limits: ILimitStack): void {
  if (calls.length > 0) {
    refreshTimeouts(calls, limits)
  }
}

export function refreshLimits (limits: ILimitStack): void {
  limits.forEach(refreshLimit)
}
