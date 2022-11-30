import { adapter } from '../common'
import type {
  IControlled,
  IExposedWrapper,
  ITarget,
  IWrapperOpts
} from '../interface'
import { debounce } from './debounce'

export const delay: IExposedWrapper = adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const delay = typeof opts.delay === 'number'
    ? { period: opts.delay, count: Number.POSITIVE_INFINITY }
    : opts.delay

  const maxWait = typeof opts.delay === 'number'
    ? opts.delay
    : undefined

  return debounce(fn, { maxWait, ...opts, delay, order: 'fifo' })
})
