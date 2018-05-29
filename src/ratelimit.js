// @flow

import type {
  IAny,
  ITarget,
  ILimit,
  ILimitStack,
  ICallStack,
  IControlled,
  IExposedWrapper,
  IWrapperOpts
} from './interface'
import {complete, failOnCancel, dropTimeout, adapter} from './common'

export type IProcessor = (calls: ICallStack, limits: ILimitStack) => void

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  let timeout: ?TimeoutID = null
  const {limit, context, rejectOnCancel} = opts
  const limits: ILimitStack = limit ? [].concat(limit) : []
  const calls: ICallStack = []
  const processCalls: IProcessor = (calls: ICallStack, limits: ILimitStack): void => {
    dropTimeout(timeout)
    refreshLimits(limits)
    invokeToTheLimit(calls, limits)

    timeout = processTimeouts(calls, limits, processCalls)
  }

  const res = (...args: IAny[]): Promise<IAny> => new Promise((resolve, reject) => {
    calls.push({
      complete: complete.bind(null, resolve, fn, args, context),
      fail: failOnCancel.bind(null, reject)
    })
    processCalls(calls, limits)
  })

  res.flush = () => {
    calls.forEach(call => call.complete())
    res.cancel()
  }

  res.cancel = () => {
    if (rejectOnCancel) {
      calls.forEach(call => call.fail())
    }
    calls.length = 0
    dropTimeout(timeout)
  }

  return res
}): IExposedWrapper)

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

export function refreshTimeouts (calls: ICallStack, limits: ILimitStack, handler: IProcessor): TimeoutID {
  const ttl = getReasonableTtl(limits)

  return setTimeout(() => handler(calls, limits), ttl - Date.now())
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

export function processTimeouts (calls: ICallStack, limits: ILimitStack, handler: IProcessor): TimeoutID | null {
  if (calls.length > 0) {
    return refreshTimeouts(calls, limits, handler)
  }

  return null
}

export function refreshLimits (limits: ILimitStack): void {
  limits.forEach(refreshLimit)
}
