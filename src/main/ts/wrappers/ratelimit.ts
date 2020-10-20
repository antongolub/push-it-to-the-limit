import { adapter, complete, dropTimeout, failOnCancel, normalizeDelay } from '../common'
import type {
  IAny,
  ICallStack,
  IControlled,
  IExposedWrapper,
  ILimiter,
  ITarget,
  IWrapperOpts,
  TimeoutID
} from '../interface'
import { Limiter } from '../limiter'

export type IProcessor = (calls: ICallStack, limiter: ILimiter) => void

export const ratelimit: IExposedWrapper = adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  let timeout: TimeoutID | undefined
  const { delay, limit, context, rejectOnCancel, limiter } = opts
  const _limiter = limiter || new Limiter(normalizeDelay(limit || delay))
  const calls: ICallStack = []
  const processCalls: IProcessor = (calls: ICallStack, limiter: ILimiter): void => {
    dropTimeout(timeout)
    limiter.reset()
    invokeToTheLimit(calls, limiter)

    timeout = processTimeouts(calls, limiter, processCalls)
  }

  const res = (...args: IAny[]): Promise<IAny> => new Promise((resolve, reject) => {
    calls.push({
      complete: complete.bind(undefined, resolve, fn, args, context),
      fail: failOnCancel.bind(undefined, reject)
    })
    processCalls(calls, _limiter)
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
})

export function invokeToTheLimit (calls: ICallStack, limiter: ILimiter): void {
  while (calls.length > 0 && limiter.isAllowed()) {
    limiter.decrease()

    calls.shift()?.complete()
  }
}

export function refreshTimeouts (calls: ICallStack, limiter: ILimiter, handler: IProcessor): TimeoutID {
  return setTimeout(() => handler(calls, limiter), limiter.getNextDelay())
}

export function processTimeouts (calls: ICallStack, limiter: ILimiter, handler: IProcessor): TimeoutID | undefined {
  return calls.length > 0
    ? refreshTimeouts(calls, limiter, handler)
    : undefined
}
