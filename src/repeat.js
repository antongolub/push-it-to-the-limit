// @flow
import repeater from '@antongolub/repeater'
import {adapter, dropTimeout} from './common'
import type {IControlled, IExposedWrapper, ITarget, IWrapperOpts} from './interface'

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const res = repeater({target: fn, ...opts})

  res.cancel = () => {
    dropTimeout(res.timeout)
  }

  res.flush = () => {
    fn.call(res.context, res.args)
    res.cancel()
  }

  return res
}): IExposedWrapper)
