import {delay} from '../src'

describe('index', () => {
  it('exposes factories', () => {
    const cases = [delay]

    cases.forEach(factory => {
      expect(factory).toEqual(expect.any(Function))
    })
  })
})
