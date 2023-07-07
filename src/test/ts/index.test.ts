import { debounce, delay, ratelimit, repeat, stabilize, throttle } from '../../../target/esm/index.mjs'
import { expect, it, describe } from '@abstractest/core'

describe('index', () => {
  it('exposes factories', () => {
    const cases = [delay, throttle, debounce, ratelimit, stabilize, repeat]

    cases.forEach(factory => {
      expect(factory).toEqual(expect.any(Function))
    })
  })
})
