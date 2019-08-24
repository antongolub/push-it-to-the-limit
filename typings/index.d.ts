declare module 'push-it-to-the-limit' {
  type IAny = any
  type IBasicDelay = number
  type IComplexDelay = {
    period: number,
    count: number
  }
  type ITarget = (...args: IAny[]) => IAny
  type ILimit = IComplexDelay & {
    ttl: number,
    rest: number,
    timeout?: ReturnType<typeof setTimeout>
  }
  type ILimitStack = Array<ILimit>
  type IControlled = {
    (...args: IAny[]): Promise<IAny>,
    flush(): void,
    cancel(): void
  }
  type ILodashOpts = {
    leading?: boolean,
    trailing?: boolean,
    maxWait?: IBasicDelay
  }
  type IOrder = 'fifo' | 'lifo'
  type IWrapperOpts = {
    delay: IBasicDelay | IComplexDelay,
    limit?: ILimit | ILimitStack,
    context?: IAny,
    rejectOnCancel?: boolean,
    order?: IOrder
  } & ILodashOpts
  type IExposedWrapper = {
    (fn: ITarget, opts: IWrapperOpts): IControlled,
    (fn: ITarget, delay: IBasicDelay, opts?: ILodashOpts): IControlled,
    (fn: ITarget, delay: IComplexDelay, opts?: ILodashOpts): IControlled,
    (fn: ITarget, limit: ILimitStack | ILimit, opts?: ILodashOpts): IControlled,
  }

  export const delay: IExposedWrapper
  export const throttle: IExposedWrapper
  export const debounce: IExposedWrapper
  export const ratelimit: IExposedWrapper
  export const stabilize: IExposedWrapper
  export const repeat: IExposedWrapper

  export const REJECTED: string
  export const REJECTED_ON_CANCEL: string
  export const DEFAULT_DELAY: number
}
