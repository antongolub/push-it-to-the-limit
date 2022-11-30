import createRepeater from '@antongolub/repeater'

import { adapter, dropTimeout } from '../common'
import type { IControlled, IExposedWrapper, ITarget, IWrapperOpts } from '../interface'

export const repeat: IExposedWrapper = adapter((fn: ITarget, opts: IWrapperOpts): IControlled => {
  const repeaterOpts = {
    ...opts,
    target: fn,
    delay: typeof opts.delay === 'number' ? opts.delay : opts.delay.period,
    limit: Array.isArray(opts.limit) ? opts.limit[0].period : opts.limit?.period
  }
  // @ts-ignore
  const repeater = (createRepeater?.default || createRepeater)(repeaterOpts) as any
  repeater.cancel = () => {
    dropTimeout(repeater.timeout)
  }
  repeater.flush = () => {
    fn.call(repeater.context, repeater.args)
    dropTimeout(repeater.timeout)
  }

  return repeater
})
