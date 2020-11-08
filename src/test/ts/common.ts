import {ICallable} from '@qiwi/substrate'

import {
  adapter,
  assert,
  assertFn,
  complete,
  DEFAULT_DELAY,
  fail,
  failOnCancel,
  normalizeDelay,
  REJECTED,
  REJECTED_ON_CANCEL
} from '../../main/ts/common'

const noop = () => { /* noop */ }
const echo = <T>(v: T): T => v

describe('assert', () => {
  it('does nothing if condition looks truthy', () => {
    expect(assert(true)).toBeUndefined()
  })

  it('throws exception if condition is broken', () => {
    expect(() => assert(false)).toThrow('Assertion error')
  })

  it('supports custom message', () => {
    expect(() => assert(false, 'foo')).toThrow('foo')
  })
})

describe('assertFn', () => {
  it('requires target to be a function', () => {
    expect(assertFn(noop)).toBeUndefined()
    expect(() => assertFn({})).toThrow('Target must be a function')
  })
})

describe('complete', () => {
  it('resolves a promise with target fn invocation result', done => {
    const foo = 'foo'
    const p = new Promise(resolve => complete(resolve, echo, [foo]))

    p.then(v => {
      expect(v).toBe(foo)
      done()
    })
  })
})

describe('fail', () => {
  it('constructs an error and invokes `reject`', done => {
    const p = new Promise((resolve, reject) => fail(reject, 'foo'))

    p.catch(e => {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('foo')

      done()
    })
  })

  it('passes default message to `reject` if no opt is specified', done => {
    const p = new Promise((resolve, reject) => fail(reject))

    p.catch(e => {
      expect(e.message).toBe(REJECTED)
      done()
    })
  })
})

describe('failOnCancel', () => {
  it('rejects with `REJECTED_ON_CANCEL`', done => {
    const p = new Promise((resolve, reject) => failOnCancel(reject))

    p.catch(e => {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe(REJECTED_ON_CANCEL)

      done()
    })
  })
})

describe('adapter', () => {
  const fn = echo
  const wrapper = jest.fn(noop)
  const adapted = adapter(wrapper as any)

  afterEach(wrapper.mockClear)

  const cases: Array<[string, [ICallable, ...any[]], any]> = [
    [
      'converts <ITarget> to <ITarget, IWrapperOpts>',
      [fn],
      [fn, { delay: DEFAULT_DELAY }]
    ],
    [
      'converts <ITarget, IDelay> to <ITarget, IWrapperOpts>',
      [fn, 1],
      [fn, { delay: 1 }]
    ],
    [
      'converts <ITarget, IDelay, ILodashOpts> to <ITarget, IWrapperOpts>',
      [fn, 1, { foo: 'bar' }],
      [fn, { delay: 1, foo: 'bar' }]
    ],
    [
      'converts <ITarget, IWrapperOpts, ILodashOpts> to <ITarget, IWrapperOpts>',
      [fn, { delay: 2 }, { baz: 'qux' }],
      [fn, { delay: 2, baz: 'qux' }]
    ],
    [
      'converts <ITarget, emptyObject, ILodashOpts> to <ITarget, IWrapperOpts>',
      [fn, {}, { baz: 'qux' }],
      [fn, { delay: DEFAULT_DELAY, baz: 'qux' }]
    ]
  ]

  cases.forEach(([description, args, expected]) => {
    it(description, () => {
      adapted(...args as Parameters<typeof adapted>)
      expect(wrapper).toHaveBeenCalledWith(...expected)
    })
  })
})

describe('normalizeDelay', () => {
  const cases = [
    [undefined, []],
    [100, [{ period: 100, count: 1 }]],
    [[{ period: 100, count: 10 }], [{ period: 100, count: 10 }]],
    [[200, { period: 100, count: 10 }], [{ period: 200, count: 1 }, { period: 100, count: 10 }]]
  ]

  cases.forEach(([input, output]) => {
    it(input + ' > ' + output, () => {
      expect(normalizeDelay(input)).toEqual(output)
    })
  })
})
