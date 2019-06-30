// @flow

import type { IControlled, IExposedWrapper, ITarget, IWrapperOpts } from '../interface'
import { adapter } from '../common'
import debounce from './debounce'

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const maxWait = typeof opts.delay === 'number'
    ? opts.delay
    : undefined

  return debounce(fn, { maxWait, ...opts })
}): IExposedWrapper)
