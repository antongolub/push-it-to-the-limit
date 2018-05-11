// @flow

import type {IAny} from './interface'

export function assert (condition: boolean, text?: string = 'Assertion error'): void {
  if (!condition) {
    throw new Error(text)
  }
}

export function assertFn (target: IAny): void {
  assert(typeof target === 'function', 'Target must be a function')
}
