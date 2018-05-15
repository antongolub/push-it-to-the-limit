// @flow

export type IAny = any
export type ITarget = Function
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
