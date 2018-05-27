import {assert, assertFn, complete, fail, failOnCancel, REJECTED_ON_CANCEL} from '../src/common'

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
