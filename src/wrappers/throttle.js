// @flow

import type {ITarget, IControlled, IExposedWrapper, IWrapperOpts} from '../interface'
import {adapter} from '../common'
import debounce from './debounce'

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const maxWait = typeof opts.delay === 'number'
    ? opts.delay
    : undefined

  return debounce(fn, {leading: true, maxWait, ...opts})
}): IExposedWrapper)
