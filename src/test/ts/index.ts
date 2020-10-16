// @ts-ignore
import { delay, throttle, debounce, ratelimit, stabilize, repeat } from '../../../target/es5/bundle'

describe('index', () => {
  it('exposes factories', () => {
    const cases = [delay, throttle, debounce, ratelimit, stabilize, repeat]

    cases.forEach(factory => {
      expect(factory).toEqual(expect.any(Function))
    })
  })
})
