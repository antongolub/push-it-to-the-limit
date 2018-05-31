import {debounce, REJECTED_ON_CANCEL} from '../../src'

describe('debounce', () => {
  it('wrapper returns function', () => {
    expect(debounce(() => {}, 10)).toEqual(expect.any(Function))
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

  it('supports `maxWait` option', done => {
    const fn = jest.fn(v => v)
    const debounced = debounce(fn, 100000, {maxWait: 10})

    debounced('foo')
    debounced('bar')
    debounced('baz')

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('baz')

      done()
    }, 15)
  })

  it('properly handles `leading` option', done => {
    const fn = jest.fn(v => v)
    const debounced = debounce(fn, 10, {leading: true})

    debounced('foo').then(v => expect(v).toBe('foo'))
    debounced('bar').then(v => expect(v).toBe('baz'))
    debounced('baz').then(v => expect(v).toBe('baz'))

    setTimeout(() => {
      debounced('qux').then(v => expect(v).toBe('qux'))
    }, 11)

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(3)
      expect(fn).toHaveBeenCalledWith('foo')
      expect(fn).toHaveBeenCalledWith('baz')
      expect(fn).toHaveBeenCalledWith('qux')

      done()
    }, 15)
  })

  it('`flush` invokes target function immediately', done => {
    const fn = jest.fn(v => v)
    const debounced = debounce(fn, {delay: 10000})

    debounced('foo').then(v => expect(v).toBe('bar'))
    debounced('bar').then(v => expect(v).toBe('bar'))

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('bar')
      expect(fn).toHaveBeenCalledWith('bar')

      done()
    }, 10)

    debounced.flush()
    debounced.flush()
  })

  it('`cancel` removes delayed call and timers', done => {
    const fn = jest.fn(v => v)
    const delayed = debounce(fn, {
      delay: 10,
      rejectOnCancel: false
    })
    const delayedWithReject = debounce(fn, {
      delay: 10,
      rejectOnCancel: true
    })
    const resultWithReject = Promise.all([delayedWithReject('foo'), delayedWithReject('bar')])
    const result = Promise.all([delayed('foo'), delayed('bar')])

    resultWithReject
      .catch(e => {
        expect(e.message).toBe(REJECTED_ON_CANCEL)
      })
    result
      .then(() => expect(true).toBeFalsy())
      .catch(() => expect(true).toBeFalsy())

    delayed.cancel()
    delayedWithReject.cancel()

    setTimeout(() => {
      expect(fn).not.toHaveBeenCalled()
      done()
    }, 15)
  })
})
