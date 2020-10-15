declare module '@antongolub/repeater' {
  export type IAny = any

  export type IHandler = (...args: any) => any
  export type ILimit = number

  export type IOpts = {
    target: IHandler,
    delay: number,
    context?: IAny,
    limit?: ILimit
  }

  export type ITarget = IHandler | IOpts

  export type IRepeater = {
    (...args: any): Promise<any>;
    target: IHandler,
    timeout: number,
    limit?: ILimit,
    delay?: number,
    args?: Array<IAny>,
    context?: IAny
  }

  export type ILibrary = (target: ITarget, delay?: number, context?: IAny, limit?: ILimit) => IRepeater

  export const repeat: ILibrary

  export default repeat
}
