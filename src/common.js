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
  ILimitStack
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
  return (fn: ITarget, value?: IDelay | ILimit | ILimitStack | IWrapperOpts, opts?: ILodashOpts): IControlled => {
    assertFn(fn)

    if (typeof value === 'number') {
      return wrapper(fn, {...opts, delay: value})
    }

    if (value === undefined) {
      return wrapper(fn, {delay: DEFAULT_DELAY})
    }

    if (Array.isArray(value) || (typeof value === 'object' && typeof value.period === 'number' && typeof value.count === 'number')) {
      return wrapper(fn, {delay: DEFAULT_DELAY, ...opts, limit: value})
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      return wrapper(fn, {delay: DEFAULT_DELAY, ...opts, ...value})
    }

    return wrapper(fn, {delay: DEFAULT_DELAY, ...opts})
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
