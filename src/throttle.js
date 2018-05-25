// @flow

import type {ITarget, IControlled, IExposedWrapper, IWrapperOpts} from './interface'
import {adapter} from './common'
import debounce from './debounce'

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled =>
  debounce(fn, {leading: true, maxWait: opts.delay, ...opts})
): IExposedWrapper)
