import type { IControlled, IExposedWrapper, ITarget, IWrapperOpts } from '../interface'
import { adapter } from '../common'
import debounce from './debounce'

const stabilize: IExposedWrapper = adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const maxWait = typeof opts.delay === 'number'
    ? opts.delay
    : undefined

  return debounce(fn, { maxWait, ...opts })
})

export default stabilize
