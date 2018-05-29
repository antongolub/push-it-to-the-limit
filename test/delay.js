import {delay, REJECTED_ON_CANCEL} from '../src'

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

  it('`flush` invokes all delayed calls immediately', done => {
    const fn = jest.fn(v => v)
    const delayed = delay(fn, 1000000000)

    const result = Promise.all([delayed('foo'), delayed('bar')])
    result
      .then(([foo, bar]) => {
        expect(foo).toBe('foo')
        expect(bar).toBe('bar')
        expect(fn).toBeCalledWith('foo')
        expect(fn).toBeCalledWith('bar')
        done()
      })
    delayed.flush()
  })

  it('`cancel` removes delayed calls stack and timers', done => {
    const fn = jest.fn(v => v)
    const delayed = delay(fn, {
      delay: 10,
      rejectOnCancel: false
    })
    const delayedWithReject = delay(fn, {
      delay: 10,
      rejectOnCancel: true
    })
    const resultWithReject = Promise.all([delayedWithReject('foo'), delayedWithReject('bar')])
    const result = Promise.all([delayed('foo'), delayed('bar')])

    resultWithReject
      .then(() => expect(true).toBeFalsy())
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
