// @flow

import type {IAny, ITarget, IControlled, IResolve, IWrapper, IWrapperOpts} from './interface'
import {assertFn} from './assert'
import {complete, adapter} from './common'

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  assertFn(fn)

  const { delay, context } = opts
  let timeout: TimeoutID
  let _resolve: IResolve
  let _args: IAny[]

  const res = (...args: IAny[]): Promise<IAny> => new Promise(resolve => {
    _resolve = resolve
    _args = args
    timeout = setTimeout(res.flush, delay)
  })

  res.flush = () => complete(_resolve, fn, _args, context)
  res.cancel = () => clearTimeout(timeout)

  return res
}): IWrapper)
