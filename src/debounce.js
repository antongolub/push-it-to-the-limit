// @flow

import type {IAny, ITarget, IControlled, IResolve, IReject, IExposedWrapper, IWrapperOpts} from './interface'
import {complete, failOnCancel, adapter, dropTimeout, noop} from './common'

// TODO refactor
export type ICall = {
  fail: () => void,
  complete: () => void
}

export const DEFAULT_OPTS = {
  leading: false,
  trailing: true
}

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const { delay, context, rejectOnCancel, maxWait, leading } = ({...DEFAULT_OPTS, ...opts}: IWrapperOpts)

  let call: ?ICall
  let timeout: ?TimeoutID
  let maxTimeout: ?TimeoutID
  let promise: ?Promise<IAny>
  let _args: IAny

  const res = (...args: IAny[]): Promise<IAny> => {
    _args = args

    if (!promise) {
      promise = new Promise((resolve: IResolve, reject: IReject) => {
        call = {
          complete: () => complete(resolve, fn, _args, context),
          fail: failOnCancel.bind(null, reject)
        }
      })
    }

    // NOTE `leading` option has priority
    if (!timeout && leading && call) {
      const _p = promise

      call.complete()
      call = null
      promise = null
      timeout = setTimeout(noop, delay)

      return _p
    }

    dropTimeout(timeout)

    timeout = setTimeout(res.flush, delay)
    if (maxWait && !maxTimeout) {
      maxTimeout = setTimeout(res.flush, maxWait)
    }

    return promise
  }

  res.flush = () => {
    if (call) {
      call.complete()
      call = null
    }

    res.cancel()
  }

  res.cancel = () => {
    timeout && clearTimeout(timeout)
    maxTimeout && clearTimeout(maxTimeout)

    promise = null
    timeout = null
    maxTimeout = null
    _args = null

    if (rejectOnCancel && call) {
      call.fail()
    }

    call = null
  }

  return res
}): IExposedWrapper)
