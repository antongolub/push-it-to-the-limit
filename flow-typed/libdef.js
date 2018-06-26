declare module 'push-it-to-the-limit' {
  declare type IAny = any
  declare type IBasicDelay = number
  declare type IComplexDelay = {
    period: number,
    count: number
  }
  declare type ITarget = (...args: IAny[]) => IAny
  declare type ILimit = IComplexDelay & {
    ttl: number,
    rest: number,
    timeout?: TimeoutID
  }
  declare type ILimitStack = Array<ILimit>
  declare type IControlled = {
    (...args: IAny[]): Promise<IAny>,
    flush(): void,
    cancel(): void
  }
  declare type ILodashOpts = {
    leading?: boolean,
    trailing?: boolean,
    maxWait?: IBasicDelay
  }
  declare type IOrder = 'fifo' | 'lifo'
  declare type IWrapperOpts = {
    delay: IBasicDelay | IComplexDelay,
    limit?: ILimit | ILimitStack,
    context?: IAny,
    rejectOnCancel?: boolean,
    order?: IOrder
  } & ILodashOpts
  declare type IExposedWrapper = {
    (fn: ITarget, opts: IWrapperOpts): IControlled,
    (fn: ITarget, delay: IBasicDelay, opts?: ILodashOpts): IControlled,
    (fn: ITarget, delay: IComplexDelay, opts?: ILodashOpts): IControlled,
    (fn: ITarget, limit: ILimitStack | ILimit, opts?: ILodashOpts): IControlled,
  }
  
  declare module.exports: {
    delay: IExposedWrapper,
    throttle: IExposedWrapper,
    debounce: IExposedWrapper,
    ratelimit: IExposedWrapper,
    stabilize: IExposedWrapper,
    repeat: IExposedWrapper,

    REJECTED: string,
    REJECTED_ON_CANCEL: string,
    DEFAULT_DELAY: string
  }
}
