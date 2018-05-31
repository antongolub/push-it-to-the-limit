// @flow

import type {IControlled, IExposedWrapper, ITarget, IWrapperOpts} from '../interface'
import {adapter} from '../common'
import debounce from './debounce'

export default (adapter((fn: ITarget, opts: IWrapperOpts): IControlled =>
  debounce(fn, {maxWait: opts.delay, ...opts})
): IExposedWrapper)
