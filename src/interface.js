// @flow

export type IAny = any
export type IBasicDelay = number
export type IComplexDelay = {
  period: number,
  count: number
}
export type IMixedDelays = Array<IBasicDelay | IComplexDelay>
export type INormalizedDelays = Array<IComplexDelay>
export type IDelay = number
export type ITarget = (...args: IAny[]) => IAny
export type ILimit = {
  period: number,
  count: number,
  ttl: number,
  rest: number,
  timeout?: TimeoutID
}
export type ILimitStack = Array<ILimit>

export type ICall = {
  fail: () => void,
  complete: () => void
}
export type ICallStack = Array<ICall>

export type IResolve = (value: IAny) => void
export type IReject = (value: IAny) => void

export type IControlled = {
  (...args: IAny[]): Promise<IAny>,
  flush(): void,
  cancel(): void
}
export type ILodashOpts = {
  leading?: boolean,
  trailing?: boolean,
  maxWait?: number
}

export type IWrapperOpts = {
  delay: IDelay,
  limit?: ILimit | ILimitStack,
  context?: IAny,
  rejectOnCancel?: boolean,
} & ILodashOpts

export type IWrapper = (fn: ITarget, opts: IWrapperOpts) => IControlled
export type IExposedWrapper = {
  (fn: ITarget, opts: IWrapperOpts): IControlled,
  (fn: ITarget, delay: IDelay, opts?: ILodashOpts): IControlled,
  (fn: ITarget, limit: ILimitStack | ILimit, opts?: ILodashOpts): IControlled,
}

export interface ILimiter {
  limits: ILimitStack,
  constructor(delays: INormalizedDelays): ILimiter,
  getNextDelay(): number,
  reset(): void,
  decrease(): void,
  isAllowed(): boolean
}
