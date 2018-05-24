// @flow

export type IAny = any
export type IDelay = number
export type ITarget = (...args: IAny[]) => IAny
export type ILimit = {
  period: number,
  count: number,
  ttl: number,
  rest: number,
  timeout: TimeoutID
}
export type ILimitStack = Array<ILimit>

export type ICall = {
  args: IAny[],
  resolve: Function
}
export type ICallStack = Array<ICall>

export type IControlled = {
  (...args: any[]): any,
  flush(): void,
  cancel(): void
}

export type IResolve = (value: IAny) => void
export type IReject = (value: IAny) => void

export type IPromiser = (...args: IAny[]) => Promise<IAny>
export type ILodashOpts = {}
export type IWrapperOpts = {
  delay: IDelay,
  context: IAny,
  rejectOnCancel?: boolean
}
export type IWrapper = {
  (fn: ITarget, opts: IWrapperOpts): IPromiser,
  (fn: ITarget, delay: IDelay): IPromiser
}
