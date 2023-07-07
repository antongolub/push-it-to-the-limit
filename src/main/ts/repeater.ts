export type IAny = any

export type IHandler = (...args: any) => any
export type ILimit = number

export type IOpts = {
  target: IHandler,
  delay: number,
  context?: IAny,
  limit?: ILimit
}

export type TimeoutID = number // NodeJS.Timeout

export type ITarget = IHandler | IOpts

export type IRepeater = {
  (...args: any): any;
  target: IHandler,
  timeout?: TimeoutID,
  limit?: ILimit,
  delay?: number,
  args?: Array<IAny>,
  context?: IAny
}

export type IWrapper = {
  (fn:ITarget): IRepeater
}

/**
 * Creates a new repeater.
 * @param {Function} target
 * @param {number} delay
 * @param {*} [context]
 * @param {number} [limit]
 * @return {IRepeater}
 * @property {Function/IOpts} target
 * @property {number} delay
 * @property {*} context
 * @property {Array<*>} [args] arguments of the last invocation
 * @property {number} [timeout] TimeoutID
 */
export function createRepeater (target: ITarget, delay: number, context?: IAny, limit?: ILimit): IRepeater {
  if (typeof target === 'object') {
    const { target: _target, delay, context, limit }: IOpts = target

    return createRepeater(_target, delay, context, limit)
  }

  assert(target, delay)

  const repeater: IRepeater = (...args: any[]): IAny => {
    const { timeout, target, limit, context } = repeater
    const nextLimit = getNextLimit(limit)

    clearTimeout(timeout)

    if (nextLimit === undefined || nextLimit > 0) {
      repeater.limit = nextLimit
      repeater.args = args
      repeater.timeout = setTimeout(repeater.bind(repeater, ...args), delay) as unknown as number
    }

    return target.call(context, ...args)
  }

  repeater.target = target
  repeater.delay = delay
  repeater.limit = limit
  repeater.context = context

  return repeater as IRepeater
}

function assert (target: ITarget, delay: number): void {
  if (typeof target !== 'function') {
    throw new TypeError('repeater: target must be callable')
  }

  if (!delay) {
    throw new TypeError('repeater: delay must not be empty')
  }
}

function getNextLimit (limit?: number): number | undefined {
  return typeof limit === 'number'
    ? limit - 1
    : undefined
}
