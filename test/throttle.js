import {throttle} from '../src'

describe('throttle', () => {
  it('wrapper returns function', () => {
    expect(throttle(() => {})).toEqual(expect.any(Function))
  })

  it('throws error on invalid input', () => {
    expect(() => throttle({})).toThrow('Target must be a function')
  })

  it('returns first result for all invokes in period', done => {
    const fn = v => v
    const throttled = throttle(fn, 10)

    expect(throttled(1)).toBe(1)
    expect(throttled(2)).toBe(1)

    setTimeout(() => {
      expect(throttled(2)).toBe(2)
      done()
    }, 10)
  })
})
