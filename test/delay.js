import {delay} from '../src'

describe('delay', () => {
  it('wrapper returns function', () => {
    expect(delay(() => {}, {delay: 10})).toEqual(expect.any(Function))
  })

  it('throws error on invalid input', () => {
    expect(() => delay({})).toThrow('Target must be a function')
  })

  it('returns a promise', done => {
    let foo

    expect(delay(() => { foo = 'bar' }, 10)()).toEqual(expect.any(Promise))
    setTimeout(() => {
      expect(foo).toBe('bar')
      done()
    }, 10)

    expect(foo).toBeUndefined()
  })

  it('passes args to origin fn', async () => {
    const fn = jest.fn(v => v)
    const delayed = delay(fn, 10)
    const bar = await delayed('foo')

    expect(bar).toBe('foo')
    expect(fn).toBeCalledWith('foo')
  })
})
