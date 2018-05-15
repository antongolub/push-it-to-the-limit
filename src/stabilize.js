// @flow

import type {IAny, ITarget} from './interface'
import {assertFn} from './assert'

export default function stabilize (fn: ITarget, delay: number, context?: IAny): Function {
  assertFn(fn)

  let timeout: TimeoutID
  let promise: Promise<IAny>
  let lastArgs: IAny[]

  return (...args: IAny[]): Promise<IAny> => {
    lastArgs = args

    if (!promise) {
      promise = new Promise(resolve => {
        timeout = setTimeout(() => {
          promise = null
          resolve(fn.call(context, ...lastArgs))
        }, delay)
      })
    }

    return promise
  }
}
