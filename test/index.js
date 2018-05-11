import {delay, throttle} from '../src'

describe('index', () => {
  it('exposes factories', () => {
    const cases = [delay, throttle]

    cases.forEach(factory => {
      expect(factory).toEqual(expect.any(Function))
    })
  })
})
