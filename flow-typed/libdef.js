declare module 'push-it-to-the-limit' {
  declare type IAny = any
  declare type ITarget = Function
  declare type IDelay = number
  declare type ILimit = {
    period: number,
    count: number,
    ttl: number,
    rest: number,
    timeout: TimeoutID
  }
  declare type ILimitStack = Array<ILimit>
  declare type IHandler = (...args: any) => any
  declare type IOpts = {
    target: IHandler,
    delay: number,
    context?: ?IAny,
    limit?: ?number
  }
  declare type IRepeater = {
    (...args: any): any;
    target: IHandler,
    timeout: TimeoutID,
    limit?: ?number,
    delay?: ?number,
    args?: ?Array<IAny>,
    context?: ?IAny
  }

  declare module.exports: {
    delay (fn: ITarget, delay: IDelay, context?: IAny): Function,
    throttle (fn: ITarget, delay: IDelay, context?: IAny): Function,
    debounce (fn: ITarget, delay: IDelay, context?: IAny): Function,
    ratelimit (fn: ITarget, limit: ILimit | ILimitStack, context?: IAny): Function,
    stabilize (fn: ITarget, delay: IDelay, context?: IAny): Function,
    repeat (target: IHandler | IOpts, delay: IDelay, context: ?IAny, limit?: ?number): IRepeater
  }
}
