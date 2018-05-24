// @flow

import type {IAny, ITarget} from './interface'
import {assertFn} from './common'

export default function throttle (fn: ITarget, delay: number, context?: IAny) {
  assertFn(fn)

  let ready: boolean = true
  let lastResult: IAny

  return (...args: IAny[]): IAny => {
    if (ready) {
      setTimeout(() => { ready = true })
      lastResult = fn.call(context, ...args)
      ready = false
    }

    return lastResult
  }
}
