import {REJECTED_ON_CANCEL, stabilize} from '../../src'

describe('stabilize', () => {
  it('wrapper returns function', () => {
    expect(stabilize(() => {})).toEqual(expect.any(Function))
  })

  it('throws error on invalid input', () => {
    expect(() => stabilize({})).toThrow('Target must be a function')
  })

  it('groups multiple sequential calls in a single one per period', done => {
    const fn = jest.fn(v => v)
    const stable = stabilize(fn, 100)

    for (let y = 0; y < 10; y++) {
      (x => {
        setTimeout(() => {
          // const start = Date.now()
          const expected = x < 6
            ? 5
            : 9

          stable(x)
            .then(v => {
              // console.log('x=', x, 'value=', v, 'delay=', (Date.now() - start))
              expect(v).toBe(expected)
            })
        }, x * 20)
      })(y)
    }

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(2)
      done()
    }, 250)
  })

  it('`flush` invokes target function immediately', done => {
    const fn = jest.fn(v => v)
    const stable = stabilize(fn, {delay: 10000})

    stable('foo').then(v => expect(v).toBe('bar'))
    stable('bar').then(v => expect(v).toBe('bar'))

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('bar')
      expect(fn).toHaveBeenCalledWith('bar')

      done()
    }, 10)

    stable.flush()
    stable.flush()
  })

  it('`cancel` removes delayed call and timers', done => {
    const fn = jest.fn(v => v)
    const stable = stabilize(fn, {
      delay: 10,
      rejectOnCancel: false
    })
    const stableWithReject = stabilize(fn, {
      delay: {period: 10, count: 1},
      rejectOnCancel: true
    })
    const resultWithReject = Promise.all([stableWithReject('foo'), stableWithReject('bar')])
    const result = Promise.all([stable('foo'), stable('bar')])

    resultWithReject
      .catch(e => {
        expect(e.message).toBe(REJECTED_ON_CANCEL)
      })
    result
      .then(() => expect(true).toBeFalsy())
      .catch(() => expect(true).toBeFalsy())

    stable.cancel()
    stableWithReject.cancel()

    setTimeout(() => {
      expect(fn).not.toHaveBeenCalled()
      done()
    }, 15)
  })
})
