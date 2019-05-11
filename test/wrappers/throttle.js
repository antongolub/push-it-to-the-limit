import { throttle } from '../../src'

describe('throttle', () => {
  it('wrapper returns function', () => {
    expect(throttle(() => {}, 10)).toEqual(expect.any(Function))
  })

  it('throws error on invalid input', () => {
    expect(() => throttle({})).toThrow('Target must be a function')
  })

  it('returns first result for all invokes in period', done => {
    const fn = jest.fn(v => v)
    const throttled = throttle(fn, { period: 10, count: 1 })

    throttled(1).then(v => expect(v).toBe(1))
    throttled(2).then(v => expect(v).toBe(3))
    throttled(3).then(v => expect(v).toBe(3))

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenCalledWith(1)
      expect(fn).toHaveBeenCalledWith(3)
      done()
    }, 10)
  })
})
