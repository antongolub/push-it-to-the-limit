import { delay, REJECTED_ON_CANCEL } from '../../../main/ts'
import { ITarget, IWrapperOpts } from '../../../main/ts/interface'
import { expect, it, describe, mock } from '@abstractest/core'

const noop = () => { /* noop */ }
const echo = <T>(v: T): T => v

describe('delay', () => {
  it('wrapper returns function', () => {
    expect(delay(noop, { delay: 10 })).toEqual(expect.any(Function))
  })

  it('throws error on invalid input', () => {
    expect(() => delay({} as ITarget, {} as IWrapperOpts)).toThrow('Target must be a function')
  })

  it('returns a promise', done => {
    let foo: string | undefined

    expect(delay(() => { foo = 'bar' }, 10)()).toEqual(expect.any(Promise))
    setTimeout(() => {
      expect(foo).toBe('bar')
      done()
    }, 10)

    expect(foo).toBeUndefined()
  })

  it('passes args to origin fn', async () => {
    const fn = mock.fn(echo)
    const delayed = delay(fn, 10)
    const bar = await delayed('foo')

    expect(bar).toBe('foo')
    expect(fn).toHaveBeenCalledWith('foo')
  })

  it('`flush` invokes all delayed calls immediately', done => {
    const fn = mock.fn(echo)
    const delayed = delay(fn, 1_000_000_000)

    const result = Promise.all([delayed('foo'), delayed('bar')])
    result
      .then(([foo, bar]) => {
        expect(foo).toBe('foo')
        expect(bar).toBe('bar')
        expect(fn).toHaveBeenCalledWith('foo')
        expect(fn).toHaveBeenCalledWith('bar')
        done()
      })
    delayed.flush()
  })

  it('`cancel` removes delayed calls stack and timers', done => {
    const fn = mock.fn(echo)
    const delayed = delay(fn, {
      delay: 10,
      rejectOnCancel: false
    })
    const delayedWithReject = delay(fn, {
      delay: { period: 10, count: 1 },
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
