import { ratelimit, REJECTED_ON_CANCEL } from '../../../main/js'

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
    }, { period, count })

    for (let y = 0; y < 10; y++) {
      fn(y)
    }
  })

  it('properly proceeds interrelated limits', done => {
    const limit = [{ period: 20, count: 1 }, { period: 200, count: 5 }]
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

  it('`flush` invokes all delayed calls immediately', done => {
    const fn = ratelimit(x => x, { period: 10000000, count: 1 })
    const result = Promise.all([fn('foo'), fn('bar'), fn('baz')])
    result
      .then(([foo, bar, baz]) => {
        expect(foo).toBe('foo')
        expect(bar).toBe('bar')
        expect(baz).toBe('baz')

        done()
      })

    fn.flush()
  })

  it('`cancel` removes ltd calls stack and timers', done => {
    const fn = jest.fn(v => v)
    const ltd = ratelimit(fn, {
      limit: { period: 10, count: 1 },
      rejectOnCancel: false
    })
    const ltdWithReject = ratelimit(fn, {
      limit: { period: 10, count: 1 },
      rejectOnCancel: true
    })
    const resultWithReject = Promise.all([ltdWithReject('foo'), ltdWithReject('bar')])
    const result = Promise.all([ltd('baz'), ltd('qux')])

    resultWithReject
      .then(() => expect(true).toBeFalsy())
      .catch(e => {
        expect(e.message).toBe(REJECTED_ON_CANCEL)
      })
    result
      .then(() => expect(true).toBeFalsy())
      .catch(() => expect(true).toBeFalsy())

    ltd.cancel()
    ltdWithReject.cancel()

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenCalledWith('foo')
      expect(fn).toHaveBeenCalledWith('baz')
      done()
    }, 15)
  })
})
