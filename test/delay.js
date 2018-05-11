import delay from '../src/delay'

describe('delay', () => {
  it('wrapper returns function', () => {
    expect(delay(() => {})).toEqual(expect.any(Function))
  })

  it('throws error on invalid input', () => {
    expect(() => delay({})).toThrow('Target must be a function')
  })

  it('returns a promise', () => {
    expect(delay(() => {}, 10)()).toEqual(expect.any(Promise))
  })

  it('passes args to origin fn', async () => {
    const fn = jest.fn(v => v)
    const delayed = delay(fn, 10)
    const bar = await delayed('foo')

    expect(bar).toBe('foo')
    expect(fn).toBeCalledWith('foo')
  })
})
