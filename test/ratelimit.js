import {ratelimit} from '../src'

describe('ratelimit', () => {
  it('wrapper returns function', () => {
    expect(ratelimit(() => {})).toEqual(expect.any(Function))
  })

  it('throws error on invalid input', () => {
    expect(() => ratelimit({})).toThrow('Target must be a function')
  })

  it('delays overlimit calls', done => {
    const period = 50
    const count = 2
    const start = Date.now()
    const fn = ratelimit(x => {
      const diff = Date.now() - start
      const expected = Math.round(((x || 1) - 1) / count) * period

      expect(diff >= expected && diff <= expected + 15 + 2 * x).toBeTruthy()
      if (x === 9) {
        done()
      }
    }, {period, count})

    for (let y = 0; y < 10; y++) {
      fn(y)
    }
  })

  it('properly proceeds interrelated limits', done => {
    const limit = [{period: 20, count: 1}, {period: 200, count: 5}]
    const start = Date.now()
    const fn = ratelimit(x => {
      const diff = Date.now() - start
      const expected = x > 4
        ? 200 + (x - 5) * 20
        : x * 20

      expect(diff >= expected && diff <= expected + 5 * (x + 1)).toBeTruthy()
      if (x === 9) {
        done()
      }

      return x
    }, limit)

    for (let y = 0; y < 10; y++) {
      fn(y)
    }
  })
})
