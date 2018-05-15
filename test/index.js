import {delay, throttle, debounce, ratelimit} from '../src'

describe('index', () => {
  it('exposes factories', () => {
    const cases = [delay, throttle, debounce, ratelimit]

    cases.forEach(factory => {
      expect(factory).toEqual(expect.any(Function))
    })
  })
})
