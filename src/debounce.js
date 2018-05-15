// @flow

import type {IAny, ITarget} from './interface'
import {assertFn} from './assert'

export default function debounce (fn: ITarget, delay: number, context?: IAny): Function {
  assertFn(fn)

  let timeout: TimeoutID
  let promise: Promise<IAny>
  let _resolve: Function

  return (...args: IAny[]): Promise<IAny> => {
    if (timeout) {
      clearTimeout(timeout)
    }

    if (!promise) {
      promise = new Promise(resolve => {
        _resolve = resolve
      })
    }

    timeout = setTimeout(() => _resolve(fn.call(context, ...args)), delay)

    return promise
  }
}
