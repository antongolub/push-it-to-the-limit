// @flow

import type {IAny, IDelay, ILodashOpts, IResolve, ITarget, IWrapper, IControlled, IWrapperOpts} from './interface'

export function complete (resolve: IResolve, fn: ITarget, args: IAny[], context?: IAny): void {
  resolve(fn.call(context, ...args))
}

// Lodash compatibility wrapper
export function adapter (wrapper: Function): IWrapper {
  return (fn: ITarget, delay: IDelay | IWrapperOpts, opts?: ILodashOpts): IControlled => {
    if (typeof delay === 'number') {
      return wrapper(fn, {...opts, delay})
    }

    return wrapper(fn, delay)
  }
}
