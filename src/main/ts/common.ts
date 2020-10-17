import type {
  IAny,
  IBasicDelay,
  IComplexDelay,
  IControlled,
  IDelay,
  IExposedWrapper,
  ILimit,
  ILimitStack,
  ILodashOpts,
  IMixedDelays,
  INormalizedDelays,
  IReject,
  IResolve,
  ITarget,
  IWrapper,
  IWrapperOpts,
  Optional,
  TimeoutID} from './interface'

export function complete (resolve: IResolve, fn: ITarget, args: IAny[], context?: IAny): void {
  resolve(fn.call(context, ...args))
}

export const REJECTED = 'Rejected'
export function fail (reject: IReject, message: string = REJECTED): void {
  reject(new Error(message))
}

export const REJECTED_ON_CANCEL = 'Rejected on cancel'
export function failOnCancel (reject: IReject): void {
  fail(reject, REJECTED_ON_CANCEL)
}

export const DEFAULT_DELAY = 0

const normalizeOpts = (opts: ILodashOpts = {}): IWrapperOpts => ({
  delay: DEFAULT_DELAY,
  ...opts
})

// Lodash compatibility wrapper
export function adapter (wrapper: IWrapper): IExposedWrapper {
  return (fn: ITarget, value?: IDelay | IComplexDelay | ILimit | ILimitStack | IWrapperOpts, lodashOpts?: ILodashOpts): IControlled => {
    assertFn(fn)

    let opts: IWrapperOpts = normalizeOpts(lodashOpts)

    if (typeof value === 'number') {
      opts = { ...opts, delay: value }
    } else if (Array.isArray(value)) {
      opts = { ...opts, limit: value }
    } else if (typeof value === 'object') {
      opts = typeof (value as any).period === 'number' && typeof (value as any).count === 'number'
        ? { ...opts, delay: value as IWrapperOpts['delay'] }
        : { ...opts, ...value }
    }

    return wrapper(fn, opts)
  }
}

export function assert (condition: boolean, text = 'Assertion error'): void {
  if (!condition) {
    throw new Error(text)
  }
}

export function assertFn (target: IAny): void {
  assert(typeof target === 'function', 'Target must be a function')
}

export function dropTimeout (timeout: Optional<TimeoutID>): void {
  if (timeout) {
    clearTimeout(timeout)
  }
}

export function normalizeDelay (delay?: IBasicDelay | IComplexDelay | IMixedDelays | INormalizedDelays| ILimit | ILimitStack): INormalizedDelays {
  if (delay === undefined) {
    return []
  }

  const res = Array.isArray(delay)? delay : [delay]

  return res
    .map((v): IComplexDelay => typeof v === 'number'
      ? { period: v, count: 1 }
      : v
    )
}
