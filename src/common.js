// @flow

import type {
  IAny,
  IDelay,
  ILodashOpts,
  IResolve,
  IReject,
  ITarget,
  IWrapper,
  IControlled,
  IWrapperOpts,
  IExposedWrapper,
  ILimit,
  ILimitStack,
  IBasicDelay,
  IComplexDelay,
  IMixedDelays,
  INormalizedDelays
} from './interface'

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
// Lodash compatibility wrapper
export function adapter (wrapper: IWrapper): IExposedWrapper {
  return (fn: ITarget, value?: IDelay | ILimit | ILimitStack | IWrapperOpts, lodashOpts?: ILodashOpts): IControlled => {
    assertFn(fn)

    let opts: IWrapperOpts = {delay: DEFAULT_DELAY, ...lodashOpts}

    if (typeof value === 'number') {
      opts = {...lodashOpts, delay: value}
    } else if (Array.isArray(value) || (typeof value === 'object' && typeof value.period === 'number' && typeof value.count === 'number')) {
      opts = {delay: DEFAULT_DELAY, ...lodashOpts, limit: value}
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      opts = {delay: DEFAULT_DELAY, ...lodashOpts, ...value}
    }

    return wrapper(fn, opts)
  }
}

export function assert (condition: boolean, text?: string = 'Assertion error'): void {
  if (!condition) {
    throw new Error(text)
  }
}

export function assertFn (target: IAny): void {
  assert(typeof target === 'function', 'Target must be a function')
}

export function dropTimeout (timeout?: ?TimeoutID): void {
  if (timeout) {
    clearTimeout(timeout)
  }
}

export function noop (): void {}

export function normalizeDelay (delay?: IBasicDelay | IComplexDelay | IMixedDelays | INormalizedDelays| ILimit | ILimitStack): INormalizedDelays {
  if (delay === undefined) {
    return []
  }

  return [].concat(delay)
    .map((v): IComplexDelay => typeof v === 'number'
      ? {period: v, count: 1}
      : v
    )
}
