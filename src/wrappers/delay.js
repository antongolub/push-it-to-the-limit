// @flow

import type {
  IAny,
  ITarget,
  IControlled,
  IResolve,
  IReject,
  IExposedWrapper,
  IWrapperOpts,
  ICall
} from '../interface'
import {complete, failOnCancel, adapter, dropTimeout} from '../common'

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
    timeouts.forEach(dropTimeout)
    if (rejectOnCancel) {
      calls.forEach(call => call.fail())
    }
    calls.length = 0
    timeouts.length = 0
  }

  return res
}): IExposedWrapper)
