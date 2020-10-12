import { debounce, REJECTED_ON_CANCEL } from '../../../main/js'
import 'babel-polyfill'

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

  it('defers the call', done => {
    const fn = jest.fn(v => v)
    const debounced = debounce(fn, 10)

    for (let i = 0; i < 5; i++) {
      (v => setTimeout(() => debounced(v), v * 5))(i)
    }

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(4)
      done()
    }, 40)
  })

  it('handles `complex delays`', done => {
    const fn = jest.fn(v => v)
    const delay = { period: 10, count: 2 }
    const debounced = debounce(fn, delay)

    const foo = debounced('foo')
    const bar = debounced('bar')
    const baz = debounced('baz')
    const qux = debounced('qux')

    expect(foo).not.toBe(bar)
    expect(bar).toBe(baz)
    expect(bar).toBe(qux)

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenCalledWith('baz')
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
    const debounced = debounce(fn, 100000, { maxWait: 10 })

    debounced('foo')
    setTimeout(() => debounced('bar'), 4)
    setTimeout(() => debounced('baz'), 8)

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('baz')

      done()
    }, 14)
  })

  it('properly handles `leading` option', done => {
    const fn = jest.fn(v => v)
    const debounced = debounce(fn, 10, { leading: true })

    debounced('foo').then(v => expect(v).toBe('foo'))
    debounced('bar').then(v => expect(v).toBe('qux'))
    debounced('baz').then(v => expect(v).toBe('qux'))
    debounced('qux').then(v => expect(v).toBe('qux'))

    setTimeout(() => {
      debounced('quxx').then(v => expect(v).toBe('quxx'))
      debounced('barr').then(v => expect(v).toBe('bazz'))
      debounced('bazz').then(v => expect(v).toBe('bazz'))
    }, 15)

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(4)
      expect(fn).toHaveBeenCalledWith('foo')
      expect(fn).toHaveBeenCalledWith('qux')
      expect(fn).toHaveBeenCalledWith('quxx')
      expect(fn).toHaveBeenCalledWith('bazz')

      done()
    }, 30)
  })

  it('handles `leading` with complex delays', done => {
    const fn = jest.fn(v => v)
    const debounced = debounce(fn, { period: 10, count: 2 }, { leading: true })

    debounced('foo').then(v => expect(v).toBe('foo'))
    debounced('bar').then(v => expect(v).toBe('bar'))
    debounced('baz').then(v => expect(v).toBe('qux'))
    debounced('qux').then(v => expect(v).toBe('qux'))

    setTimeout(() => {
      debounced('fooo').then(v => expect(v).toBe('fooo'))
      debounced('barr').then(v => expect(v).toBe('barr'))
      debounced('bazz').then(v => expect(v).toBe('quxx'))
      debounced('quxx').then(v => expect(v).toBe('quxx'))
    }, 12)

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(6)
      expect(fn).toHaveBeenCalledWith('foo')
      expect(fn).toHaveBeenCalledWith('bar')
      expect(fn).toHaveBeenCalledWith('qux')
      expect(fn).toHaveBeenCalledWith('fooo')
      expect(fn).toHaveBeenCalledWith('barr')
      expect(fn).toHaveBeenCalledWith('quxx')

      done()
    }, 26)
  })

  it('`flush` invokes target function immediately', done => {
    const fn = jest.fn(v => v)
    const debounced = debounce(fn, { delay: 10000 })

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
