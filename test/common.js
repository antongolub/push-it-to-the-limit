import {assert, assertFn} from '../src/common'

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
