import {repeat} from '../src'

describe('repeat', () => {
  it('looks to be working', done => {
    // rest of tests are placed in other repo: https://github.com/antongolub/repeater/tree/master/test
    const context = {
      i: 0
    }
    const delay = 10
    function target (step) {
      this.i += step
    }

    const rep = repeat(target, {delay, context})
    rep(1)

    setTimeout(() => rep(4), 20)
    setTimeout(() => {
      expect(context.i > 9).toBeTruthy()
      clearTimeout(rep.timeout)
      done()
    }, 40)
  })

  it('`flush` invokes target fn immediately', () => {
    const fn = jest.fn(v => v)
    const rep = repeat(fn, {delay: 100})

    rep(1)
    rep.flush()

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('`cancel` breaks auto-invocation loop', done => {
    const fn = jest.fn(v => v)
    const rep = repeat(fn, {delay: 5})

    rep(1)
    rep.cancel()

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(1)

      done()
    }, 20)
  })
})
