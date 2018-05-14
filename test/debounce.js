import debounce from '../src/debounce'

describe('debounce', () => {
  it('wrapper returns function', () => {
    expect(debounce(() => {})).toEqual(expect.any(Function))
  })

  it('throws error on invalid input', () => {
    expect(() => debounce({})).toThrow('Target must be a function')
  })

  it('groups multiple sequential calls in a single one', done => {
    const fn = jest.fn(v => v)
    const debounced = debounce(fn, 10)

    const foo = debounced('bar')
    const baz = debounced('qux')

    baz.then(v => expect(v).toBe('qux'))
    foo.then(v => expect(v).toBe('qux'))

    expect(foo).toBe(baz)

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('qux')
      done()
    }, 12)
  })

  it('passes same promise as a result', async () => {
    const debounced = debounce(v => v, 1)
    const [foo, baz] = await Promise.all([debounced('bar'), debounced('qux')])

    expect(foo).toBe(baz)
    expect(foo).toBe('qux')
  })
})
