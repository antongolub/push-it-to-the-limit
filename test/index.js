import {delay, throttle, debounce} from '../src'

describe('index', () => {
  it('exposes factories', () => {
    const cases = [delay, throttle, debounce]

    cases.forEach(factory => {
      expect(factory).toEqual(expect.any(Function))
    })
  })
})
