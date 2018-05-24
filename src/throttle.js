// @flow

import type {IAny, ITarget, IControlled, IWrapper, IWrapperOpts} from './interface'
import {adapter, assertFn} from './common'

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  assertFn(fn)

  const { delay, context } = opts
  let ready: boolean = true
  let lastResult: IAny

  const res = (...args: IAny[]): IAny => {
    if (ready) {
      setTimeout(() => { ready = true }, delay)
      lastResult = fn.call(context, ...args)
      ready = false
    }

    return lastResult
  }

  res.flush = () => {}
  res.cancel = () => {}

  return res
}): IWrapper)
