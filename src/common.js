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
  IWrapperOpts
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

// Lodash compatibility wrapper
export function adapter (wrapper: Function): IWrapper {
  return (fn: ITarget, delay: IDelay | IWrapperOpts, opts?: ILodashOpts): IControlled => {
    if (typeof delay === 'number') {
      return wrapper(fn, {...opts, delay})
    }

    return wrapper(fn, delay)
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
