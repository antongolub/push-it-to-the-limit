// @flow

import type {IAny, ITarget} from './interface'
import {assertFn} from './assert'

export default function delay (fn: ITarget, delay: number, context?: IAny): Function {
  assertFn(fn)

  return (...args: IAny[]): Promise<IAny> => new Promise(resolve => {
    setTimeout(() => {
      resolve(fn.call(context, ...args))
    }, delay)
  })
}
