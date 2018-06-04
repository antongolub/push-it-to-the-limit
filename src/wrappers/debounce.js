// @flow

import type {
  IAny,
  ITarget,
  IControlled,
  IResolve,
  IReject,
  IExposedWrapper,
  IWrapperOpts,
  ICallStack
} from '../interface'
import {complete, failOnCancel, adapter, dropTimeout, normalizeDelay} from '../common'
import Limiter from '../limiter'

export const DEFAULT_OPTS = {
  leading: false,
  trailing: true
}

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const { delay, limit, context, rejectOnCancel, maxWait, leading } = ({...DEFAULT_OPTS, ...opts}: IWrapperOpts)
  const limiter = new Limiter(normalizeDelay(limit || delay))
  const calls: ICallStack = []
  const args = []

  let timeout: ?TimeoutID
  let maxTimeout: ?TimeoutID
  let promise: Promise<IAny> | null
  let queueLimit: number | null = null

  const res = (..._args: IAny[]): Promise<IAny> => {
    if (queueLimit === null) {
      queueLimit = limiter.getNextQueueSize()
    }
    // NOTE `leading` option has priority
    let shouldRun = leading && queueLimit > 0

    if (queueLimit > 0 || promise === null) {
      promise = new Promise((resolve: IResolve, reject: IReject) => {
        calls.push({
          complete: () => complete(resolve, fn, args.pop(), context),
          fail: failOnCancel.bind(null, reject)
        })
      })

      limiter.decrease()
      queueLimit += -1
    }

    args.push(_args)
    limiter.resetTtl()
    const nextDelay = limiter.getNextDelay()
    if (shouldRun) {
      const _p = promise
      timeout = setTimeout(res.flush, nextDelay)
      promise = null

      calls.forEach(call => call.complete())
      calls.length = 0

      return _p
    }

    dropTimeout(timeout)
    timeout = setTimeout(res.flush, nextDelay)

    if (maxWait && !maxTimeout) {
      maxTimeout = setTimeout(res.flush, maxWait)
    }

    return promise
  }

  res.flush = () => {
    limiter.reset()
    promise = null
    queueLimit = null
    calls.forEach(call => call.complete())
    calls.length = 0

    res.cancel()
  }

  res.cancel = () => {
    dropTimeout(timeout)
    dropTimeout(maxTimeout)

    queueLimit = null
    promise = null
    timeout = null
    maxTimeout = null
    args.length = 0

    if (rejectOnCancel) {
      calls.forEach(call => call.fail)
    }
    calls.length = 0
  }

  return res
}): IExposedWrapper)
