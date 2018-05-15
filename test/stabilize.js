import {stabilize} from '../src'

describe('stabilize', () => {
  it('wrapper returns function', () => {
    expect(stabilize(() => {
    })).toEqual(expect.any(Function))
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
})
