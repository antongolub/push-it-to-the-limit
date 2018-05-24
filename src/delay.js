// @flow

import type {IAny, ITarget, IControlled, IResolve, IWrapper, IWrapperOpts, IReject} from './interface'
import {complete, failOnCancel, adapter} from './common'

// TODO refactor
export type ICall = {
  fail: Function,
  complete: Function
}

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const { delay, context, rejectOnCancel } = opts
  const calls: ICall[] = []
  const timeouts: TimeoutID[] = []
  const res = (...args: IAny[]): Promise<IAny> => new Promise((resolve: IResolve, reject: IReject) => {
    calls.push({
      complete: complete.bind(null, resolve, fn, args, context),
      fail: failOnCancel.bind(null, reject)
    })
    timeouts.push(setTimeout(() => calls.shift().complete(), delay))
  })

  res.flush = () => {
    calls.forEach(call => call.complete())
    res.cancel()
  }

  res.cancel = () => {
    timeouts.forEach(clearTimeout)
    if (rejectOnCancel) {
      calls.forEach(call => call.fail())
    }
    calls.length = 0
    timeouts.length = 0
  }

  return res
}): IWrapper)
