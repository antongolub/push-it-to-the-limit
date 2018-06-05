// @flow

import type {
  IAny,
  ITarget,
  ICallStack,
  IControlled,
  IExposedWrapper,
  IWrapperOpts, ILimiter, INormalizedDelays
} from '../interface'
import {complete, failOnCancel, dropTimeout, adapter, normalizeDelay} from '../common'
import Limiter from '../limiter'

export type IProcessor = (calls: ICallStack, limiter: ILimiter) => void

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  let timeout: ?TimeoutID = null
  const {delay, limit, context, rejectOnCancel} = opts
  const delays: INormalizedDelays = normalizeDelay(limit || delay)
  const limiter = new Limiter(delays)
  const calls: ICallStack = []
  const processCalls: IProcessor = (calls: ICallStack, limiter: ILimiter): void => {
    dropTimeout(timeout)
    limiter.reset()
    invokeToTheLimit(calls, limiter)

    timeout = processTimeouts(calls, limiter, processCalls)
  }

  const res = (...args: IAny[]): Promise<IAny> => new Promise((resolve, reject) => {
    calls.push({
      complete: complete.bind(null, resolve, fn, args, context),
      fail: failOnCancel.bind(null, reject)
    })
    processCalls(calls, limiter)
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

export function invokeToTheLimit (calls: ICallStack, limiter: ILimiter): void {
  while (calls.length > 0 && limiter.isAllowed()) {
    limiter.decrease()

    calls.shift().complete()
  }
}

export function refreshTimeouts (calls: ICallStack, limiter: ILimiter, handler: IProcessor): TimeoutID {
  return setTimeout(() => handler(calls, limiter), limiter.getNextDelay())
}

export function processTimeouts (calls: ICallStack, limiter: ILimiter, handler: IProcessor): TimeoutID | null {
  if (calls.length > 0) {
    return refreshTimeouts(calls, limiter, handler)
  }

  return null
}
