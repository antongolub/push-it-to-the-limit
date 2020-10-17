import {
  IAny,
  ITarget,
  IControlled,
  IResolve,
  IReject,
  IExposedWrapper,
  IWrapperOpts,
  ICallStack,
  TimeoutID,
  Nullable,
  Optional
} from '../interface'
import { complete, failOnCancel, adapter, dropTimeout, normalizeDelay } from '../common'
import { Limiter } from '../limiter'

export const DEFAULT_OPTS = {
  leading: false,
  trailing: true
}

export const debounce: IExposedWrapper = adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const { delay, limit, context, rejectOnCancel, maxWait, leading, order, limiter: _limiter } = ({ ...DEFAULT_OPTS, ...opts } as IWrapperOpts)
  const limiter = _limiter || new Limiter(normalizeDelay(limit || delay))
  const args: any[] = []
  const calls: ICallStack = []
  const completeCalls = () => {
    calls.forEach(call => call.complete())
    calls.length = 0
  }

  let timeout: Optional<TimeoutID>
  let maxTimeout: Optional<TimeoutID>
  let promise: Nullable<Promise<IAny>>
  let queueLimit: Nullable<number> = null

  const res = (..._args: IAny[]): Promise<IAny> => {
    dropTimeout(timeout)
    args.push(_args)

    if (queueLimit === null) {
      limiter.reset()
      queueLimit = limiter.getNextQueueSize()
    }
    // NOTE `leading` option has priority
    const shouldRun = leading && queueLimit > 0

    if (queueLimit > 0 || promise === null) {
      limiter.decrease()
      queueLimit -= 1
      promise = new Promise((resolve: IResolve, reject: IReject) => {
        calls.push({
          complete: () => complete(resolve, fn, order === 'fifo' ? args.shift() : args.pop(), context),
          fail: failOnCancel.bind(null, reject)
        })
      })
    }

    limiter.resetTtl()
    timeout = setTimeout(res.flush, limiter.getNextDelay())

    if (shouldRun) {
      const _p = promise
      promise = null
      completeCalls()
      return _p
    }

    if (maxWait && !maxTimeout) {
      maxTimeout = setTimeout(res.flush, maxWait)
    }

    return promise
  }

  res.flush = () => {
    limiter.reset()
    promise = null
    queueLimit = null
    completeCalls()

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
      calls.forEach(call => call.fail())
    }
    calls.length = 0
  }

  return res
})
