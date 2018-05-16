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

    const rep = repeat(target, delay, context)
    rep(1)

    setTimeout(() => rep(4), 20)
    setTimeout(() => {
      expect(context.i > 9).toBeTruthy()
      done()
    }, 40)
  })
})
