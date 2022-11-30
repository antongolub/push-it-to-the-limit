// @ts-ignore
import { debounce, delay, ratelimit, repeat, stabilize, throttle } from '../../../target/es5/index.js'

describe('index', () => {
  it('exposes factories', () => {
    const cases = [delay, throttle, debounce, ratelimit, stabilize, repeat]

    cases.forEach(factory => {
      expect(factory).toEqual(expect.any(Function))
    })
  })
})
