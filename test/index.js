import {delay, throttle, debounce, ratelimit, stabilize} from '../dist/bundle.es5'

describe('index', () => {
  it('exposes factories', () => {
    const cases = [delay, throttle, debounce, ratelimit, stabilize]

    cases.forEach(factory => {
      expect(factory).toEqual(expect.any(Function))
    })
  })
})
