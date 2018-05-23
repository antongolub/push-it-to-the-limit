// @flow

import type {IAny, ITarget, IControlled, IResolve} from './interface'
import {assertFn} from './assert'
import {complete} from './common'

export default function delay (fn: ITarget, delay: number, context?: IAny): IControlled {
  assertFn(fn)

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
}
