import type {
  ITarget,
  IControlled,
  IExposedWrapper,
  IWrapperOpts
} from '../interface'
import { adapter } from '../common'
import { debounce } from './debounce'

export const delay: IExposedWrapper = adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const delay = typeof opts.delay === 'number'
    ? { period: opts.delay, count: Infinity }
    : opts.delay

  const maxWait = typeof opts.delay === 'number'
    ? opts.delay
    : undefined

  return debounce(fn, { maxWait, ...opts, delay, order: 'fifo' })
})
