// @flow

import type {
  ITarget,
  IControlled,
  IExposedWrapper,
  IWrapperOpts
} from '../interface'
import {adapter} from '../common'
import debounce from './debounce'

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const delay = typeof opts.delay === 'number'
    ? {period: opts.delay, count: 10000}
    : opts.delay

  const maxWait = typeof opts.delay === 'number'
    ? opts.delay
    : undefined

  return debounce(fn, {maxWait, ...opts, delay, order: 'fifo'})
}): IExposedWrapper)
