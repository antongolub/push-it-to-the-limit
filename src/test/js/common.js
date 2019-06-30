import {
  assert,
  assertFn,
  complete,
  fail,
  failOnCancel,
  REJECTED_ON_CANCEL,
  REJECTED,
  DEFAULT_DELAY,
  adapter,
  normalizeDelay
} from '../../main/js/common'

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
    expect(assertFn(() => {})).toBeUndefined()
    expect(() => assertFn({})).toThrow('Target must be a function')
  })
})

describe('complete', () => {
  it('resolves a promise with target fn invocation result', done => {
    const foo = 'foo'
    const fn = v => v
    const p = new Promise(resolve => complete(resolve, fn, [foo]))

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
  const fn = v => v
  const wrapper = jest.fn((target, opts) => null)
  const adapted = adapter(wrapper)

  afterEach(wrapper.mockClear)

  const cases = [
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

  cases.map(([description, args, expected]) => {
    it(description, () => {
      adapted(...args)
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
